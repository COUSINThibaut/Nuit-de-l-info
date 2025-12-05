# 🚀 Guide de Déploiement

## Options de Déploiement

### Option 1 : Vercel (Recommandé) ⭐

**Avantages :**
- Déploiement automatique depuis Git
- SSL gratuit
- CDN global
- Preview deployments
- Zero configuration

**Étapes :**

1. **Créer un compte sur [Vercel](https://vercel.com)**

2. **Installer Vercel CLI**
```bash
npm install -g vercel
```

3. **Se connecter**
```bash
vercel login
```

4. **Déployer**
```bash
cd cartedestalents
vercel
```

5. **Configuration automatique détectée**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

6. **URL de production**
```
https://carte-des-talents.vercel.app
```

---

### Option 2 : Netlify

**Avantages :**
- Interface intuitive
- Formulaires intégrés
- Functions serverless
- Analytics

**Étapes :**

1. **Créer un compte sur [Netlify](https://netlify.com)**

2. **Connecter le repository Git**
   - New site from Git
   - Choisir GitHub/GitLab/Bitbucket

3. **Configuration Build**
```
Build command: npm run build
Publish directory: dist
```

4. **Variables d'environnement (si nécessaire)**
```
NODE_VERSION=18
```

5. **Déployer**
   - Cliquer sur "Deploy site"

**netlify.toml (optionnel) :**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3 : GitHub Pages

**Avantages :**
- Gratuit
- Intégration GitHub
- Simple pour projets statiques

**Étapes :**

1. **Installer gh-pages**
```bash
npm install -D gh-pages
```

2. **Modifier package.json**
```json
{
  "homepage": "https://votre-username.github.io/carte-des-talents",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Modifier vite.config.ts**
```typescript
export default defineConfig({
  base: '/carte-des-talents/',
  plugins: [react()],
  // ...
})
```

4. **Déployer**
```bash
npm run deploy
```

---

### Option 4 : Railway

**Avantages :**
- Backend et frontend ensemble
- Base de données incluse
- Simple à utiliser

**Étapes :**

1. **Créer un compte sur [Railway](https://railway.app)**

2. **Nouveau projet**
   - Deploy from GitHub repo

3. **Configuration automatique**
   - Railway détecte Vite automatiquement

4. **URL personnalisée**
   - Settings → Generate Domain

---

### Option 5 : Self-Hosted (VPS)

**Pour les utilisateurs avancés**

**Prérequis :**
- VPS (DigitalOcean, Linode, AWS EC2)
- Nginx
- Node.js

**Étapes :**

1. **Builder le projet localement**
```bash
npm run build
```

2. **Uploader le dossier dist/ vers le VPS**
```bash
scp -r dist/* user@votre-server:/var/www/carte-des-talents
```

3. **Configuration Nginx**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/carte-des-talents;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. **Redémarrer Nginx**
```bash
sudo systemctl restart nginx
```

---

## 🔧 Configuration Pré-Déploiement

### 1. Variables d'Environnement

**Créer `.env.production`**
```env
VITE_API_URL=https://api.votre-domaine.com
VITE_GA_ID=G-XXXXXXXXXX
```

**Utiliser dans le code**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### 2. Optimisation du Build

**vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
```

### 3. Meta Tags pour SEO

**index.html**
```html
<head>
  <title>Carte des Talents - Plateforme Étudiante</title>
  <meta name="description" content="Découvrez et connectez-vous avec les talents étudiants">
  <meta property="og:title" content="Carte des Talents">
  <meta property="og:description" content="Plateforme de mise en relation des talents étudiants">
  <meta property="og:image" content="/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
```

### 4. robots.txt

**public/robots.txt**
```
User-agent: *
Allow: /
Sitemap: https://votre-domaine.com/sitemap.xml
```

---

## 📊 Monitoring Post-Déploiement

### Google Analytics

**1. Créer une propriété GA4**

**2. Ajouter le script dans index.html**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Sentry pour Error Tracking

**1. Installer Sentry**
```bash
npm install @sentry/react
```

**2. Configurer dans main.tsx**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "votre-dsn",
  environment: "production",
});
```

---

## ✅ Checklist de Déploiement

### Avant le Build
- [ ] Tous les tests passent (si configurés)
- [ ] Aucune erreur TypeScript
- [ ] Aucun warning ESLint
- [ ] Variables d'environnement configurées
- [ ] Meta tags SEO ajoutés

### Après le Déploiement
- [ ] Site accessible via HTTPS
- [ ] Toutes les pages fonctionnent
- [ ] Images chargent correctement
- [ ] Responsive testé (mobile, tablet, desktop)
- [ ] Formulaires fonctionnels
- [ ] Liens externes ouvrent correctement
- [ ] Performance testée (Lighthouse)

### Monitoring
- [ ] Analytics configuré
- [ ] Error tracking actif
- [ ] Logs accessibles
- [ ] Uptime monitoring (UptimeRobot, etc.)

---

## 🎯 Performance Optimization

### 1. Lighthouse Score Cible

- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 95
- **SEO:** > 90

### 2. Image Optimization

**Utiliser des formats modernes**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### 3. Lazy Loading

**Déjà implémenté**
```html
<img loading="lazy" src="..." alt="...">
```

### 4. Compression

**Vérifier la compression gzip/brotli**
```bash
# Test avec curl
curl -H "Accept-Encoding: gzip" -I https://votre-domaine.com
```

---

## 🔒 Sécurité

### Headers HTTP

**Configuration Nginx**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

---

## 📱 PWA (Progressive Web App) - Optionnel

**1. Installer le plugin**
```bash
npm install -D vite-plugin-pwa
```

**2. Configurer vite.config.ts**
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Carte des Talents',
        short_name: 'Talents',
        description: 'Plateforme de mise en relation des talents étudiants',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## 🆘 Troubleshooting

### Problème : Routes 404 après refresh

**Solution : Configurer les redirections**

**Vercel (vercel.json)**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Netlify (_redirects)**
```
/*    /index.html   200
```

### Problème : Build échoue

**Vérifier :**
```bash
# Nettoyer node_modules
rm -rf node_modules
npm install

# Nettoyer le cache
rm -rf dist
npm run build
```

### Problème : Images ne chargent pas

**Vérifier les chemins**
```typescript
// ✅ Bon
<img src="/assets/image.png" />

// ❌ Mauvais (chemin absolu local)
<img src="file:///Users/.../image.png" />
```

---

## 🎉 Commandes de Déploiement Rapides

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### GitHub Pages
```bash
npm run deploy
```

---

## 📚 Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Guide](https://pages.github.com/)

---

**✨ Votre plateforme est maintenant prête pour le monde !**
