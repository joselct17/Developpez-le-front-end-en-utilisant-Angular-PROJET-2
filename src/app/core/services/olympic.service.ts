import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
//import de OlympicData pour le rajouter dans le type de olympics$ pour eviter les any
import { OlympicData } from 'src/app/core/models/Olympic';

@Injectable({
  providedIn: 'root', // Fournit ce service à la racine de l'application, rendant ce service disponible partout dans l'application
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json'; // URL de l'emplacement du fichier JSON contenant les données olympiques

  private olympics$ = new BehaviorSubject<OlympicData[]>([]); // BehaviorSubject pour stocker et émettre les données olympiques. Initialisé avec un tableau vide

  constructor(private http: HttpClient) {} // Injection du service HttpClient pour effectuer des requêtes HTTP

  // Méthode pour charger les données initiales
  loadInitialData() {
    return this.http.get<OlympicData[]>(this.olympicUrl).pipe( // Effectue une requête HTTP GET pour récupérer les données olympiques
      tap((value) => this.olympics$.next(value)), // Utilise l'opérateur tap pour mettre à jour les données du BehaviorSubject avec les données récupérées
      catchError((error, caught) => {
        // Gestion des erreurs
        console.error(error); // Affiche l'erreur dans la console
        this.olympics$.next([]); // Met à jour le BehaviorSubject avec un tableau vide en cas d'erreur
        return of([]); // Retourne un observable émettant un tableau vide
      })
    );
  }

  // Méthode pour obtenir les données olympiques en tant qu'observable
  getOlympics() {
    return this.olympics$.asObservable(); // Retourne le BehaviorSubject en tant qu'observable pour permettre aux autres parties de l'application de s'abonner aux mises à jour des données olympiques
  }
}
