// src/types/evaluateurs.ts
export interface CreerEvaluateurDTO {
    email: string;
    nom?: string;
    prenom?: string;
}

export interface AffecterDTO {
    idSession: string;
    affectations: Array<{ idOffre: string; idEvaluateur: string }>;
}

export interface RepondreDisponibiliteDTO {
    idSession: string;
    idEvaluateur: string;
    statut: 'EN_ATTENTE' | 'OUI' | 'NON';
}

export interface ProlongerDTO {
    idSession: string;
    idEvaluateur: string;
    minutes?: number;            // défaut 60
    expireLe?: Date;             // optionnel
}

export interface SoumettreEvaluationDTO {
    idSession: string;
    idOffre: string;
    idEvaluateur: string;
    commentaire?: string;
    soumettre?: boolean;         // true = soumettre, false = brouillon
    notes: Array<{ idCritere: string; valeurPct: number }>;
}
