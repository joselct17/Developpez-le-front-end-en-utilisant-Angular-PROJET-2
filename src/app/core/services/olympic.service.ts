import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
//import de OlympicData pour le rajouter dans le type de olympics$ pour eviter les any
import { OlympicData } from 'src/app/core/models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  //rajout de OlympicData[]
  private olympics$ = new BehaviorSubject<OlympicData[]>([]);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<OlympicData[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next([]);
        return of([]);
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
