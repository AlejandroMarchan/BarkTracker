import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

  private start_date: string = "";
  private end_date: string = "";
  private start_time: string = "";
  private end_time: string = "";
  private min_dur: number = 0;
  private max_dur: number = null;


  constructor() { }

  ngOnInit() {
  }

  filter() {
    console.log(this.start_date, this.end_date);
    console.log(this.start_time, this.end_time);
  }

}
