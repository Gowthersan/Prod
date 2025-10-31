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
    if (
      !this.nouvelEvaluateur.email ||
      !this.nouvelEvaluateur.nom ||
      !this.nouvelEvaluateur.prenom
    ) {
      this.toastr.warning('Tous les champs sont requis');
      return;
    }

    // Nettoyage des données
    const evaluateur = {
      email: this.nouvelEvaluateur.email.trim(),
      nom: this.nouvelEvaluateur.nom.trim(),
      prenom: this.nouvelEvaluateur.prenom.trim(),
    };

    // Validation basique du format email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(evaluateur.email)) {
      this.toastr.error('Adresse email invalide');
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
    if (!idSession) return alert('Sélectionnez d’abord une session.');
    this.api.extension({ idSession, idEvaluateur: e.id, minutes: 60 }).subscribe({
      next: () => {
        e.extensionStatut = 'Autorisée';
        alert(`✅ Extension autorisée pour ${e.prenom} ${e.nom}`);
      },
      error: (er) => alert(er?.error?.message || 'Erreur extension'),
    });
  }

  refuserExtension(e: Evaluateur): void {
    const idSession = getSessionCourante();
    if (!idSession) return alert('Sélectionnez d’abord une session.');
    this.api.extension({ idSession, idEvaluateur: e.id, minutes: 0, refuse: true }).subscribe({
      next: () => {
        e.extensionStatut = 'Refusée';
        alert(`❌ Extension refusée pour ${e.prenom} ${e.nom}`);
      },
      error: (er) => alert(er?.error?.message || 'Erreur extension'),
    });
  }

  supprimerEvaluateur(e: Evaluateur): void {
    if (!confirm(`Supprimer ${e.prenom} ${e.nom} ?`)) return;
    // Pas de DELETE prévu côté API -> on "suspend" l’utilisateur
    this.api.suspendre(e.id).subscribe({
      next: () => {
        // On recharge la liste pour refléter le statut
        this.chargerEvaluateurs();
        alert(`✅ ${e.prenom} ${e.nom} suspendu.`);
      },
      error: (er) => alert(er?.error?.message || 'Erreur suspension'),
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
