import { Component, OnInit } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx'
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { ToastController } from '@ionic/angular';

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

  constructor(private databaseService: DatabaseService,private router: Router, private http: HTTP, private route: ActivatedRoute, private toastController: ToastController) {
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
    const headers = {
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa(this.databaseService.data.server_user + ':' + this.databaseService.data.server_password)
      };
    this.http.get('http://' + this.databaseService.data.ip + ':8333/barks.json', {}, headers).then(
      data => {
        console.log(data);
        // let prevDate: Date = null;
        // let newDay: boolean = false;
        // for(let elem of data.reverse()){
        //   let fecha = new Date(elem.date);
        //   if(prevDate && prevDate.getDate() != fecha.getDate()){
        //     newDay = true;
        //     console.log('newday');

        //   }
        //   this.bark_data.push({'duration': elem.duration, 'date': fecha, 'newDay': newDay});
        //   prevDate = fecha;
        //   newDay = false;
        // }
        // console.log(this.bark_data);
        // this.filter();
      }).catch(
      async error => {
        console.log(error);
        if(error.status == '401'){
          const toast = await this.toastController.create({
            color: 'danger',
            header: 'Error',
            message: 'The server credentials are wrong please correct them',
            duration: 5000
          });
          toast.present();
        } else if(error.status == 0){
          const toast = await this.toastController.create({
            color: 'danger',
            header: 'Error',
            message: "The Raspberry's IP is wrong please check it again",
            duration: 5000
          });
          toast.present();
        } else{
          const toast = await this.toastController.create({
            color: 'danger',
            header: 'Error',
            message: error.statusText,
            duration: 5000
          });
          toast.present();
        }
    });
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
