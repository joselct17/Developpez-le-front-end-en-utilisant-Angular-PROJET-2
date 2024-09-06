import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable, of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
//import de OlympicData pour le rajouter dans le type de olympics$ pour eviter les any
import { OlympicData } from 'src/app/core/models/Olympic';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl:string = './assets/mock/olympic.json';

  private olympics$:BehaviorSubject<OlympicData[]> = new BehaviorSubject<OlympicData[]>([]);

  constructor(private http: HttpClient, private router: Router) {}

  // Méthode pour charger les données initiales
  loadInitialData():Observable<OlympicData[]> {
    return this.http.get<OlympicData[]>(this.olympicUrl).pipe(
      tap((value:OlympicData[]) => this.olympics$.next(value)),
      catchError((error, caught:Observable<OlympicData[]>) => {
        // Gestion des erreurs
        console.error(error);
        this.olympics$.next([]);
        return caught;
      })
    );
  }

  // Méthode pour obtenir les données olympiques en tant qu'observable
  getOlympics(): Observable<OlympicData[]> {
    const olympics:Observable<OlympicData[]> = this.olympics$.asObservable()
    return olympics ;
  }

  // Nouvelle méthode pour obtenir les données d'un pays spécifique par ID
  getOlympicById(id: number):Observable<OlympicData|undefined> {
     const country:Observable<OlympicData|undefined> = this.olympics$.pipe(
      map((olympics:OlympicData[]) => olympics.find((country:OlympicData):boolean => country.id === id)),
      catchError((error) => {
        console.error('Error finding country by ID:', error);
        this.router.navigate(['/not-found']);
        return of(undefined);
      })
    );
    return country;
  }
}
