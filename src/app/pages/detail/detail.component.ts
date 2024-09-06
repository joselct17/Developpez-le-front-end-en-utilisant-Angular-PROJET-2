import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicService } from '../../core/services/olympic.service';
import { Chart, ChartData, ChartConfiguration } from 'chart.js';
import { OlympicData } from '../../core/models/Olympic';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  participation: OlympicData | undefined;
  totalMedals: number = 0;
  totalAthletes: number = 0;

  private subscription: Subscription = new Subscription();
  private chart: Chart | undefined;

  constructor(
    private olympicService: OlympicService,
    private route: ActivatedRoute  // Injecter ActivatedRoute pour récupérer l'ID
  ) { }

  ngOnInit() {
    //Appel des données au chargement
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe()
    );
    // Récupère l'ID du pays à partir de l'URL. 'snapshot' prend une image instantanée des paramètres de la route.
    // Le '!' à la fin indique à TypeScript que l'on sait que 'id' ne sera pas null ou undefined.
    const countryId = +this.route.snapshot.paramMap.get('id')!;

    // Ajoute un abonnement à la liste des abonnements pour gérer la désinscription automatique à la destruction du composant.
    this.subscription.add(
      // Appel au service pour récupérer les données olympiques du pays correspondant à l'ID.
      this.olympicService.getOlympicById(countryId).subscribe(data => {
        // Si les données sont trouvées pour ce pays (c'est-à-dire que 'data' n'est pas null ou undefined) :
        if (data) {
          // Stocke les données du pays récupérées dans la propriété 'participation' du composant.
          this.participation = data;

          // Calcule le nombre total de médailles remportées par ce pays sur toutes ses participations
          // en utilisant la méthode 'reduce' sur le tableau 'participations'.
          this.totalMedals = data.participations.reduce((acc, part) => acc + part.medalsCount, 0);

          // Calcule le nombre total d'athlètes ayant participé pour ce pays sur toutes ses participations.
          this.totalAthletes = data.participations.reduce((acc, part) => acc + part.athleteCount, 0);

          // Crée le graphique avec les données récupérées.
          this.createChart();
        } else {
          // Si les données ne sont pas trouvées pour l'ID donné, affiche un message d'erreur dans la console.
          console.error('Country not found');
        }
      })
    );
  }


  createChart() {
    const chartElement = document.getElementById('detailChart') as HTMLCanvasElement;
    if (!chartElement || !this.participation) {
      return;
    }


    if (this.chart) {
      this.chart.destroy();
    }

    const chartData: ChartData<'line', number[], string> = {
      labels: this.participation?.participations.map(part => part.year.toString()) || [],
      datasets: [{
        label: 'Medals Over the Years',
        data: this.participation?.participations.map(part => part.medalsCount) || [],
        borderColor: '#16959f',
        fill: false
      }]
    };

    const chartConfig: ChartConfiguration<'line'> = {
      type: 'line',
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
        scales: {
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Medals'
            },
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(chartElement, chartConfig);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

