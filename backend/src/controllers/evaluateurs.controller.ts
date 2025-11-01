// src/controllers/evaluateurs.controller.ts
import { Request, Response, NextFunction } from 'express';
import evaluateursService from '../services/evaluateurs.service.js';
import { AuthRequest } from '../types/index.js';
import { CreerEvaluateurDTO } from '../types/evaluateurs.js';
import { AppError } from '../middlewares/error.middleware.js';

export class EvaluateursController {
    /* ------------------------------- HELPERS ------------------------------ */
    private static assertId(name: string, v: unknown): string {
        if (typeof v !== 'string' || !v) throw new AppError(`Paramètre ${name} manquant`, 400);
        return v;
    }

    /* ----------------------------- ADMIN ONLY ----------------------------- */
    static async creer(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;                    // cast
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const body = req.body as CreerEvaluateurDTO;
            const data = await evaluateursService.creerEvaluateur(user.userId, body);
            res.status(201).json({ message: 'Évaluateur créé', data });
        } catch (e) { next(e); }
    }

    static async lister(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new AppError('Authentification requise', 401);

            const data = await evaluateursService.listerEvaluateurs({
                actif: typeof req.query.actif === 'string' ? req.query.actif === 'true' : undefined,
                q: typeof req.query.q === 'string' ? req.query.q : undefined
            });
            res.json({ data });
        } catch (e) { next(e); }
    }

    static async suspendre(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const id = this.assertId('idEvaluateur', req.params.id);
            const data = await evaluateursService.suspendre(user.userId, id);
            res.json({ message: 'Évaluateur suspendu', data });
        } catch (e) { next(e); }
    }

    static async reactiver(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const id = this.assertId('idEvaluateur', req.params.id);
            const data = await evaluateursService.reactiver(user.userId, id);
            res.json({ message: 'Évaluateur réactivé', data });
        } catch (e) { next(e); }
    }

    static async supprimer(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const id = EvaluateursController.assertId('idEvaluateur', req.params.id);
            const data = await evaluateursService.supprimer(user.userId, id);
            res.json({ message: 'Évaluateur supprimé', data });
        } catch (e) { next(e); }
    }

    static async affecter(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const data = await evaluateursService.affecterAOffres(user.userId, req.body);
            res.status(201).json({ message: 'Affectations créées', data });
        } catch (e) { next(e); }
    }

    static async desaffecter(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const idSession    = this.assertId('idSession', req.params.idSession);
            const idOffre      = this.assertId('idOffre', req.params.idOffre);
            const idEvaluateur = this.assertId('idEvaluateur', req.params.idEvaluateur);

            const data = await evaluateursService.desaffecter(user.userId, idSession, idOffre, idEvaluateur);
            res.json({ message: 'Désaffecté', data });
        } catch (e) { next(e); }
    }

    static async prolonger(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (user?.role !== 'ADMINISTRATEUR') throw new AppError('Accès refusé', 403);

            const data = await evaluateursService.prolonger(user.userId, req.body);
            res.json({ message: 'Extension accordée', data });
        } catch (e) { next(e); }
    }

    static async mesOffres(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new AppError('Authentification requise', 401);

            const idSession = this.assertId('idSession', req.params.idSession);
            const data = await evaluateursService.listeOffresPourEvaluateur(idSession, user.userId);
            res.json({ data });
        } catch (e) { next(e); }
    }

    static async disponibilite(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new AppError('Authentification requise', 401);

            const payload = { ...req.body, idEvaluateur: user.userId };
            const data = await evaluateursService.repondreDisponibilite(payload);
            res.json({ message: 'Disponibilité enregistrée', data });
        } catch (e) { next(e); }
    }

    static async soumettreEvaluation(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            if (!user) throw new AppError('Authentification requise', 401);

            const payload = { ...req.body, idEvaluateur: user.userId };
            const data = await evaluateursService.soumettreEvaluation(payload);
            res.status(201).json({ message: 'Évaluation traitée', data });
        } catch (e) { next(e); }
    }
}