# Blog API – INF222 TAF1

API REST backend pour la gestion d'un blog simple, développée dans le cadre du **TAF1 du cours INF222 – EC1 (Développement Backend)**, Université de Yaoundé I.

**Auteur :** Ngankeu Takou Daniel Wilfried  
**Stack :** Node.js · Express · SQLite (better-sqlite3) · Swagger UI

---

## Prérequis

- Node.js ≥ 18
- npm ≥ 9

---

## Installation

```bash
git clone https://github.com/Dany-hardi/blog-api.git
cd blog-api
npm install
```

---

## Démarrage

```bash
# Mode production
npm start

# Mode développement (rechargement automatique)
npm run dev
```

L'API démarre sur **http://localhost:3000**  
La documentation Swagger est disponible sur **http://localhost:3000/api-docs**

---

## Structure du projet

```
blog-api/
├── src/
│   ├── config/
│   │   └── db.js                 # Connexion SQLite + création de la table
│   ├── models/
│   │   └── article.js            # Requêtes SQL (CRUD + search)
│   ├── controllers/
│   │   └── articleController.js  # Logique métier + codes HTTP
│   ├── routes/
│   │   └── articleRoutes.js      # Définition des routes + annotations Swagger
│   └── app.js                    # Point d'entrée Express
├── blog.db                       # Base SQLite (générée automatiquement)
├── package.json
└── README.md
```

---

## Endpoints

| Méthode | Endpoint                        | Description                        |
|---------|---------------------------------|------------------------------------|
| GET     | `/api/articles`                 | Lister tous les articles           |
| GET     | `/api/articles?categorie=Tech`  | Filtrer par catégorie              |
| GET     | `/api/articles?auteur=Alice`    | Filtrer par auteur                 |
| GET     | `/api/articles?date=2026-03-20` | Filtrer par date                   |
| GET     | `/api/articles/search?query=js` | Recherche plein-texte              |
| GET     | `/api/articles/:id`             | Récupérer un article par ID        |
| POST    | `/api/articles`                 | Créer un article                   |
| PUT     | `/api/articles/:id`             | Modifier un article                |
| DELETE  | `/api/articles/:id`             | Supprimer un article               |

---

## Exemples d'utilisation

### Créer un article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Introduction à Node.js",
    "contenu": "Node.js est un environnement d'\''exécution JavaScript côté serveur...",
    "auteur": "Daniel Wilfried",
    "categorie": "Technologie",
    "tags": ["nodejs", "backend", "javascript"]
  }'
```

**Réponse (201) :**
```json
{
  "message": "Article créé avec succès.",
  "article": {
    "id": 1,
    "titre": "Introduction à Node.js",
    "contenu": "Node.js est un environnement d'exécution JavaScript côté serveur...",
    "auteur": "Daniel Wilfried",
    "date": "2026-03-20",
    "categorie": "Technologie",
    "tags": ["nodejs", "backend", "javascript"]
  }
}
```

### Lister les articles
```bash
curl http://localhost:3000/api/articles
```

### Filtrer par catégorie et date
```bash
curl "http://localhost:3000/api/articles?categorie=Technologie&date=2026-03-20"
```

### Récupérer un article par ID
```bash
curl http://localhost:3000/api/articles/1
```

### Rechercher
```bash
curl "http://localhost:3000/api/articles/search?query=Node"
```

### Modifier un article
```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Introduction à Node.js (mis à jour)",
    "tags": ["nodejs", "express", "api"]
  }'
```

### Supprimer un article
```bash
curl -X DELETE http://localhost:3000/api/articles/1
```

---

## Codes HTTP utilisés

| Code | Signification             | Cas d'utilisation                        |
|------|---------------------------|------------------------------------------|
| 200  | OK                        | Lecture, mise à jour, suppression réussies |
| 201  | Created                   | Article créé avec succès                 |
| 400  | Bad Request               | Données invalides ou manquantes          |
| 404  | Not Found                 | Article introuvable par ID               |
| 500  | Internal Server Error     | Erreur inattendue côté serveur           |

---

## Bonnes pratiques appliquées

- **Séparation des responsabilités** : config / models / controllers / routes
- **Validation des entrées** : titre, auteur, contenu obligatoires ; format de date vérifié
- **Codes HTTP sémantiques** : 201 pour création, 404 pour ressource manquante, etc.
- **Tags sérialisés en JSON** dans SQLite pour stocker des tableaux
- **Route `/search` déclarée avant `/:id`** pour éviter les conflits de routage Express
- **WAL mode** activé sur SQLite pour de meilleures performances en lecture/écriture concurrentes
