import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

let cachedRates = null;
let lastUpdate = null;
const CACHE_DURATION = 3600000;

const API_URL = 'https://api.exchangerate-api.com/v4/latest/XOF';

// ============================================
// SITEMAP DYNAMIQUE (généré à la demande)
// ============================================
app.get(['/sitemap.xml', '/sitemap-v2.xml', '/sitemap-:timestamp.xml'], (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://convertisseur-xof.vercel.app/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://convertisseur-xof.vercel.app/blog</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>`;

    // Headers pour éviter le cache
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).send(sitemap);
});

app.get('/api/rates', async (req, res) => {
    try {
        const now = Date.now();

        if (cachedRates && lastUpdate && (now - lastUpdate) < CACHE_DURATION) {
            return res.json({
                rates: cachedRates,
                lastUpdate: new Date(lastUpdate).toISOString(),
                cached: true
            });
        }

        const response = await fetch(API_URL);
        const data = await response.json();

        const xofRates = {
            EUR: 1 / data.rates.EUR,
            USD: 1 / data.rates.USD,
            GBP: 1 / data.rates.GBP,
            CAD: 1 / data.rates.CAD,
            CHF: 1 / data.rates.CHF,
            XOF: 1
        };

        cachedRates = xofRates;
        lastUpdate = now;

        res.json({
            rates: xofRates,
            lastUpdate: new Date(lastUpdate).toISOString(),
            cached: false
        });

    } catch (error) {
        console.error('Erreur:', error);

        const defaultRates = {
            EUR: 655.957,
            USD: 615.234,
            GBP: 780.456,
            CAD: 442.123,
            CHF: 695.234,
            XOF: 1
        };

        res.json({
            rates: defaultRates,
            lastUpdate: new Date().toISOString(),
            error: 'Taux par défaut',
            cached: false
        });
    }
});

// Route pour le fichier de vérification Google
app.get('/google5b9d6a33a63bfe61.html', (req, res) => {
    res.sendFile(__dirname + '/public/google5b9d6a33a63bfe61.html');
});

// Route pour robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(__dirname + '/public/robots.txt');
});

// Route pour la page blog
app.get('/blog', (req, res) => {
    res.sendFile(__dirname + '/public/blog.html');
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`✅ Serveur sur http://localhost:${PORT}`);
    console.log(`🌍 Convertisseur XOF prêt !`);
});
