const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const articleRoutes = require("./routes/articleRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Frontend statique ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ─── Swagger ─────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API – INF222 TAF1",
      version: "1.0.0",
      description:
        "API REST pour la gestion d'un blog simple. " +
        "Développée dans le cadre du TAF1 du cours INF222 – EC1 (Développement Backend), " +
        "Université de Yaoundé I.",
      contact: {
        name: "Ngankeu Takou Daniel Wilfried",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Serveur de développement local",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/articles", articleRoutes);

// Route racine info API
app.get("/api", (req, res) => {
  res.json({
    message: "Blog API – INF222 TAF1",
    documentation: `http://localhost:${PORT}/api-docs`,
    frontend: `http://localhost:${PORT}`,
    endpoints: {
      "GET    /api/articles":              "Lister tous les articles",
      "GET    /api/articles/search?query": "Rechercher des articles",
      "GET    /api/articles/:id":          "Récupérer un article",
      "POST   /api/articles":              "Créer un article",
      "PUT    /api/articles/:id":          "Modifier un article",
      "DELETE /api/articles/:id":          "Supprimer un article",
    },
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' introuvable.` });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Blog API démarrée sur http://localhost:${PORT}`);
  console.log(`🌐  Interface web     : http://localhost:${PORT}`);
  console.log(`📖  Swagger UI        : http://localhost:${PORT}/api-docs`);
});

module.exports = app;
