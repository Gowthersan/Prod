import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';

// ===== INTERFACES =====
interface SessionEvaluation {
  id: string;
  intitule: string;
  appelOffre: string;
  nbProjets: number;
  nbEvaluateurs: number;
  statut: 'Planifiée' | 'En cours' | 'Terminée';
  dateDebut: string;
  dateFin: string;
  projets?: ProjetEvalue[];
  evaluateurs?: EvaluateurSession[];
}

interface ProjetEvalue {
  id: string;
  nom: string;
  notes: number[];
  noteMoyenne: number;
}

interface EvaluateurSession {
  id: string;
  prenom: string;
  nom: string;
  email: string;
}

interface Projet {
  id: string;
  nom: string;
  organisation: string;
  porteur: string;
  dateSoumission: string;
  appelOffreId?: string;
}

interface Evaluateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  dateCreation: string;
  nbProjetsEvalues: number;
}

interface AppelOffre {
  id: string;
  nom: string;
}

interface GrilleEvaluation {
  id: string;
  titre: string;
  description: string;
  dateCreation: string;
  noteMax: number;
  noteMin: number;
  criteres: Critere[];
}

interface Critere {
  id?: string;
  titre: string;
  sousCriteres: SousCritere[];
}

interface SousCritere {
  id?: string;
  titre: string;
  description: string;
  points: number;
}

interface NouvelleSessionData {
  appelOffreId: string;
  intitule: string;
  projetsIds: string[];
  evaluateursIds: string[];
  dateDebut: string;
  dateFin: string;
  grilleEvaluationId: string;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.css',
})
export class Evaluations implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  // ===== STATE =====
  loading = signal(false);
  sessions = signal<SessionEvaluation[]>([]);
  projets = signal<Projet[]>([]);
  evaluateurs = signal<Evaluateur[]>([]);
  appelOffres = signal<AppelOffre[]>([]);
  grillesEvaluation = signal<GrilleEvaluation[]>([]);

  // Stats pour sidebar
  totalProjets = computed(() => this.projets().length);
  totalAAP = computed(() => this.appelOffres().length);

  // ===== MODALES =====
  modalNouvelleSession = signal(false);
  etapeNouvelleSession = signal(1);
  modalVoir = signal(false);
  modalParametrage = signal(false);
  modalNouvelleGrille = signal(false);
  modalSousCritere = signal(false);

  // ===== ONGLETS =====
  ongletVoir = signal<'projets' | 'evaluateurs'>('projets');
  ongletGrille = signal<'nouveau' | 'titre' | 'description' | 'min'>('nouveau');

  // ===== DATA EN ÉDITION =====
  sessionSelectionnee = signal<SessionEvaluation | null>(null);
  nouvelleSessionData: NouvelleSessionData = {
    appelOffreId: '',
    intitule: '',
    projetsIds: [],
    evaluateursIds: [],
    dateDebut: '',
    dateFin: '',
    grilleEvaluationId: '',
  };

  grilleEnEdition: GrilleEvaluation = {
    id: '',
    titre: '',
    description: '',
    dateCreation: '',
    noteMax: 100,
    noteMin: 0,
    criteres: [],
  };

  nouveauCritere: Critere = {
    titre: '',
    sousCriteres: [],
  };

  sousCritereEnEdition: SousCritere = {
    titre: '',
    description: '',
    points: 0,
  };

  critereIndexEnEdition = -1;
  sousCritereIndexEnEdition = -1;

  ngOnInit() {
    this.chargerDonnees();
  }

  // ===== CHARGEMENT DES DONNÉES =====
  chargerDonnees() {
    this.loading.set(true);

    // Données de démonstration
    setTimeout(() => {
      // Sessions
      this.sessions.set([
        {
          id: '1',
          intitule: 'Session 4',
          appelOffre: 'Conservation marine & littorale',
          nbProjets: 10,
          nbEvaluateurs: 4,
          statut: 'Planifiée',
          dateDebut: '22/11/2025',
          dateFin: '22/11/2025',
          projets: [
            {
              id: 'p1',
              nom: 'Restauration des mangroves 1',
              notes: [75, 77, 80, 75],
              noteMoyenne: 76.75,
            },
            {
              id: 'p2',
              nom: 'Restauration des mangroves 2',
              notes: [70, 72, 75, 70],
              noteMoyenne: 71.75,
            },
          ],
          evaluateurs: [
            { id: 'e1', prenom: 'Kenny', nom: 'BIANG', email: 'kenny.biang@sing.ga' },
            { id: 'e2', prenom: 'Noemy', nom: 'OBAME', email: 'noemy.obame@sing.ga' },
          ],
        },
        {
          id: '2',
          intitule: 'Session 3',
          appelOffre: 'Conservation marine & littorale',
          nbProjets: 10,
          nbEvaluateurs: 4,
          statut: 'En cours',
          dateDebut: '21/10/2025',
          dateFin: '22/11/2025',
        },
        {
          id: '3',
          intitule: 'Session 2',
          appelOffre: 'Conservation marine & littorale',
          nbProjets: 20,
          nbEvaluateurs: 5,
          statut: 'En cours',
          dateDebut: '21/10/2025',
          dateFin: '22/11/2025',
        },
        {
          id: '4',
          intitule: 'Session 1',
          appelOffre: 'Conservation marine & littorale',
          nbProjets: 20,
          nbEvaluateurs: 5,
          statut: 'Terminée',
          dateDebut: '22/09/2025',
          dateFin: '21/10/2025',
        },
      ]);

      // Projets
      this.projets.set([
        {
          id: 'p1',
          nom: 'Projet de Yannick',
          organisation: 'Organisation de Yannick',
          porteur: 'yannick.ebibie@sing.ga',
          dateSoumission: '19/10/2018',
          appelOffreId: 'aap1',
        },
        {
          id: 'p2',
          nom: 'Projet de Noemy',
          organisation: 'Organisation de Noemy',
          porteur: 'noemy.obame@sing.ga',
          dateSoumission: '19/10/2018',
          appelOffreId: 'aap1',
        },
        {
          id: 'p3',
          nom: 'Projet de Kenny',
          organisation: 'Organisation de Kenny',
          porteur: 'kenny.biang@sing.ga',
          dateSoumission: '31/07/2019',
          appelOffreId: 'aap1',
        },
        {
          id: 'p4',
          nom: 'Projet de Gerson',
          organisation: 'Organisation de Gerson',
          porteur: 'gerson.aguinaldo@sing.ga',
          dateSoumission: '23/09/2025',
          appelOffreId: 'aap1',
        },
        {
          id: 'p5',
          nom: 'Projet de Georges',
          organisation: 'Organisation de Georges',
          porteur: 'georges.rapontchombo@sing.ga',
          dateSoumission: '22/09/2025',
          appelOffreId: 'aap1',
        },
        {
          id: 'p6',
          nom: 'Projet de Morel',
          organisation: 'Organisation de Morel',
          porteur: 'morel.mintsa@sing.ga',
          dateSoumission: '29/09/2025',
          appelOffreId: 'aap1',
        },
      ]);

      // Évaluateurs
      this.evaluateurs.set([
        {
          id: 'e1',
          prenom: 'Yannick',
          nom: 'EBIBIE',
          email: 'yannick.ebibie@sing.ga',
          dateCreation: '19/10/2018',
          nbProjetsEvalues: 23,
        },
        {
          id: 'e2',
          prenom: 'Noemy',
          nom: 'OBAME',
          email: 'noemy.obame@sing.ga',
          dateCreation: '19/10/2018',
          nbProjetsEvalues: 21,
        },
        {
          id: 'e3',
          prenom: 'Kenny',
          nom: 'BIANG',
          email: 'kenny.biang@sing.ga',
          dateCreation: '31/07/2019',
          nbProjetsEvalues: 20,
        },
        {
          id: 'e4',
          prenom: 'Gerson',
          nom: 'SACAMA',
          email: 'gerson.aguinaldo@sing.ga',
          dateCreation: '23/09/2025',
          nbProjetsEvalues: 16,
        },
        {
          id: 'e5',
          prenom: 'Georges',
          nom: 'RAPONTCHOMBO',
          email: 'georges.rapontchombo@sing.ga',
          dateCreation: '22/09/2025',
          nbProjetsEvalues: 15,
        },
        {
          id: 'e6',
          prenom: 'Morel',
          nom: 'MINTSA',
          email: 'morel.mintsa@sing.ga',
          dateCreation: '29/09/2025',
          nbProjetsEvalues: 15,
        },
      ]);

      // Appels d'offres
      this.appelOffres.set([
        { id: 'aap1', nom: 'Conservation marine & littorale' },
        { id: 'aap2', nom: 'Biodiversité forestière' },
      ]);

      // Grilles d'évaluation
      this.grillesEvaluation.set([
        {
          id: 'g1',
          titre: 'Grille par defaut',
          description: 'Grille par defaut du systeme',
          dateCreation: '26/10/2025',
          noteMax: 100,
          noteMin: 70,
          criteres: [
            {
              id: 'c1',
              titre: 'Pertinence du projet',
              sousCriteres: [
                {
                  id: 'sc1',
                  titre: "Adéquation avec les objectifs de l'appel d'offres",
                  description:
                    'Le projets répond-il clairement aux enjeux de préservation du littoral, des habitants marins et de la biodiversité ?',
                  points: 10,
                },
                {
                  id: 'sc2',
                  titre: "Adéquation avec les objectifs de l'appel d'offres",
                  description:
                    'Le projets répond-il clairement aux enjeux de préservation du littoral, des habitants marins et de la biodiversité ?',
                  points: 10,
                },
              ],
            },
            {
              id: 'c2',
              titre: 'Qualité scientifique et technique',
              sousCriteres: [
                {
                  id: 'sc3',
                  titre: 'Solidité du diagnostique initial',
                  description:
                    'Analyse préalable des enjeux écologiques, socio-économiques et environnementaux',
                  points: 5,
                },
              ],
            },
          ],
        },
      ]);

      this.loading.set(false);
    }, 500);
  }

  // ===== FILTRES =====
  projetsFiltres = computed(() => {
    const appelOffreId = this.nouvelleSessionData.appelOffreId;
    if (!appelOffreId) return this.projets();
    return this.projets().filter((p) => p.appelOffreId === appelOffreId);
  });

  // ===== MODALE NOUVELLE SESSION =====
  ouvrirModalNouvelleSession() {
    this.resetNouvelleSessionData();
    this.etapeNouvelleSession.set(1);
    this.modalNouvelleSession.set(true);
  }

  fermerModalNouvelleSession() {
    this.modalNouvelleSession.set(false);
    this.resetNouvelleSessionData();
  }

  allerEtape(etape: number) {
    this.etapeNouvelleSession.set(etape);
  }

  peutAllerEtape2(): boolean {
    return (
      this.nouvelleSessionData.intitule.trim() !== '' &&
      this.nouvelleSessionData.projetsIds.length > 0
    );
  }

  peutCreerSession(): boolean {
    return (
      this.nouvelleSessionData.dateDebut !== '' &&
      this.nouvelleSessionData.dateFin !== '' &&
      this.nouvelleSessionData.grilleEvaluationId !== '' &&
      this.nouvelleSessionData.evaluateursIds.length > 0
    );
  }

  toggleProjetSelection(projetId: string) {
    const index = this.nouvelleSessionData.projetsIds.indexOf(projetId);
    if (index > -1) {
      this.nouvelleSessionData.projetsIds.splice(index, 1);
    } else {
      this.nouvelleSessionData.projetsIds.push(projetId);
    }
  }

  toggleEvaluateurSelection(evaluateurId: string) {
    const index = this.nouvelleSessionData.evaluateursIds.indexOf(evaluateurId);
    if (index > -1) {
      this.nouvelleSessionData.evaluateursIds.splice(index, 1);
    } else {
      this.nouvelleSessionData.evaluateursIds.push(evaluateurId);
    }
  }

  tousProjetsCochesEtape1(): boolean {
    const projetsFiltres = this.projetsFiltres();
    return (
      projetsFiltres.length > 0 &&
      projetsFiltres.every((p) => this.nouvelleSessionData.projetsIds.includes(p.id))
    );
  }

  toggleTousProjetsEtape1(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.nouvelleSessionData.projetsIds = this.projetsFiltres().map((p) => p.id);
    } else {
      this.nouvelleSessionData.projetsIds = [];
    }
  }

  tousEvaluateursCochesEtape2(): boolean {
    const evaluateurs = this.evaluateurs();
    return (
      evaluateurs.length > 0 &&
      evaluateurs.every((e) => this.nouvelleSessionData.evaluateursIds.includes(e.id))
    );
  }

  toggleTousEvaluateursEtape2(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.nouvelleSessionData.evaluateursIds = this.evaluateurs().map((e) => e.id);
    } else {
      this.nouvelleSessionData.evaluateursIds = [];
    }
  }

  creerSession() {
    console.log('➡️ Création session:', this.nouvelleSessionData);
    // TODO: Appel API pour créer la session
    alert('Session créée avec succès !');
    this.fermerModalNouvelleSession();
    this.chargerDonnees();
  }

  resetNouvelleSessionData() {
    this.nouvelleSessionData = {
      appelOffreId: '',
      intitule: '',
      projetsIds: [],
      evaluateursIds: [],
      dateDebut: '',
      dateFin: '',
      grilleEvaluationId: '',
    };
  }

  // ===== MODALE VOIR SESSION =====
  ouvrirModalVoir(session: SessionEvaluation) {
    this.sessionSelectionnee.set(session);
    this.ongletVoir.set('projets');
    this.modalVoir.set(true);
  }

  fermerModalVoir() {
    this.modalVoir.set(false);
    this.sessionSelectionnee.set(null);
  }

  changerOngletVoir(onglet: 'projets' | 'evaluateurs') {
    this.ongletVoir.set(onglet);
  }

  // ===== MODALE PARAMÉTRAGE =====
  ouvrirModalParametrage() {
    this.modalParametrage.set(true);
  }

  fermerModalParametrage() {
    this.modalParametrage.set(false);
  }

  supprimerGrille(grilleId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette grille ?')) return;
    console.log('➡️ Suppression grille:', grilleId);
    // TODO: Appel API pour supprimer la grille
    const grilles = this.grillesEvaluation().filter((g) => g.id !== grilleId);
    this.grillesEvaluation.set(grilles);
  }

  enregistrerGrilles() {
    console.log('➡️ Enregistrement grilles');
    // TODO: Appel API si nécessaire
    this.fermerModalParametrage();
  }

  // ===== MODALE NOUVELLE/MODIFIER GRILLE =====
  ouvrirModalNouvelleGrille() {
    this.resetGrilleEnEdition();
    this.ongletGrille.set('nouveau');
    this.modalNouvelleGrille.set(true);
  }

  modifierGrille(grille: GrilleEvaluation) {
    this.grilleEnEdition = JSON.parse(JSON.stringify(grille));
    this.ongletGrille.set('nouveau');
    this.modalNouvelleGrille.set(true);
  }

  fermerModalNouvelleGrille() {
    this.modalNouvelleGrille.set(false);
    this.resetGrilleEnEdition();
  }

  changerOngletGrille(onglet: 'nouveau' | 'titre' | 'description' | 'min') {
    // Si on quitte l'onglet nouveau et qu'un critère est en cours, l'ajouter
    if (
      this.ongletGrille() === 'nouveau' &&
      onglet !== 'nouveau' &&
      this.nouveauCritere.titre.trim() !== ''
    ) {
      this.grilleEnEdition.criteres.push(JSON.parse(JSON.stringify(this.nouveauCritere)));
      this.nouveauCritere = { titre: '', sousCriteres: [] };
    }
    this.ongletGrille.set(onglet);
  }

  enregistrerGrille() {
    // Ajouter le critère en cours si nécessaire
    if (this.nouveauCritere.titre.trim() !== '') {
      this.grilleEnEdition.criteres.push(JSON.parse(JSON.stringify(this.nouveauCritere)));
    }

    console.log('➡️ Enregistrement grille:', this.grilleEnEdition);

    // TODO: Appel API pour créer/modifier la grille
    if (this.grilleEnEdition.id) {
      // Modification
      const grilles = this.grillesEvaluation().map((g) =>
        g.id === this.grilleEnEdition.id ? this.grilleEnEdition : g
      );
      this.grillesEvaluation.set(grilles);
    } else {
      // Création
      this.grilleEnEdition.id = 'g' + Date.now();
      this.grilleEnEdition.dateCreation = new Date().toLocaleDateString('fr-FR');
      this.grillesEvaluation.set([...this.grillesEvaluation(), this.grilleEnEdition]);
    }

    alert('Grille enregistrée avec succès !');
    this.fermerModalNouvelleGrille();
  }

  resetGrilleEnEdition() {
    this.grilleEnEdition = {
      id: '',
      titre: '',
      description: '',
      dateCreation: '',
      noteMax: 100,
      noteMin: 0,
      criteres: [],
    };
    this.nouveauCritere = { titre: '', sousCriteres: [] };
  }

  // ===== MODALE SOUS-CRITÈRE =====
  ajouterSousCritere(critereIndex: number) {
    this.critereIndexEnEdition = critereIndex;
    this.sousCritereIndexEnEdition = -1;
    this.sousCritereEnEdition = { titre: '', description: '', points: 0 };
    this.modalSousCritere.set(true);
  }

  modifierSousCritere(critereIndex: number, sousCritereIndex: number) {
    this.critereIndexEnEdition = critereIndex;
    this.sousCritereIndexEnEdition = sousCritereIndex;
    const sousCritere = this.grilleEnEdition.criteres[critereIndex].sousCriteres[sousCritereIndex];
    this.sousCritereEnEdition = JSON.parse(JSON.stringify(sousCritere));
    this.modalSousCritere.set(true);
  }

  supprimerSousCritere(critereIndex: number, sousCritereIndex: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sous-critère ?')) return;
    this.grilleEnEdition.criteres[critereIndex].sousCriteres.splice(sousCritereIndex, 1);
  }

  fermerModalSousCritere() {
    this.modalSousCritere.set(false);
    this.sousCritereEnEdition = { titre: '', description: '', points: 0 };
    this.critereIndexEnEdition = -1;
    this.sousCritereIndexEnEdition = -1;
  }

  enregistrerSousCritere() {
    if (this.critereIndexEnEdition === -1) return;

    if (this.sousCritereIndexEnEdition === -1) {
      // Ajout
      this.grilleEnEdition.criteres[this.critereIndexEnEdition].sousCriteres.push(
        JSON.parse(JSON.stringify(this.sousCritereEnEdition))
      );
    } else {
      // Modification
      this.grilleEnEdition.criteres[this.critereIndexEnEdition].sousCriteres[
        this.sousCritereIndexEnEdition
      ] = JSON.parse(JSON.stringify(this.sousCritereEnEdition));
    }

    this.fermerModalSousCritere();
  }

  // ===== UTILITAIRES =====
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'Planifiée':
        return 'bg-blue-100 text-blue-800';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  trackById = (index: number, item: any) => item.id;

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
