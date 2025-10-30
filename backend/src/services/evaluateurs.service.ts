// src/services/evaluateurs.service.ts
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/error.middleware.js';
import {
    CreerEvaluateurDTO,
    AffecterDTO,
    RepondreDisponibiliteDTO,
    ProlongerDTO,
    SoumettreEvaluationDTO
} from '../types/evaluateurs.js';
import { TypeAction, StatutAffectation, StatutDisponibilite, StatutEvaluation } from '@prisma/client';

export class EvaluateursService {
    /* ----------------------------- UTILITAIRES ----------------------------- */
    private async journaliser(userId: string | null, typeAction: TypeAction, payload: {
        typeCible?: any; idCible?: string | null; description?: string; details?: any; resultat?: any;
    } = {}) {
        try {
            await prisma.journalAction.create({
                data: {
                    utilisateurId: userId ?? 'system',
                    typeAction,
                    typeCible: payload.typeCible ?? null,
                    idCible: payload.idCible ?? null,
                    description: payload.description ?? null,
                    details: payload.details ?? undefined,
                    resultat: payload.resultat ?? 'REUSSI'
                }
            });
        } catch { /* ne bloque jamais la requête */ }
    }

    /* --------------------------- CRUD ÉVALUATEURS -------------------------- */
    async creerEvaluateur(adminId: string, data: CreerEvaluateurDTO) {
        if (!data.email?.trim()) throw new AppError('Email requis.', 400);

        // mot de passe provisoire (tu peux l’envoyer par email ou forcer reset)
        const mdpProvisoire = Math.random().toString(36).slice(-10); // ex: "q3yd8z0kpl"
        const hash = await bcrypt.hash(mdpProvisoire, 10);

        const evaluateur = await prisma.utilisateur.create({
            data: {
                email: data.email.trim().toLowerCase(),
                nom: data.nom?.trim() || '',
                prenom: data.prenom?.trim() || '',
                actif: true,
                role: 'EVALUATEUR',
                hashMotPasse: hash,            // ⬅️ requis par ton schéma
                resetToken: null,              // (optionnel selon ton schéma)
                resetTokenExpiry: null         // (optionnel)
            }
        });

        await this.journaliser(adminId, TypeAction.EVALUATEUR_CREER, {
            idCible: evaluateur.id,
            description: `Création évaluateur ${evaluateur.email}`
        });

        // Notification interne (tu peux y placer le mdp provisoire si c'est ta politique)
        await prisma.notificationInterne.create({
            data: {
                destinataireId: evaluateur.id,
                envoyeParId: adminId,
                contexte: 'EVALUATEUR',
                message: "Votre compte d'évaluateur a été créé. Merci de définir un mot de passe.",
                donnees: { email: evaluateur.email /*, mdpProvisoire */ }
            }
        });

        // ⚠️ par sécurité on NE renvoie PAS le mdp en clair en réponse HTTP
        return { ...evaluateur, hashMotPasse: undefined };
    }
    async listerEvaluateurs(params?: { actif?: boolean; q?: string }) {
        const where: any = { role: 'EVALUATEUR' };
        if (typeof params?.actif === 'boolean') where.actif = params.actif;
        if (params?.q?.trim()) {
            const q = params.q.trim();
            where.OR = [
                { email: { contains: q, mode: 'insensitive' } },
                { nom: { contains: q, mode: 'insensitive' } },
                { prenom: { contains: q, mode: 'insensitive' } }
            ];
        }
        return prisma.utilisateur.findMany({
            where,
            orderBy: [{ actif: 'desc' }, { nom: 'asc' }]
        });
    }

    async suspendre(adminId: string, idEvaluateur: string) {
        const user = await prisma.utilisateur.update({
            where: { id: idEvaluateur },
            data: { actif: false }
        });
        await this.journaliser(adminId, TypeAction.EVALUATEUR_SUSPENDRE, {
            idCible: idEvaluateur,
            description: `Suspension évaluateur ${user.email}`
        });
        return user;
    }

    async reactiver(adminId: string, idEvaluateur: string) {
        const user = await prisma.utilisateur.update({
            where: { id: idEvaluateur },
            data: { actif: true }
        });
        await this.journaliser(adminId, TypeAction.EVALUATEUR_REACTIVER, {
            idCible: idEvaluateur,
            description: `Réactivation évaluateur ${user.email}`
        });
        return user;
    }

    /* ----------------------- AFFECTATIONS & DISPONIBILITÉ ------------------ */
    async affecterAOffres(adminId: string, data: AffecterDTO) {
        // sécuriser l’unicité par triplet (session, offre, évaluateur)
        const created = await prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of data.affectations) {
                const row = await tx.affectation.upsert({
                    where: {
                        sessionId_offreId_evaluateurId: {
                            sessionId: data.idSession,
                            offreId: item.idOffre,
                            evaluateurId: item.idEvaluateur
                        }
                    },
                    update: { statut: 'EN_COURS' },
                    create: {
                        sessionId: data.idSession,
                        offreId: item.idOffre,
                        evaluateurId: item.idEvaluateur,
                        statut: 'EN_COURS'
                    }
                });
                results.push(row);
            }
            return results;
        });

        await this.journaliser(adminId, TypeAction.EVALUATEUR_AFFECTER, {
            description: `Affectations créées (${created.length})`,
            details: { sessionId: data.idSession }
        });

        return created;
    }

    async desaffecter(adminId: string, idSession: string, idOffre: string, idEvaluateur: string) {
        const deleted = await prisma.affectation.delete({
            where: {
                sessionId_offreId_evaluateurId: {
                    sessionId: idSession,
                    offreId: idOffre,
                    evaluateurId: idEvaluateur
                }
            }
        });
        await this.journaliser(adminId, TypeAction.EVALUATEUR_DESAFFECTER, {
            description: 'Désaffectation',
            details: { idSession, idOffre, idEvaluateur }
        });
        return deleted;
    }

    async repondreDisponibilite(data: RepondreDisponibiliteDTO) {
        const dispo = await prisma.disponibilite.upsert({
            where: {
                sessionId_evaluateurId: {
                    sessionId: data.idSession,
                    evaluateurId: data.idEvaluateur
                }
            },
            update: { statut: data.statut, reponduLe: new Date() },
            create: {
                sessionId: data.idSession,
                evaluateurId: data.idEvaluateur,
                statut: data.statut
            }
        });

        await this.journaliser(data.idEvaluateur, TypeAction.DISPONIBILITE_REPONDRE, {
            description: `Disponibilité: ${data.statut}`,
            details: { idSession: data.idSession }
        });

        return dispo;
    }

    async prolonger(adminId: string, data: ProlongerDTO) {
        // Une seule extension par (session, évaluateur)
        const extension = await prisma.extension.upsert({
            where: {
                sessionId_evaluateurId: {
                    sessionId: data.idSession,
                    evaluateurId: data.idEvaluateur
                }
            },
            update: {
                minutes: data.minutes ?? 60,
                accordeeParId: adminId,
                accordeeLe: new Date(),
                expireLe: data.expireLe ?? new Date(Date.now() + (data.minutes ?? 60) * 60 * 1000)
            },
            create: {
                sessionId: data.idSession,
                evaluateurId: data.idEvaluateur,
                minutes: data.minutes ?? 60,
                accordeeParId: adminId,
                accordeeLe: new Date(),
                expireLe: data.expireLe ?? new Date(Date.now() + (data.minutes ?? 60) * 60 * 1000)
            }
        });

        await this.journaliser(adminId, TypeAction.EXTENSION_ACCORDER, {
            idCible: extension.id,
            description: `Extension accordée (+${extension.minutes} min)`,
            details: { sessionId: data.idSession, evaluateurId: data.idEvaluateur }
        });

        return extension;
    }

    /* ------------------------------ ÉVALUATION ----------------------------- */
    async listeOffresPourEvaluateur(idSession: string, idEvaluateur: string) {
        // Offres de la session + code anonyme + statut d’affectation
        const [offres, aff] = await Promise.all([
            prisma.sessionOffre.findMany({ where: { sessionId: idSession } }),
            prisma.affectation.findMany({
                where: { sessionId: idSession, evaluateurId: idEvaluateur },
                select: { offreId: true, statut: true }
            })
        ]);
        const mapStatut = new Map(aff.map(a => [a.offreId, a.statut]));
        return offres.map(o => ({
            idOffre: o.offreId,
            codeAnonyme: o.codeAnonyme,
            statutAffectation: mapStatut.get(o.offreId) ?? 'EN_ATTENTE'
        }));
    }

    async soumettreEvaluation(data: SoumettreEvaluationDTO) {
        // Verrouiller sur la version de grille de la session
        const session = await prisma.sessionEvaluation.findUnique({
            where: { id: data.idSession },
            include: { grilleVersion: { include: { sections: { include: { criteres: true } } } } }
        });
        if (!session) throw new AppError('Session introuvable.', 404);

        // Upsert Evaluation (BROUILLON -> SOUMISE)
        const evaluation = await prisma.evaluation.upsert({
            where: {
                sessionId_offreId_evaluateurId: {
                    sessionId: data.idSession,
                    offreId: data.idOffre,
                    evaluateurId: data.idEvaluateur
                }
            },
            update: {
                statut: data.soumettre ? StatutEvaluation.SOUMISE : StatutEvaluation.BROUILLON,
                commentaire: data.commentaire ?? null,
                soumiseLe: data.soumettre ? new Date() : null,
                grilleVersionId: session.grilleVersionId
            },
            create: {
                sessionId: data.idSession,
                offreId: data.idOffre,
                evaluateurId: data.idEvaluateur,
                grilleVersionId: session.grilleVersionId,
                statut: data.soumettre ? StatutEvaluation.SOUMISE : StatutEvaluation.BROUILLON,
                commentaire: data.commentaire ?? null,
                soumiseLe: data.soumettre ? new Date() : null
            }
        });

        // Écraser les notes de l’évaluation (simple et sûr)
        if (data.notes?.length) {
            await prisma.$transaction(async (tx) => {
                await tx.noteEvaluation.deleteMany({ where: { evaluationId: evaluation.id } });
                await tx.noteEvaluation.createMany({
                    data: data.notes.map((n) => ({
                        evaluationId: evaluation.id,
                        critereId: n.idCritere,
                        valeurPct: Math.max(0, Math.min(100, n.valeurPct))
                    }))
                });
            });
        }

        // Calcul score (pondération par poids de critère ; critères poids=0 ignorés)
        const poids: Array<{ id: string; poids: number }> = [];
        session.grilleVersion.sections.forEach(s => {
            s.criteres.forEach(c => {
                if (c.poids > 0) poids.push({ id: c.id, poids: c.poids });
            });
        });

        const notes = await prisma.noteEvaluation.findMany({
            where: { evaluationId: evaluation.id }
        });

        let sommePonderee = 0;
        let sommePoids = 0;
        for (const p of poids) {
            const n = notes.find((x) => x.critereId === p.id);
            if (n) {
                sommePonderee += (n.valeurPct || 0) * p.poids;
                sommePoids += p.poids;
            }
        }
        const scorePct = sommePoids > 0 ? Math.round(sommePonderee / sommePoids) : null;

        const maj = await prisma.evaluation.update({
            where: { id: evaluation.id },
            data: { scorePct }
        });

        await this.journaliser(data.idEvaluateur, data.soumettre ? TypeAction.EVALUATION_SOUMETTRE : TypeAction.EVALUATION_BROUILLON, {
            idCible: maj.id,
            description: `Évaluation ${data.soumettre ? 'soumise' : 'en brouillon'}`,
            details: { scorePct }
        });

        return maj;
    }
}

export default new EvaluateursService();
