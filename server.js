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

// Route alternative pour le sitemap (contourner le cache Google)
app.get('/sitemap-v2.xml', (req, res) => {
    res.redirect(301, '/sitemap.xml');
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

// Route pour le sitemap
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(__dirname + '/public/sitemap.xml');
});

// Route pour robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(__dirname + '/public/robots.txt');
});

// Route pour l'article blog
app.get('/blog/guide-franc-cfa', (req, res) => {
    res.sendFile(__dirname + '/public/blog/guide-franc-cfa.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`✅ Serveur sur http://localhost:${PORT}`);
    console.log(`🌍 Convertisseur XOF prêt !`);
});
