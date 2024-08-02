import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { OlympicData } from 'src/app/core/models/Olympic';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';


Chart.register(...registerables);
// J'enregistre tous les composants nécessaires de Chart.js

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
// Je définis le décorateur @Component pour le composant DashboardComponent

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  olympicData: OlympicData[] = [];
  // Je déclare une propriété olympicData pour stocker les données olympiques

  private subscriptions: Subscription = new Subscription();
  // J'initialise une propriété subscriptions pour gérer les abonnements aux Observables

  private chart: Chart | undefined;
  // Je déclare une propriété chart pour stocker l'instance du graphique Chart.js

  constructor(private olympicService: OlympicService) { }
  // Je définis un constructeur qui injecte le service OlympicService

  ngOnInit() {
    // Méthode appelée lors de l'initialisation du composant
    this.subscriptions.add(
      this.olympicService.loadInitialData().subscribe()
      // J'ajoute un abonnement pour charger les données initiales à partir du service OlympicService
    );

    this.subscriptions.add(
      this.olympicService.getOlympics().subscribe(data => {
        this.olympicData = data;
        // Je mets à jour la propriété olympicData avec les données reçues
        this.createChart();
        // Je crée le graphique avec les nouvelles données
      })
    );
  }

  ngAfterViewInit() {
    // Méthode appelée après l'initialisation de la vue du composant
    if (this.olympicData.length) {
      this.createChart();
      // Je crée le graphique si des données olympiques sont disponibles
    }
  }

  createChart() {
    // Méthode pour créer le graphique
    const chartElement = document.getElementById('medalsChart') as HTMLCanvasElement;
    // Je récupère l'élément canvas pour le graphique
    if (!chartElement) {
      return;
      // Si l'élément canvas n'existe pas, je quitte la méthode
    }

    if (this.chart) {
      this.chart.destroy();
      // Si un graphique existe déjà, je le détruis avant de créer un nouveau
    }

    const chartData: ChartData<'pie', number[], string> = {
      labels: this.olympicData.map(item => item.country),
      // Je crée les labels pour le graphique à partir des pays dans les données olympiques
      datasets: [{
        label: 'Total Medals',
        data: this.olympicData.map(item =>
          item.participations.reduce((acc, participation) => acc + participation.medalsCount, 0)
        ),
        // Je calcule le nombre total de médailles pour chaque pays
        backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple']
        // Je définis les couleurs de fond pour les segments du graphique
      }]
    };

    const chartConfig: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      } as any
      // Je force le type pour correspondre avec les données attendues
    };

    this.chart = new Chart(chartElement, chartConfig as any);
    // Je crée une nouvelle instance de Chart avec la configuration définie
  }

  ngOnDestroy() {
    // Méthode appelée lors de la destruction du composant
    this.subscriptions.unsubscribe();
    // Je me désabonne de tous les abonnements pour éviter les fuites de mémoire
    if (this.chart) {
      this.chart.destroy();
      // Si un graphique existe, je le détruis pour libérer les ressources
    }
  }
}
