const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send("Backend + DB fonctionne correctement : " + result.rows[0].now);
  } catch (error) {
    console.error("Erreur DB:", error);
    res.status(500).send("Erreur de connexion à la base de données");
  }
});

app.post("/login-simulation", async (req, res) => {
  console.log("Route /login-simulation appelée");
  console.log("Body reçu :", req.body);

  const { username, password } = req.body;

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    req.ip;

  try {
    await pool.query(
      `INSERT INTO simulation_logs (username, ip_address, status)
       VALUES ($1, $2, $3)`,
      [
        username || "inconnu",
        ip,
        "simulation pédagogique"
      ]
    );

    console.log("=== Simulation enregistrée ===");
    console.log({
      username: username || "inconnu",
      passwordCaptured: password ? "[NON STOCKÉ - SIMULATION]" : "[VIDE]",
      ip: ip,
      date: new Date().toISOString(),
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Simulation pédagogique</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div class="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold">
            !
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mt-4">
            Simulation pédagogique
          </h1>
          <p class="text-gray-600 mt-4 leading-7">
            Vous venez d’interagir avec une démonstration éducative.
          </p>
          <p class="text-gray-600 mt-2 leading-7">
            Aucun mot de passe n’a été stocké.
          </p>
          <p class="text-gray-600 mt-2 leading-7">
            Cette page montre comment une interface trompeuse peut pousser un utilisateur à partager des informations.
          </p>
          <a href="/" class="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition">
            Retour
          </a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Erreur lors de l'insertion :", error);
    res.status(500).send("Erreur serveur lors de l'enregistrement");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});