import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private errorOlympic = {id: -1, country: 'Error', participations: []};
  private olympics$ = new BehaviorSubject<Olympic[]>([this.errorOlympic]);

  constructor(private http: HttpClient, private router:Router) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        console.error(error);
        this.router.navigateByUrl("/not-found");
        this.olympics$.next([]);
        return this.olympics$;
      })
    );
  }

  getOlympics() {
    return this.olympics$;
  }

  getOlympic(id: string): Observable<Olympic[]> {
      const olympics = this.getOlympics();
      const olympic = olympics.pipe(
        map(olympics => olympics.filter(olympic => olympic.country === id))
      );
      return olympic;
  }

  getErrorOlympic() {
    return this.errorOlympic;
  }

  calculCountryMedals(country: string): number {
    let medals = 0;
  
    const olympics = this.olympics$.getValue();
  
    olympics.forEach(olympic => {
      if (olympic.country === country) {
        medals += olympic.participations.reduce((total, participation) => total + participation.medalsCount, 0);
      }
    });
  
    return medals;
  }
  

calculJoNumber(): number {
  let jos = 0;
  const uniqueJo = new Set<number>();

  const olympics = this.olympics$.getValue();

  olympics.forEach(olympic => {
    olympic.participations.forEach(part => {
      uniqueJo.add(part.year); 
    });
  });

  jos = uniqueJo.size;
  return jos;
}


  calculJoCountryNumber(country:string): number {
    var jos = 0;
    var uniqueJo: number[] = [];
    const countryParticipations = this.olympics$.pipe(
      map(olympics => olympics.find(olympic => olympic.country === country)),
      map(olympic => olympic ? olympic.participations : []),
      take(1)
    );

    countryParticipations.subscribe(participations => {
      participations.forEach(part => {
      if (!uniqueJo.includes(part.year)) {
        uniqueJo.push(part.year);
        jos++;
      }
      });
    });
    return jos;
  }

  calculAthletesNumber(country:string): number {
    let athletes = 0;
    const countryParticipations = this.olympics$.pipe(
      map(olympics => olympics.find(olympic => olympic.country === country)),
      map(olympic => olympic ? olympic.participations : []),
      take(1)
    );

    countryParticipations.subscribe(participations => {
      athletes = participations.reduce((total, participation) => total + participation.athleteCount, 0);
    });
    return athletes;
  }
}
