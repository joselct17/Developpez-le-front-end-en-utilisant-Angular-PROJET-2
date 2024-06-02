import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap, filter, shareReplay, first } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  public olympics$ = new BehaviorSubject<Olympic[]>([]);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next([]);
        return caught;
      })
    );
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }
  // Recup un tableau de paires pays:medailles sous le format de pieChart de ngx-charts
  getMedalsPerCountry(): Observable<{ name: string; value: number }[]> {
    return this.olympics$.pipe(
      map((olympics) =>
        olympics.map((olympic) => ({
          name: olympic.country || '',
          value: olympic.participations
            ? olympic.participations.reduce(
                (total, participation) => total + participation.medalsCount,
                0
              )
            : 0,
        }))
      )
    );
  }

  // Recupere un tableau de pays
  getCountries() {
    return this.olympics$.pipe(
      map((olympics) => {
        let countries: string[] = [];
        olympics.forEach((olympic) => {
          if (olympic.country) {
            countries.push(olympic.country);
          }
        });
        return countries;
      })
    );
  }

  // Recupere le nombre de JO pris en compte dans la bdd
  getNumberOfJOs(): Observable<number> {
    return this.olympics$.pipe(
      map((olympics) => {
        if (olympics.length > 0 && olympics[0].participations) {
          return olympics[0].participations.length;
        } else {
          return 0;
        }
      })
    );
  }

  // Recupere le nombre total de medailles pour un pays
  getTotalMedals(searchedCountry: string): Observable<number> {
    return this.olympics$.pipe(
      map((olympics) => {
        const countryOlympic = olympics.find(
          (olympic) => olympic.country === searchedCountry
        );

        if (!countryOlympic || !countryOlympic.participations) {
          return 0; 
        }

        return countryOlympic.participations.reduce(
          (total, participation) => total + participation.medalsCount,
          0
        );
      })
    );
  }


  // Recupere le nombre total d'athletes pour un pays
  getTotalAthletes(searchedCountry: string): Observable<number> {
    return this.olympics$.pipe(
      map((olympics) => {
        const countryOlympic = olympics.find(
          (olympic) => olympic.country === searchedCountry
        );

        if (!countryOlympic || !countryOlympic.participations) {
          return 0;
        }

        return countryOlympic.participations.reduce(
          (total, participation) => total + participation.athleteCount,
          0
        );
      })
    );
  }

  //Recupere, pour un pays, le nombre de medailles par année au format lineChart de ngx-charts
  getMedalsPerYear(searchedCountry: string): Observable<{ name: string; series: { name: string; value: number }[] }[]> {
    return this.olympics$.pipe(
      map((olympics) => {
        const countryOlympic = olympics.find(
          (olympic) => olympic.country === searchedCountry
        );

        if (!countryOlympic || !countryOlympic.participations) {
          return [{ name: '', series: [] }];
        }

        return [{
          name: searchedCountry,
          series: countryOlympic.participations.map((participation) => ({
            name: participation.year.toString(),
            value: participation.medalsCount,
          }))
        }];
      })
    );
  }

  //verifie si un pays est dans la bdd
  isCountryInDatabase(country: string): Observable<boolean> {
    console.log('Checking database for country:', country); // for debugging
    return this.olympics$.pipe(
      first(),
      tap(response => console.log('Response:', response)), // for debugging
      map((olympics) => olympics.some((olympic) => olympic.country === country))
    );
  }
}
