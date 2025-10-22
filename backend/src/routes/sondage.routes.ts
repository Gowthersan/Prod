// backend/src/routes/sondage.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { obtenirMaReponseSondage, creerReponseSondage } from '../controllers/sondage.controller.js';

const router = Router();

// ====================================
// 🔒 Routes protégées (authentification requise)
// ====================================

/**
 * GET /api/sondage/reponses/moi?cleQuestionnaire=acquisition_channel_v1
 * Vérifie si l'utilisateur connecté a déjà répondu au sondage
 * Retourne 200 si oui, 404 si non
 */
router.get('/reponses/moi', authenticate, obtenirMaReponseSondage);

/**
 * POST /api/sondage/reponses
 * Enregistre la réponse de l'utilisateur au sondage
 * Body: { cleQuestionnaire, choixSelectionne, texteAutre?, commentaire?, meta? }
 */
router.post('/reponses', authenticate, creerReponseSondage);

export default router;
