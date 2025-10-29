import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

/**
 * Interface pour un évaluateur
 */
interface Evaluateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  projetsAttribues: number;
  projetsTermines: number;
  delaiRestant: string;
  extensionStatut: 'Demandée' | 'Autorisée' | 'Refusée' | null;
}

/**
 * Interface pour créer un nouvel évaluateur
 */
interface NouvelEvaluateur {
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-evaluateurs',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './evaluateurs.html',
  styleUrls: ['./evaluateurs.css']
})
export class Evaluateurs implements OnInit {
  // Statistiques de la sidebar
  totalProjets = 60;
  totalAAP = 3;

  // Statistiques des évaluateurs
  totalEvaluateurs = 20;
  evaluateursActifs = 6;

  // Liste des évaluateurs
  evaluateurs: Evaluateur[] = [
    {
      id: '1',
      nom: 'BIANG',
      prenom: 'Kenny',
      email: 'kenny.biang@example.com',
      projetsAttribues: 10,
      projetsTermines: 4,
      delaiRestant: '1h30',
      extensionStatut: 'Demandée'
    },
    {
      id: '2',
      nom: 'OBAME',
      prenom: 'Noemy',
      email: 'noemy.obame@example.com',
      projetsAttribues: 5,
      projetsTermines: 5,
      delaiRestant: 'Terminé',
      extensionStatut: 'Autorisée'
    },
    {
      id: '3',
      nom: 'SACAMA',
      prenom: 'Gerson',
      email: 'gerson.sacama@example.com',
      projetsAttribues: 10,
      projetsTermines: 5,
      delaiRestant: '3h23',
      extensionStatut: 'Refusée'
    },
    {
      id: '4',
      nom: 'RAPONTHOMBO',
      prenom: 'Georges',
      email: 'georges.raponthombo@example.com',
      projetsAttribues: 5,
      projetsTermines: 5,
      delaiRestant: 'Terminé',
      extensionStatut: 'Autorisée'
    },
    {
      id: '5',
      nom: 'MINSTSA',
      prenom: 'Morel',
      email: 'morel.minstsa@example.com',
      projetsAttribues: 5,
      projetsTermines: 5,
      delaiRestant: 'Terminé',
      extensionStatut: 'Autorisée'
    },
    {
      id: '6',
      nom: 'MINSTSA',
      prenom: 'Morel',
      email: 'morel.minstsa@example.com',
      projetsAttribues: 5,
      projetsTermines: 5,
      delaiRestant: 'Terminé',
      extensionStatut: 'Autorisée'
    }
  ];

  // Modal
  isModalOuverte = false;
  nouvelEvaluateur: NouvelEvaluateur = {
    nom: '',
    prenom: '',
    email: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialisation du composant
    console.log('✅ Composant Evaluateurs initialisé');
    console.log('📊 Nombre d\'évaluateurs:', this.evaluateurs.length);
  }

  /**
   * Ouvrir le modal de création d'évaluateur
   */
  ouvrirModal(): void {
    this.isModalOuverte = true;
    console.log('📝 Ouverture du modal de création');
  }

  /**
   * Fermer le modal
   */
  fermerModal(): void {
    this.isModalOuverte = false;
    // Réinitialiser le formulaire
    this.nouvelEvaluateur = {
      nom: '',
      prenom: '',
      email: ''
    };
    console.log('❌ Fermeture du modal');
  }

  /**
   * Créer un nouvel évaluateur
   */
  creerEvaluateur(): void {
    console.log('➕ Création d\'un nouvel évaluateur:', this.nouvelEvaluateur);

    // Générer un ID unique
    const nouvelId = (this.evaluateurs.length + 1).toString();

    // Créer le nouvel évaluateur
    const evaluateur: Evaluateur = {
      id: nouvelId,
      nom: this.nouvelEvaluateur.nom,
      prenom: this.nouvelEvaluateur.prenom,
      email: this.nouvelEvaluateur.email,
      projetsAttribues: 0,
      projetsTermines: 0,
      delaiRestant: '-',
      extensionStatut: null
    };

    // Ajouter à la liste
    this.evaluateurs.push(evaluateur);

    // Mettre à jour les statistiques
    this.totalEvaluateurs++;

    // Fermer le modal
    this.fermerModal();

    // Afficher un message de succès
    alert(`✅ Évaluateur ${evaluateur.prenom} ${evaluateur.nom} créé avec succès !`);

    console.log('✅ Évaluateur créé:', evaluateur);
    console.log('📊 Total évaluateurs:', this.totalEvaluateurs);

    // TODO: Appeler l'API backend pour créer l'évaluateur
    // this.evaluateurService.creer(this.nouvelEvaluateur).subscribe({
    //   next: (response) => {
    //     console.log('✅ Évaluateur créé:', response);
    //     this.chargerEvaluateurs();
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur:', error);
    //     alert('Erreur lors de la création');
    //   }
    // });
  }

  /**
   * Approuver une extension de délai
   */
  approuverExtension(evaluateur: Evaluateur): void {
    console.log('✅ Approbation extension pour:', evaluateur.prenom, evaluateur.nom);

    // Mettre à jour le statut
    evaluateur.extensionStatut = 'Autorisée';

    // Afficher un message
    alert(`✅ Extension approuvée pour ${evaluateur.prenom} ${evaluateur.nom}`);

    // TODO: Appeler l'API backend
    // this.evaluateurService.approuverExtension(evaluateur.id).subscribe({
    //   next: () => {
    //     console.log('✅ Extension approuvée');
    //     this.chargerEvaluateurs();
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur:', error);
    //   }
    // });
  }

  /**
   * Refuser une extension de délai
   */
  refuserExtension(evaluateur: Evaluateur): void {
    console.log('❌ Refus extension pour:', evaluateur.prenom, evaluateur.nom);

    // Mettre à jour le statut
    evaluateur.extensionStatut = 'Refusée';

    // Afficher un message
    alert(`❌ Extension refusée pour ${evaluateur.prenom} ${evaluateur.nom}`);

    // TODO: Appeler l'API backend
    // this.evaluateurService.refuserExtension(evaluateur.id).subscribe({
    //   next: () => {
    //     console.log('✅ Extension refusée');
    //     this.chargerEvaluateurs();
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur:', error);
    //   }
    // });
  }

  /**
   * Supprimer un évaluateur
   */
  supprimerEvaluateur(evaluateur: Evaluateur): void {
    // Demander confirmation
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer ${evaluateur.prenom} ${evaluateur.nom} ?`
    );

    if (!confirmation) {
      return;
    }

    console.log('🗑️ Suppression de:', evaluateur.prenom, evaluateur.nom);

    // Supprimer de la liste
    const index = this.evaluateurs.findIndex(e => e.id === evaluateur.id);
    if (index !== -1) {
      this.evaluateurs.splice(index, 1);

      // Mettre à jour les statistiques
      this.totalEvaluateurs--;

      // Afficher un message
      alert(`✅ Évaluateur ${evaluateur.prenom} ${evaluateur.nom} supprimé avec succès`);

      console.log('✅ Évaluateur supprimé');
      console.log('📊 Total évaluateurs:', this.totalEvaluateurs);
    }

    // TODO: Appeler l'API backend
    // this.evaluateurService.supprimer(evaluateur.id).subscribe({
    //   next: () => {
    //     console.log('✅ Évaluateur supprimé');
    //     this.chargerEvaluateurs();
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur:', error);
    //     alert('Erreur lors de la suppression');
    //   }
    // });
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    const confirmation = confirm('Voulez-vous vraiment vous déconnecter ?');

    if (confirmation) {
      console.log('👋 Déconnexion...');
      // TODO: Appeler le service d'authentification
      // this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Charger les évaluateurs depuis l'API
   * (À implémenter avec le service)
   */
  private chargerEvaluateurs(): void {
    // TODO: Appeler l'API
    // this.evaluateurService.obtenirTous().subscribe({
    //   next: (response) => {
    //     this.evaluateurs = response.data;
    //     this.totalEvaluateurs = response.data.length;
    //     // Calculer les évaluateurs actifs
    //     this.evaluateursActifs = response.data.filter(
    //       e => e.projetsAttribues > e.projetsTermines
    //     ).length;
    //   },
    //   error: (error) => {
    //     console.error('❌ Erreur chargement:', error);
    //   }
    // });
  }
}