# Guide de déploiement — Railway

Ce guide couvre le déploiement complet du **Blog API** sur [Railway](https://railway.app),
une plateforme cloud gratuite adaptée aux projets Node.js étudiants.

---

## Prérequis

- Un compte GitHub (gratuit)
- Un compte Railway connecté à GitHub → https://railway.app
- Le projet `blog-api` poussé sur un dépôt GitHub public ou privé

---

## Étape 1 — Préparer le projet

### 1.1 Vérifier le `package.json`

Railway exécute `npm start` par défaut. Assurez-vous que le script `start` est présent :

```json
"scripts": {
  "start": "node src/app.js"
}
```

### 1.2 Déclarer la version de Node.js (recommandé)

Ajoutez dans `package.json` :

```json
"engines": {
  "node": ">=18.0.0"
}
```

### 1.3 Adapter le port

Railway injecte automatiquement la variable d'environnement `PORT`.
Le code utilise déjà `process.env.PORT || 3000` — **rien à changer**.

### 1.4 Adapter la base de données SQLite

SQLite écrit un fichier `.db` sur le disque. Railway propose un **volume persistant**
pour conserver ce fichier entre les déploiements.

> ⚠️ Sans volume, la base de données est **réinitialisée à chaque déploiement**.
> Pour un TAF académique, c'est acceptable. Pour la production, utilisez PostgreSQL (voir section 5).

---

## Étape 2 — Pousser sur GitHub

```bash
cd blog-api

# Initialiser git si ce n'est pas fait
git init
git add .
git commit -m "feat: initial blog API"

# Créer le dépôt sur GitHub puis :
git remote add origin https://github.com/Dany-hardi/blog-api.git
git branch -M main
git push -u origin main
```

---

## Étape 3 — Déployer sur Railway

### 3.1 Créer un nouveau projet

1. Connectez-vous sur https://railway.app
2. Cliquez **New Project**
3. Sélectionnez **Deploy from GitHub repo**
4. Choisissez votre dépôt `blog-api`
5. Railway détecte automatiquement Node.js et lance le déploiement

### 3.2 Obtenir l'URL publique

1. Dans le dashboard Railway, cliquez sur votre service
2. Allez dans l'onglet **Settings**
3. Sous **Networking**, cliquez **Generate Domain**
4. Railway génère une URL de type `https://blog-api-production-xxxx.up.railway.app`

### 3.3 Tester le déploiement

```bash
# Tester l'API
curl https://votre-url.up.railway.app/api/articles

# Accéder à l'interface web
# Ouvrez dans le navigateur : https://votre-url.up.railway.app

# Accéder à Swagger
# Ouvrez : https://votre-url.up.railway.app/api-docs
```

---

## Étape 4 — Volume persistant pour SQLite (optionnel)

Sans volume, la DB est réinitialisée à chaque redéploiement.

1. Dans Railway, allez dans votre projet
2. Cliquez **Add Service → Volume**
3. Montez le volume sur `/app` (ou le répertoire racine de votre projet)
4. Railway conservera le fichier `blog.db` entre les déploiements

---

## Étape 5 — Migrer vers PostgreSQL (production)

Pour une vraie persistance, remplacez SQLite par le plugin PostgreSQL de Railway :

### 5.1 Ajouter PostgreSQL

1. Dans Railway → **Add Service → Database → PostgreSQL**
2. Railway injecte automatiquement `DATABASE_URL` dans les variables d'environnement

### 5.2 Adapter le code

Installez `pg` :
```bash
npm install pg
```

Remplacez `src/config/db.js` :

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Créer la table si elle n'existe pas
pool.query(`
  CREATE TABLE IF NOT EXISTS articles (
    id        SERIAL PRIMARY KEY,
    titre     TEXT    NOT NULL,
    contenu   TEXT    NOT NULL,
    auteur    TEXT    NOT NULL,
    date      DATE    NOT NULL DEFAULT CURRENT_DATE,
    categorie TEXT    NOT NULL DEFAULT 'Général',
    tags      JSONB   NOT NULL DEFAULT '[]'
  )
`);

module.exports = pool;
```

> Les requêtes dans `article.js` doivent être adaptées en syntaxe async/await
> avec `pool.query()` à la place de `db.prepare().run()`.

---

## Étape 6 — Variables d'environnement

Dans Railway → **Variables** → Ajoutez si nécessaire :

| Variable     | Valeur exemple          | Usage                            |
|--------------|-------------------------|----------------------------------|
| `PORT`       | Injecté automatiquement | Port d'écoute Express            |
| `NODE_ENV`   | `production`            | Active le mode production        |
| `DATABASE_URL`| Injectée par PostgreSQL | Connexion DB en production       |

---

## Résumé des URLs après déploiement

| Ressource          | URL                                                      |
|--------------------|----------------------------------------------------------|
| Interface web      | `https://votre-url.up.railway.app/`                     |
| API REST           | `https://votre-url.up.railway.app/api/articles`         |
| Documentation Swagger | `https://votre-url.up.railway.app/api-docs`          |

---

## Dépannage fréquent

| Problème                        | Solution                                                  |
|---------------------------------|-----------------------------------------------------------|
| `Error: Cannot find module`     | Vérifiez que `node_modules` n'est pas dans le `.gitignore` ou relancez `npm install` |
| `Port already in use`           | Railway gère le port automatiquement, ne fixez pas 3000 en dur |
| La DB se vide à chaque deploy   | Ajoutez un volume persistant ou migrez vers PostgreSQL    |
| `CORS error` depuis le frontend | `cors()` est déjà activé dans `app.js`, vérifiez le domaine |
| Déploiement bloqué              | Consultez les logs dans Railway → **Deployments → View Logs** |
