import { Component, OnInit } from '@angular/core';

import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import { ROWDATA } from "./Data";
import { TRANSLATIONS } from "./Translate";
import { getColumnDefs } from "./Columns";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


    rowData = ROWDATA;
    columnDefs: any;
    localeText: any;

    constructor() {
      this.columnDefs = getColumnDefs('es-ES');
    }

    ngOnInit(): void {

    }

    changeLang(lang: string){
      this.columnDefs = getColumnDefs(lang);
      this.localeText = TRANSLATIONS[lang];
    }

}
