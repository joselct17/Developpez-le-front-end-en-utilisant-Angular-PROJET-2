import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { OlympicData } from 'src/app/core/models/Olympic';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { Router } from '@angular/router';  // Assurez-vous d'importer Router

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  olympicData: OlympicData[] = [];
  cityCount:number=0;
  private subscriptions: Subscription = new Subscription();
  private chart: Chart | undefined;

  constructor(
    private olympicService: OlympicService,
    private router: Router  // Injectez Router ici
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.olympicService.loadInitialData().subscribe()
    );

    this.subscriptions.add(
      this.olympicService.getOlympics().subscribe(data => {
        this.olympicData = data;
        this.calculateCityCount();
        this.createChart();
      })
    );
  }
  calculateCityCount() {
    const cities = new Set<string>();

    this.olympicData.forEach(country => {
      country.participations.forEach(participation => {
        cities.add(participation.city);
      });
    });

    this.cityCount = cities.size;
  }
  ngAfterViewInit() {
    if (this.olympicData.length) {
      this.createChart();
    }
  }

  createChart() {
    const chartElement = document.getElementById('medalsChart') as HTMLCanvasElement;
    if (!chartElement) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const chartData: ChartData<'pie', number[], string> = {
      labels: this.olympicData.map(item => item.country),
      datasets: [{
        label: 'Total Medals',
        data: this.olympicData.map(item =>
          item.participations.reduce((acc, participation) => acc + participation.medalsCount, 0)
        ),
        backgroundColor: ['#7C3D52', '#86A1D8', '#B6CBE5', '#BCE0F0', '#986066']
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
        },
        onClick: (event: any, elements: string | any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedCountry = this.olympicData[index];
            if (selectedCountry) {
              this.router.navigate(['/details', selectedCountry.id]);  // Utilisez this.router ici pour la navigation
            }
          }
        }
      } as any
    };

    this.chart = new Chart(chartElement, chartConfig as any);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
