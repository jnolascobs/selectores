import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { switchMap, tap } from "rxjs/operators";
import { Observable } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { ShortCountry, AllNamesCountry } from '../../interfaces/countries.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required]
  })

  // fill selectors
  regions: string[] = [];
  countries: ShortCountry[] = [];
  // borders: string[] = [];
  borders: ShortCountry[] = [];

  // UI
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }

  ngOnInit(): void {
    this.regions = this.countriesService.regions;

    // on change region
    this.myForm.get('region')?.valueChanges.pipe(
      tap(() => {
        this.myForm.get('country')?.reset('');
        this.loading = true;
      }),
      switchMap(region => this.countriesService.getCountriesByRegion(region))
    ).subscribe(
      countries => {
        this.countries = [];
        this.loading = false;
        // each country has more than one name, but we just need the common one
        countries.map(country => {
          const newCountry = {
            name: '',
            code: ''
          };
          newCountry.name = country.name.common;
          newCountry.code = country.cca3;
          this.countries.push(newCountry);
        })
        // sort by name
        this.countries.sort(this.sortArray);
      }
    )

    // on change country
    this.myForm.get('country')?.valueChanges.pipe(
      tap(() => {
        this.myForm.get('border')?.reset('');
        this.loading = true;
      }),
      switchMap(code => this.countriesService.getCountryByCode(code)),
      switchMap(countries => (countries) ? this.countriesService.getCountryByBorder(countries[0].borders) : this.countriesService.getCountryByBorder([]))
    ).subscribe(
      // the service return an array even if there is only one object
      countries => {
        this.loading = false;
        this.borders = [];
        countries.map(country => {
          const newBorder = {
            name: '',
            code: ''
          };
          newBorder.name = country.name.common;
          newBorder.code = country.cca3;
          this.borders.push(newBorder);
        })
        // sort by name
        this.borders.sort(this.sortArray);        
      }
    ) 
    
  }

  sortArray(x: ShortCountry, y: ShortCountry){
    if (x.name < y.name) {return -1;}
    if (x.name > y.name) {return 1;}
    return 0;
  }

  save() {
    console.log(this.myForm.value);
  }

}
