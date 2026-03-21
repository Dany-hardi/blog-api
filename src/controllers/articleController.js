const ArticleModel = require("../models/article");

// ─── Helpers ────────────────────────────────────────────────────────────────

const isValidDate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);

// ─── Contrôleurs ────────────────────────────────────────────────────────────

/**
 * POST /api/articles
 * Crée un nouvel article.
 */
const createArticle = (req, res) => {
  const { titre, contenu, auteur, date, categorie, tags } = req.body;

  // Validation
  if (!titre || titre.trim() === "") {
    return res.status(400).json({ error: "Le titre est obligatoire." });
  }
  if (!contenu || contenu.trim() === "") {
    return res.status(400).json({ error: "Le contenu est obligatoire." });
  }
  if (!auteur || auteur.trim() === "") {
    return res.status(400).json({ error: "L'auteur est obligatoire." });
  }
  if (date && !isValidDate(date)) {
    return res
      .status(400)
      .json({ error: "Format de date invalide. Utilisez YYYY-MM-DD." });
  }
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ error: "Les tags doivent être un tableau." });
  }

  try {
    const article = ArticleModel.create({
      titre: titre.trim(),
      contenu: contenu.trim(),
      auteur: auteur.trim(),
      date: date ?? new Date().toISOString().split("T")[0],
      categorie: (categorie ?? "Général").trim(),
      tags: tags ?? [],
    });
    return res.status(201).json({ message: "Article créé avec succès.", article });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

/**
 * GET /api/articles
 * Retourne tous les articles (avec filtres optionnels).
 */
const getArticles = (req, res) => {
  const { categorie, auteur, date } = req.query;

  if (date && !isValidDate(date)) {
    return res
      .status(400)
      .json({ error: "Format de date invalide. Utilisez YYYY-MM-DD." });
  }

  try {
    const articles = ArticleModel.findAll({ categorie, auteur, date });
    return res.status(200).json({ articles });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

/**
 * GET /api/articles/search?query=texte
 * Recherche plein-texte dans titre et contenu.
 */
const searchArticles = (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return res
      .status(400)
      .json({ error: "Le paramètre 'query' est obligatoire." });
  }

  try {
    const articles = ArticleModel.search(query.trim());
    return res.status(200).json({ articles });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

/**
 * GET /api/articles/:id
 * Retourne un article par son ID.
 */
const getArticleById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "L'ID doit être un entier." });
  }

  try {
    const article = ArticleModel.findById(id);
    if (!article) {
      return res.status(404).json({ error: `Article ${id} introuvable.` });
    }
    return res.status(200).json({ article });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

/**
 * PUT /api/articles/:id
 * Met à jour un article existant.
 */
const updateArticle = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "L'ID doit être un entier." });
  }

  const existing = ArticleModel.findById(id);
  if (!existing) {
    return res.status(404).json({ error: `Article ${id} introuvable.` });
  }

  const { titre, contenu, categorie, tags } = req.body;

  if (titre !== undefined && titre.trim() === "") {
    return res.status(400).json({ error: "Le titre ne peut pas être vide." });
  }
  if (contenu !== undefined && contenu.trim() === "") {
    return res.status(400).json({ error: "Le contenu ne peut pas être vide." });
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({ error: "Les tags doivent être un tableau." });
  }

  try {
    const updated = ArticleModel.update(id, { titre, contenu, categorie, tags });
    return res
      .status(200)
      .json({ message: "Article mis à jour avec succès.", article: updated });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

/**
 * DELETE /api/articles/:id
 * Supprime un article.
 */
const deleteArticle = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "L'ID doit être un entier." });
  }

  try {
    const deleted = ArticleModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Article ${id} introuvable.` });
    }
    return res
      .status(200)
      .json({ message: `Article ${id} supprimé avec succès.` });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur.", details: err.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  searchArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
