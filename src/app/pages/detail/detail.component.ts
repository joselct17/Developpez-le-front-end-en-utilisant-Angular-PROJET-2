import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicService } from '../../core/services/olympic.service';
import { Chart, ChartData, ChartConfiguration } from 'chart.js';
import { OlympicData } from '../../core/models/Olympic';
import {ActivatedRoute, Router} from '@angular/router';

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
    private route: ActivatedRoute ,
    private router:Router// Injecter ActivatedRoute pour récupérer l'ID
  ) { }


  ngOnInit() {
    const countryId = +this.route.snapshot.paramMap.get('id')!;

    this.subscription.add(
      this.olympicService.loadInitialData().subscribe(() => {
        this.subscription.add(
          this.olympicService.getOlympicById(countryId).subscribe(data => {
            if (data) {
              this.participation = data;
              this.totalMedals = data.participations.reduce((acc, part) => acc + part.medalsCount, 0);
              this.totalAthletes = data.participations.reduce((acc, part) => acc + part.athleteCount, 0);

              // Appel de la méthode createChart après l'initialisation de la vue
              setTimeout(() => {
                this.createChart();
              }, 0);
            } else {
              this.router.navigate(['/not-found']);
            }
          })
        );
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

