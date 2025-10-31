import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface ProjetAEvaluer {
  id: string;
  identifiant: string;
  titre: string;
  budget: number;
  typeSubvention: string;
  date: string;
  statut: 'A évaluer' | 'En cours' | 'Terminé';
}

@Component({
  selector: 'app-evaluateur-projets',
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
export class EvaluateurProjets implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  // State
  projets = signal<ProjetAEvaluer[]>([]);
  loading = signal(false);
  filtreStatut = signal<string>('TOUS');

  // Stats
  totalProjets = computed(() => this.projets().length);
  projetsAEvaluer = computed(() => this.projets().filter(p => p.statut === 'A évaluer').length);
  projetsEnCours = computed(() => this.projets().filter(p => p.statut === 'En cours').length);
  projetsTermines = computed(() => this.projets().filter(p => p.statut === 'Terminé').length);

  // Filtres
  filtered = computed(() => {
    let result = this.projets();
    const statut = this.filtreStatut();
    
    if (statut !== 'TOUS') {
      result = result.filter(p => p.statut === statut);
    }
    
    return result;
  });

  ngOnInit() {
    this.chargerProjets();
  }

  chargerProjets() {
    this.loading.set(true);
    
    // TODO: Remplacer par appel API réel
    this.projets.set([
      {
        id: '32',
        identifiant: '32',
        titre: 'Restauration des mangroves',
        budget: 10000000,
        typeSubvention: 'Petite subvention',
        date: '23/09/2025',
        statut: 'En cours'
      },
      {
        id: '33',
        identifiant: '33',
        titre: 'pecherie artisanale',
        budget: 8000000,
        typeSubvention: 'Petite subvention',
        date: '20/09/2025',
        statut: 'A évaluer'
      },
      {
        id: '34',
        identifiant: '34',
        titre: 'Restauration et suivi de 10 hectares',
        budget: 60000000,
        typeSubvention: 'Moyenne subvention',
        date: '18/09/2025',
        statut: 'A évaluer'
      },
      {
        id: '35',
        identifiant: '35',
        titre: 'Restauration et suivi de 10 hectares',
        budget: 60000000,
        typeSubvention: 'Moyenne subvention',
        date: '18/09/2025',
        statut: 'A évaluer'
      },
      {
        id: '36',
        identifiant: '36',
        titre: 'Restauration et suivi de 10 hectares',
        budget: 60000000,
        typeSubvention: 'Moyenne subvention',
        date: '18/09/2025',
        statut: 'A évaluer'
      },
      {
        id: '37',
        identifiant: '37',
        titre: 'Restauration et suivi de 10 hectares',
        budget: 60000000,
        typeSubvention: 'Moyenne subvention',
        date: '18/09/2025',
        statut: 'Terminé'
      }
    ]);

    this.loading.set(false);
  }

  setFiltreStatut(statut: string) {
    this.filtreStatut.set(statut);
  }

  evaluerProjet(projetId: string) {
    this.router.navigate(['/evaluateur/evaluations', projetId]);
  }

  continuerEvaluation(projetId: string) {
    this.router.navigate(['/evaluateur/evaluations', projetId]);
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/evaluateur/login');
  }

  trackById = (index: number, item: any) => item.id;
}