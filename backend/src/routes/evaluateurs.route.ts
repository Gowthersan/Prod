// src/routes/evaluateurs.route.ts
import { Router } from 'express';
import { EvaluateursController } from '../controllers/evaluateurs.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';


export const evaluateursRouter = Router();

// Toutes ces routes passent par l’auth
evaluateursRouter.use(authenticate);

/* ----------------------------- ADMIN: CRUD ----------------------------- */
evaluateursRouter.post('/', EvaluateursController.creer);
evaluateursRouter.get('/', EvaluateursController.lister);
evaluateursRouter.patch('/:id/suspendre', EvaluateursController.suspendre);
evaluateursRouter.patch('/:id/reactiver', EvaluateursController.reactiver);
evaluateursRouter.delete('/:id', EvaluateursController.supprimer);

/* ----------------------- ADMIN: AFFECTATIONS, EXT ---------------------- */
evaluateursRouter.post('/affecter', EvaluateursController.affecter);
evaluateursRouter.delete(
    '/desaffecter/:idSession/:idOffre/:idEvaluateur',
    EvaluateursController.desaffecter
);
evaluateursRouter.post('/prolonger', EvaluateursController.prolonger);

/* ----------------------- ÉVALUATEUR: MON TRAVAIL ---------------------- */
evaluateursRouter.get('/sessions/:idSession/offres', EvaluateursController.mesOffres);
evaluateursRouter.post('/disponibilite', EvaluateursController.disponibilite);
evaluateursRouter.post('/evaluation', EvaluateursController.soumettreEvaluation);
