import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {OlympicService} from "../../core/services/olympic.service";
import {Chart, ChartData} from "chart.js";
import {OlympicData} from "../../core/models/Olympic";


@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit{

  //definis le tableau vide de données en accord au model
  participation: OlympicData[] = [];

  //subscription agréger plusieurs abonnements en un seul
  private subscription : Subscription = new Subscription();

  //declaration de chart
  private chart: Chart | undefined;

  //constructeur service
  constructor(private olympicService: OlympicService) { }

ngOnInit() {
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe()
    );

    this.subscription.add(
      this.olympicService.getOlympics().subscribe(data=>{
        this.participation = data;
        this.createChart();
      })
    )
}

  ngAfterViewInit(): void {
    if(this.participation.length) {
      this.createChart();
    }
  }

  createChart() {
    const chartElement = document.getElementById('detailChart') as HTMLCanvasElement;
    if (!chartElement) {
      return;
    }
    if(this.chart) {
      this.chart.destroy();
    }
  }


  // const chartData: ChartData<'line', number[], string> = {
  //   labels:this.participation.map(item=>item.participations),
  //   datasets:[{
  //     label:'',
  //     data:this.participation.map(item=>item.participations.reduce((acc, participation)=>acc + participation.))
  //   }]
  // }



















  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }




}
