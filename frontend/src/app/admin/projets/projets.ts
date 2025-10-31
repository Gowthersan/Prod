import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DemandeSubventionService } from '../../services/api/demande-subvention.service';
import {
  DemandeSubvention,
  LABELS_STATUT_SOUMISSION,
  COULEURS_STATUT_SOUMISSION,
  StatutSoumission,
} from '../../types/models';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    HttpClientModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './projets.html',
   
})
export class Projets implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private demandeService = inject(DemandeSubventionService);

  // ===== State =====
  demandes = signal<DemandeSubvention[]>([]);
  loadingDemandes = signal(false);
  statistiques = signal<any>(null);

  // Filtre par statut
  filtreStatut = signal<string>('TOUS');

  // Filtre par appel d'offre
  appelOffre = new FormControl<string>('', { nonNullable: true });

  // Liste des projets filtrés
  filtered = computed(() => {
    let result = this.demandes();

    // Filtre par statut
    const statut = this.filtreStatut();
    if (statut !== 'TOUS') {
      result = result.filter((d) => d.statut === statut);
    }

    // Filtre par appel d'offre (si implémenté)
    const aap = this.appelOffre.value;
    if (aap) {
      // TODO: Filtrer par appel d'offre si la propriété existe
      // result = result.filter((d) => d.appelOffre?.id === aap);
    }

    return result;
  });

  // Stats par statut
  totalProjects = computed(() => this.demandes().length);
  totalSoumis = computed(
    () => this.demandes().filter((d) => d.statut === StatutSoumission.SOUMIS).length
  );
  totalEnRevue = computed(
    () => this.demandes().filter((d) => d.statut === StatutSoumission.EN_REVUE).length
  );
  totalApprouve = computed(
    () => this.demandes().filter((d) => d.statut === StatutSoumission.APPROUVE).length
  );
  totalRejete = computed(
    () => this.demandes().filter((d) => d.statut === StatutSoumission.REJETE).length
  );

  ngOnInit() {
    this.chargerDemandes();
    this.chargerStatistiques();
  }

  /**
   * Charger toutes les demandes (admin)
   */
  chargerDemandes() {
    this.loadingDemandes.set(true);
    this.demandeService.obtenirTout().subscribe({
      next: (response) => {
        console.log('✅ [ADMIN] Demandes récupérées:', response.data.length);
        this.demandes.set(response.data);
        this.loadingDemandes.set(false);
      },
      error: (err) => {
        console.error('❌ [ADMIN] Erreur chargement demandes:', err);
        this.loadingDemandes.set(false);
      },
    });
  }

  /**
   * Charger les statistiques
   */
  chargerStatistiques() {
    this.demandeService.obtenirStatistiques().subscribe({
      next: (response) => {
        console.log('✅ [ADMIN] Statistiques récupérées:', response.data);
        this.statistiques.set(response.data);
      },
      error: (err) => {
        console.error('❌ [ADMIN] Erreur chargement statistiques:', err);
      },
    });
  }

  /**
   * Changer le filtre de statut
   */
  setFiltreStatut(statut: string) {
    this.filtreStatut.set(statut);
  }

  /**
   * Navigation vers le récapitulatif
   */
  goToRecap(id: string) {
    if (!id) return;
    this.router.navigate(['/admin/form/recap', id]);
  }

  /**
   * Obtenir le label du statut en français
   */
  getStatutLabel(statut: string): string {
    return LABELS_STATUT_SOUMISSION[statut as keyof typeof LABELS_STATUT_SOUMISSION] || statut;
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatutClass(statut: string): string {
    return (
      COULEURS_STATUT_SOUMISSION[statut as keyof typeof COULEURS_STATUT_SOUMISSION] ||
      'bg-slate-100 text-slate-800'
    );
  }

  /**
   * Rafraîchir les données
   */
  refresh() {
    this.chargerDemandes();
    this.chargerStatistiques();
  }

  trackById = (index: number, item: DemandeSubvention) => item.id;

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
