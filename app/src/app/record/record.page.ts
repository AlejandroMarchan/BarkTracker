import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-record',
  templateUrl: './record.page.html',
  styleUrls: ['./record.page.scss'],
})
export class RecordPage implements OnInit {

  public bark_data: {
    duration: number,
    date: Date,
    newDay: boolean
  }[] = [];

  public filters: {
    'start_date': string,
    'end_date': string,
    'start_time': string,
    'end_time': string,
    'min_dur': number,
    'max_dur': number
  } = {
    'start_date': "",
    'end_date': "",
    'start_time': "",
    'end_time': "",
    'min_dur': 0,
    'max_dur': null
  };

  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute) {
    route.params.subscribe(params => {
      console.log('params', params);
      if(Object.keys(params).length != 0){
        this.filters = JSON.parse(JSON.stringify(params));
      }
      console.log(this.filters);
      this.getData();
    });
   }

  ngOnInit() {
  }

  getData(){
    this.bark_data = [];
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('admin:hola12')
      })
    };
    this.http.get<any>('http://192.168.0.29:8333/barks.json', httpOptions).subscribe(data => {
      console.log(data);
      let prevDate: Date = null;
      let newDay: boolean = false;
      for(let elem of data.reverse()){
        let fecha = new Date(elem.date);
        if(prevDate && prevDate.getDate() != fecha.getDate()){
          newDay = true;
          console.log('newday');
          
        }
        this.bark_data.push({'duration': elem.duration, 'date': fecha, 'newDay': newDay});
        prevDate = fecha;
        newDay = false;
      }
      console.log(this.bark_data);
      this.filter();
    })
  }

  filter(){
    // Filtro fechas
    if(this.filters.start_date && this.filters.end_date){
      this.bark_data = this.bark_data.filter(bark => {
        if(bark.date.getTime() > new Date(this.filters.start_date).getTime() && bark.date.getTime() < new Date(this.filters.end_date).getTime() + 24*60*60*1000){
          return true;
        }
        return false;
      }).slice();
    }
    // if(this.filters.start_time && this.filters.end_time){
    //   this.bark_data = this.bark_data.filter(bark => {
    //     if(bark.date.getTime() > new Date(this.filters.start_date).getTime() && bark.date.getTime() < new Date(this.filters.end_date).getTime() + 24*60*60*1000){
    //       return true;
    //     }
    //     return false;
    //   }).slice();
    // }
    if(this.filters.min_dur && this.filters.max_dur){
      this.bark_data = this.bark_data.filter(bark => {
        if(bark.duration >= this.filters.min_dur && bark.duration <= this.filters.max_dur){
          return true;
        }
        return false;
      }).slice();
    }
    console.log(this.bark_data);
    
  }

  navigateFilter(){
    this.router.navigate(['/filter', this.filters]);
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.getData()
    event.target.complete();
  }

  // Format: 07/09/2020  -  13:22:46
  parseDate(fecha: Date){
    return fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear() + '  -  ' + fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds();
  }
}
