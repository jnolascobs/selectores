import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { combineLatest, Observable, of } from 'rxjs';

import { AllNamesCountry, Country } from '../interfaces/countries.interface';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private _baseUrl: string = 'https://restcountries.com/v3.1'
  private _regions: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  get regions(): string[] {
    return [...this._regions];
  }

  constructor(private http: HttpClient) { }

  getCountriesByRegion(region: string): Observable<AllNamesCountry[]> {
    const url: string = `${this._baseUrl}/region/${region}?fields=cca3,name`;
    return this.http.get<AllNamesCountry[]>(url);
  }

  getCountryByCode(code: string): Observable<Country[] | null> {
    if (!code) {
      return of(null);
    }  

    const url = `${this._baseUrl}/alpha/${code}`;
    return this.http.get<Country[]>(url);
  }

  getCountryByCodeShort(code: string): Observable<AllNamesCountry> {
    const url = `${this._baseUrl}/alpha/${code}?fields=name,cca3`;
    return this.http.get<AllNamesCountry>(url);
  }

  getCountryByBorder(borders: string[]): Observable<AllNamesCountry[]> {
    if (!borders) {
      return of([]);
    }

    const requests: Observable<AllNamesCountry>[] = [];

    borders.forEach(code => {
      const request = this.getCountryByCodeShort(code);
      requests.push(request);
    })

    return combineLatest(requests);
  }

}
