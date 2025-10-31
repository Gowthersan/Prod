import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

interface Critere {
  id: string;
  titre: string;
  description: string;
  note: number;
  noteMax: number;
}

interface ProjetDetail {
  id: string;
  identifiant: string;
  titre: string;
  lieuGroupeCible: string;
  contexteJustification: string;
  objectifs: string;
  resultatsAttendus: string;
  duree: string;
}

@Component({
  selector: 'app-evaluateur-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    HttpClientModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './evaluations.html',
})
export class EvaluateurEvaluations implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State
  projet = signal<ProjetDetail | null>(null);
  criteres = signal<Critere[]>([]);
  critereActifIndex = signal(0);
  commentaire = signal('');
  loading = signal(false);
  showSubmitModal = signal(false);
  showExtensionModal = signal(false);

  // Computed
  critereActif = computed(() => this.criteres()[this.critereActifIndex()]);
  progression = computed(() => {
    const total = this.criteres().length;
    if (total === 0) return 0;
    return Math.round((this.critereActifIndex() / total) * 100);
  });
  totalPoints = computed(() => {
    return this.criteres().reduce((sum, c) => sum + c.note, 0);
  });
  totalPointsMax = computed(() => {
    return this.criteres().reduce((sum, c) => sum + c.noteMax, 0);
  });

  ngOnInit() {
    const projetId = this.route.snapshot.paramMap.get('id');
    if (projetId) {
      this.chargerProjet(projetId);
    }
  }

  chargerProjet(id: string) {
    this.loading.set(true);

    // TODO: Remplacer par appel API réel
    this.projet.set({
      id: id,
      identifiant: '32',
      titre: 'Restauration de 3km de berges',
      lieuGroupeCible: 'Rivières Nkomi & Komo. Groupe cible : 3 comités locaux.',
      contexteJustification: 'Érosion des berges, turbidité, perte de biodiversité & sensibilisation.',
      objectifs: 'Stabiliser les berges ; améliorer la qualité de l\'eau locale.',
      resultatsAttendus: '3 km traités ; 1 8 000 plants ; 6 comités formés ; indicateurs qualité eau en progrès',
      duree: '12 mois'
    });

    this.criteres.set([
      {
        id: '1',
        titre: 'Pertinence',
        description: 'Le projet répond-il clairement aux enjeux de l\'appel d\'offres et du littoral, ces habitants marins et terrestres ?',
        note: 0,
        noteMax: 10
      },
      {
        id: '2',
        titre: 'Cohérence territoriale',
        description: 'Le projet s\'inscrit-il dans une stratégie locale de gestion du littoral ?',
        note: 0,
        noteMax: 10
      },
      {
        id: '3',
        titre: 'Alignement avec les objectifs de l\'appel d\'offres',
        description: 'Le projet répond-il clairement aux enjeux de l\'appel d\'offres et du littoral, ces habitants marins et terrestres ?',
        note: 0,
        noteMax: 10
      }
    ]);

    this.loading.set(false);
  }

  precedent() {
    if (this.critereActifIndex() > 0) {
      this.critereActifIndex.set(this.critereActifIndex() - 1);
    }
  }

  suivant() {
    if (this.critereActifIndex() < this.criteres().length - 1) {
      this.critereActifIndex.set(this.critereActifIndex() + 1);
    }
  }

  allerAuCritere(index: number) {
    this.critereActifIndex.set(index);
  }

  updateNote(note: number) {
    const criteres = this.criteres();
    const index = this.critereActifIndex();
    if (criteres[index]) {
      criteres[index].note = note;
      this.criteres.set([...criteres]);
    }
  }

  sauvegarder() {
    console.log('Sauvegarde de l\'évaluation...');
    console.log('Critères:', this.criteres());
    console.log('Commentaire:', this.commentaire());
    alert('Évaluation sauvegardée avec succès !');
    // TODO: Appel API pour sauvegarder
  }

  ouvrirModalSoumission() {
    // Vérifier que tous les critères sont notés
    const criteresSansNote = this.criteres().filter(c => c.note === 0);
    if (criteresSansNote.length > 0) {
      alert('Veuillez noter tous les critères avant de soumettre');
      return;
    }
    this.showSubmitModal.set(true);
  }

  fermerModalSoumission() {
    this.showSubmitModal.set(false);
  }

  soumettre() {
    console.log('Soumission de l\'évaluation...');
    console.log('Critères:', this.criteres());
    console.log('Commentaire:', this.commentaire());
    console.log('Total points:', this.totalPoints());
    
    // TODO: Appel API pour soumettre l'évaluation
    
    this.fermerModalSoumission();
    alert('Évaluation soumise avec succès !');
    this.router.navigate(['/evaluateur/projets']);
  }

  ouvrirModalExtension() {
    this.showExtensionModal.set(true);
  }

  fermerModalExtension() {
    this.showExtensionModal.set(false);
  }

  demanderExtension() {
    console.log('Demande d\'extension...');
    // TODO: Appel API pour demander une extension
    this.fermerModalExtension();
    alert('Demande d\'extension envoyée à l\'administrateur');
  }

  retour() {
    this.router.navigate(['/evaluateur/projets']);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/evaluateur/login');
  }
}