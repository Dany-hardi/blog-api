const db = require("../config/db");

/**
 * Sérialise les tags (array → JSON string) avant stockage.
 * Désérialise (JSON string → array) à la lecture.
 */
const serialize = (article) => ({
  ...article,
  tags: JSON.stringify(article.tags ?? []),
});

const deserialize = (row) => {
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags ?? "[]"),
  };
};

const ArticleModel = {
  /** Crée un article et retourne l'objet complet */
  create({ titre, contenu, auteur, date, categorie, tags }) {
    const stmt = db.prepare(`
      INSERT INTO articles (titre, contenu, auteur, date, categorie, tags)
      VALUES (@titre, @contenu, @auteur, @date, @categorie, @tags)
    `);
    const result = stmt.run(
      serialize({ titre, contenu, auteur, date, categorie, tags })
    );
    return ArticleModel.findById(result.lastInsertRowid);
  },

  /** Retourne tous les articles, avec filtres optionnels */
  findAll({ categorie, auteur, date } = {}) {
    let query = "SELECT * FROM articles WHERE 1=1";
    const params = {};

    if (categorie) {
      query += " AND LOWER(categorie) = LOWER(@categorie)";
      params.categorie = categorie;
    }
    if (auteur) {
      query += " AND LOWER(auteur) = LOWER(@auteur)";
      params.auteur = auteur;
    }
    if (date) {
      query += " AND date = @date";
      params.date = date;
    }

    query += " ORDER BY id DESC";
    return db.prepare(query).all(params).map(deserialize);
  },

  /** Retourne un article par son ID */
  findById(id) {
    const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(id);
    return deserialize(row);
  },

  /** Met à jour les champs fournis d'un article existant */
  update(id, fields) {
    const allowed = ["titre", "contenu", "categorie", "tags"];
    const updates = Object.keys(fields).filter((k) => allowed.includes(k));

    if (updates.length === 0) return ArticleModel.findById(id);

    const setClause = updates.map((k) => `${k} = @${k}`).join(", ");
    const values = {};
    updates.forEach((k) => {
      values[k] = k === "tags" ? JSON.stringify(fields[k]) : fields[k];
    });
    values.id = id;

    db.prepare(`UPDATE articles SET ${setClause} WHERE id = @id`).run(values);
    return ArticleModel.findById(id);
  },

  /** Supprime un article, retourne true si supprimé */
  delete(id) {
    const result = db
      .prepare("DELETE FROM articles WHERE id = ?")
      .run(id);
    return result.changes > 0;
  },

  /** Recherche plein-texte sur titre et contenu */
  search(query) {
    const like = `%${query}%`;
    return db
      .prepare(
        "SELECT * FROM articles WHERE titre LIKE ? OR contenu LIKE ? ORDER BY id DESC"
      )
      .all(like, like)
      .map(deserialize);
  },
};

module.exports = ArticleModel;
