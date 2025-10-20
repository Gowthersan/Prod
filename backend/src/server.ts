import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import aapRoutes from './routes/aap.routes.js';
import authRoutes from './routes/auth.routes.js';
import demandeSubventionRoutes from './routes/demandeSubvention.routes.js';
import organisationRoutes from './routes/organisation.routes.js';
// import projetRoutes from './routes/projet.routes.js';
import supportRoutes from './routes/support.routes.js';
import { verifyEmailConfig } from './utils/mailer.js';

// 🔹 Charger les variables d'environnement
dotenv.config();

const app = express();

// 🔹 Configuration pour __dirname en mode ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/*                            🔒 Configuration CORS                           */
/* -------------------------------------------------------------------------- */

const allowedOrigins = [
  'http://localhost:4000', // Dev local
  'https://guichetnumerique.fpbg.ga',
  'http://192.168.1.99:4000', // Frontend production
  process.env.FRONT_URL,
  'http://192.168.1.99:4200' // Valeur configurable via .env
].filter(Boolean); // Supprime les valeurs undefined

app.use(
  cors({
    origin: function (origin, callback) {
      // Autoriser Postman / requêtes sans origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS bloqué pour l'origine : ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true // Autorise les cookies / tokens
  })
);

/* -------------------------------------------------------------------------- */
/*                         ⚙️ Middlewares de parsing                          */
/* -------------------------------------------------------------------------- */

// Gestion de la taille maximale des requêtes
// IMPORTANT: Ne pas parser les requêtes multipart/form-data avec express.json/urlencoded
// car cela interfère avec multer qui gère ces requêtes spécifiquement
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  // Si c'est du multipart/form-data, ne pas utiliser express.json/urlencoded
  // Laisser multer gérer ces requêtes
  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  // Pour les autres requêtes, utiliser les parsers standards
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });
});

app.use(cookieParser());

// Uploads sécurisés (pour les routes qui n'utilisent pas multer)
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    abortOnLimit: true
  })
);

/* -------------------------------------------------------------------------- */
/*                        📁 Fichiers statiques (uploads)                     */
/* -------------------------------------------------------------------------- */

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log(`📁 Fichiers statiques servis depuis : ${uploadsPath}`);

/* -------------------------------------------------------------------------- */
/*                              ❤️ Health Check                               */
/* -------------------------------------------------------------------------- */

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FPBG Backend API is running',
    timestamp: new Date().toISOString()
  });
});

/* -------------------------------------------------------------------------- */
/*                                🚀 Routes API                               */
/* -------------------------------------------------------------------------- */

app.use('/api/auth', authRoutes);
// app.use('/api/aprojet-v1', projetRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/aap', aapRoutes);
app.use('/api/demandes', demandeSubventionRoutes);
app.use('/api/support', supportRoutes);

/* -------------------------------------------------------------------------- */
/*                     🚧 Gestion des erreurs et routes 404                   */
/* -------------------------------------------------------------------------- */

app.use(notFoundHandler);
app.use(errorHandler);

/* -------------------------------------------------------------------------- */
/*                           🖥️ Démarrage du serveur                         */
/* -------------------------------------------------------------------------- */

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`✅ Serveur FPBG lancé sur le port ${PORT}`);
  console.log(`🌐 URL locale : http://localhost:${PORT}`);
  console.log(`📚 Health check : http://localhost:${PORT}/health`);

  console.log('\n📧 Vérification de la configuration email...');
  await verifyEmailConfig();
  console.log('📨 Configuration email vérifiée avec succès ✅\n');
});

export default app;
