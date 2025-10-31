import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EvaluateursApi, Evaluateur, CreerEvaluateurDTO } from '../../services/evaluateurs.api';
import { environment } from '../../../environments/environment';
import { DemandeSubventionService } from '../../services/api/demande-subvention.service';
import { ToastrService } from 'ngx-toastr';
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ⚠️ Id de session “courante” pour les actions d’extension.
//   - Récupère-le depuis la route / le store / une sélection admin.
//   - En attendant, on lit un fallback dans localStorage.
const getSessionCourante = () => localStorage.getItem('sessionCouranteId') || '';

// @ts-ignore
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-evaluateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './evaluateurs.html',
  styleUrls: ['./evaluateurs.css'],
})
export class Evaluateurs implements OnInit {
  // Stats
  totalProjets = 0;
  totalAAP = 0;
  totalEvaluateurs = 0;
  evaluateursActifs = 0;

  // Liste des évaluateurs
  evaluateurs: Evaluateur[] = [];
  filtreActifs = true;

  // État du modal
  isModalOuverte = false;
  nouvelEvaluateur: CreerEvaluateurDTO = { nom: '', prenom: '', email: '' };

  // UI
  chargement = false;

  private demandeService = inject(DemandeSubventionService);

  private toastr = inject(ToastrService);

  constructor(private router: Router, private api: EvaluateursApi) {}

  ngOnInit(): void {
    this.chargerEvaluateurs();
    this.chargerStatistiques();
  }

  /**
   * Charger les statistiques des projets et AAP
   */
  private chargerStatistiques(): void {
    this.demandeService.obtenirTout().subscribe({
      next: (response) => {
        if (response?.data) {
          this.totalProjets = response.data.length;
          const aapUniques = new Set(response.data.map((p) => p.appelProjets?.id).filter(Boolean));
          this.totalAAP = aapUniques.size;
          this.toastr.info(
            `Statistiques mises à jour : ${this.totalProjets} projets sur ${this.totalAAP} AAP`
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.toastr.error('Erreur lors du chargement des statistiques');
      },
    });
  }

  /* -------------------------- MODAL -------------------------- */
  ouvrirModal(): void {
    this.isModalOuverte = true;
  }

  fermerModal(): void {
    this.isModalOuverte = false;
    this.nouvelEvaluateur = { nom: '', prenom: '', email: '' };
  }

  /* ------------------------- ACTIONS ------------------------- */

  creerEvaluateur(): void {
    // Vérification des champs vides
    if (!this.nouvelEvaluateur.email) {
      this.toastr.warning("L'adresse email est requise", 'Champ manquant');
      return;
    }
    if (!this.nouvelEvaluateur.nom) {
      this.toastr.warning('Le nom est requis', 'Champ manquant');
      return;
    }
    if (!this.nouvelEvaluateur.prenom) {
      this.toastr.warning('Le prénom est requis', 'Champ manquant');
      return;
    }

    // Nettoyage des données
    const evaluateur = {
      email: this.nouvelEvaluateur.email.trim(),
      nom: this.nouvelEvaluateur.nom.trim(),
      prenom: this.nouvelEvaluateur.prenom.trim(),
    };

    // Validation du format email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(evaluateur.email)) {
      this.toastr.error("Le format de l'adresse email n'est pas valide", 'Format email incorrect');
      return;
    }

    // Validation de la longueur des champs
    if (evaluateur.nom.length < 2) {
      this.toastr.warning('Le nom doit contenir au moins 2 caractères', 'Nom trop court');
      return;
    }
    if (evaluateur.prenom.length < 2) {
      this.toastr.warning('Le prénom doit contenir au moins 2 caractères', 'Prénom trop court');
      return;
    }

    this.api.creer(evaluateur).subscribe({
      next: (response) => {
        console.log('Évaluateur créé:', response);
        this.fermerModal();
        this.chargerEvaluateurs();
        this.toastr.success('Évaluateur créé avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.toastr.error(err?.error?.message || "Erreur lors de la création de l'évaluateur");
      },
    });
  }

  approuverExtension(e: Evaluateur): void {
    const idSession = getSessionCourante();
    if (!idSession) {
      this.toastr.warning('Veuillez sélectionner une session avant de continuer');
      return;
    }
    this.api.extension({ idSession, idEvaluateur: e.id, minutes: 60 }).subscribe({
      next: () => {
        e.extensionStatut = 'Autorisée';
        this.toastr.success(`Extension autorisée pour ${e.prenom} ${e.nom}`, 'Extension accordée');
      },
      error: (er) => {
        this.toastr.error(
          er?.error?.message || "Erreur lors de l'extension",
          "Échec de l'extension"
        );
        console.error('Erreur extension:', er);
      },
    });
  }

  refuserExtension(e: Evaluateur): void {
    const idSession = getSessionCourante();
    if (!idSession) {
      this.toastr.warning('Veuillez sélectionner une session avant de continuer');
      return;
    }
    this.api.extension({ idSession, idEvaluateur: e.id, minutes: 0, refuse: true }).subscribe({
      next: () => {
        e.extensionStatut = 'Refusée';
        this.toastr.info(`Extension refusée pour ${e.prenom} ${e.nom}`, 'Extension refusée');
      },
      error: (er) => {
        this.toastr.error(
          er?.error?.message || "Erreur lors du refus d'extension",
          "Échec de l'opération"
        );
        console.error('Erreur refus extension:', er);
      },
    });
  }

  supprimerEvaluateur(e: Evaluateur): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'évaluateur ${e.prenom} ${e.nom} ?`)) {
      return;
    }
    // Pas de DELETE prévu côté API -> on "suspend" l'utilisateur
    this.api.suspendre(e.id).subscribe({
      next: () => {
        this.toastr.success(
          `L'évaluateur ${e.prenom} ${e.nom} a été suspendu avec succès`,
          'Évaluateur suspendu'
        );
        // On recharge la liste pour refléter le statut
        this.chargerEvaluateurs();
      },
      error: (er) => {
        this.toastr.error(
          er?.error?.message || 'Une erreur est survenue lors de la suspension',
          'Échec de la suspension'
        );
        console.error('Erreur suspension:', er);
      },
    });
  }

  logout(): void {
    if (!confirm('Voulez-vous vous déconnecter ?')) return;
    localStorage.removeItem('token');
    this.toastr.info('Déconnexion réussie');
    this.router.navigate(['/login']);
  }

  /* ----------------------- FILTRES -------------------------- */

  toggleFiltreActifs(): void {
    this.filtreActifs = !this.filtreActifs;
    this.chargerEvaluateurs();
  }

  /* ----------------------- CHARGEMENT ------------------------ */

  private chargerEvaluateurs(): void {
    this.chargement = true;
    this.evaluateurs = [];
    this.totalEvaluateurs = 0;
    this.evaluateursActifs = 0;

    this.api.lister({ actif: this.filtreActifs }).subscribe({
      next: (evaluateurs) => {
        this.evaluateurs = evaluateurs;
        this.totalEvaluateurs = evaluateurs.length;
        this.evaluateursActifs = evaluateurs.filter(
          (e) => e.projetsAttribues > 0 && e.projetsTermines < e.projetsAttribues
        ).length;

        const projetsUniques = new Set<string>();
        const aapUniques = new Set<string>();

        evaluateurs.forEach((e) => {
          if (e.projetsAttribues > 0) {
            projetsUniques.add(e.id);
            aapUniques.add(e.id);
          }
        });

        this.totalProjets = projetsUniques.size;
        this.totalAAP = aapUniques.size;

        this.toastr.success(`${this.totalEvaluateurs} évaluateurs chargés`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des évaluateurs:', err);
        this.toastr.error(err?.error?.message || 'Erreur lors du chargement des évaluateurs');
      },
      complete: () => {
        this.chargement = false;
      },
    });
  }
}
