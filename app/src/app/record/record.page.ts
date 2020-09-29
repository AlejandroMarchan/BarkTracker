import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

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

  private barks = [{"duration": 12, "date": "2020-09-25T11:24:15"}, {"duration": 4, "date": "2020-09-25T12:10:52"}, {"duration": 6, "date": "2020-09-26T18:36:00"}, {"duration": 6, "date": "2020-09-26T18:36:08"}, {"duration": 6, "date": "2020-09-26T18:36:16"}, {"duration": 9, "date": "2020-09-27T18:36:24"}, {"duration": 4, "date": "2020-09-28T18:36:32"}, {"duration": 6, "date": "2020-09-28T18:36:40"}, {"duration": 3, "date": "2020-09-28T18:56:30"}]

  constructor(private storage: Storage, private databaseService: DatabaseService,private router: Router, private http: HttpClient, private route: ActivatedRoute, private toastController: ToastController) {
    route.params.subscribe(params => {
      console.log('params', params);
      if(Object.keys(params).length != 0){
        this.filters = JSON.parse(JSON.stringify(params));
        this.filters.min_dur = +this.filters.min_dur;
        this.filters.max_dur = +this.filters.max_dur;
      }
      console.log(this.filters);
      this.getData();
    });
   }

  ngOnInit() {
  }

  async getData(){
    this.bark_data = [];
    if(this.databaseService.data.server_user != 'admin'){
      const toast = await this.toastController.create({
        color: 'danger',
        header: 'Error',
        message: 'The server credentials are wrong please correct them',
        duration: 5000
      });
      toast.present();
    } else if(this.databaseService.data.ip != '192.168.0.18'){
      const toast = await this.toastController.create({
        color: 'danger',
        header: 'Error',
        message: "The Raspberry's IP is wrong please check it again",
        duration: 5000
      });
      toast.present();
    } else{
      this.storage.get('barks').then((val) => {
        let data = this.barks.slice();
        if(val){
          data = val.slice();
        }
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
      });
    }


    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json',
    //     'Authorization': 'Basic ' + btoa(this.databaseService.data.server_user + ':' + this.databaseService.data.server_password)
    //   })
    // };
    // this.http.get<any>('http://' + this.databaseService.data.ip + ':8333/barks.json', httpOptions).subscribe(
    //   data => {
    //     console.log(data);
    //     let prevDate: Date = null;
    //     let newDay: boolean = false;
    //     for(let elem of data.reverse()){
    //       let fecha = new Date(elem.date);
    //       if(prevDate && prevDate.getDate() != fecha.getDate()){
    //         newDay = true;
    //         console.log('newday');

    //       }
    //       this.bark_data.push({'duration': elem.duration, 'date': fecha, 'newDay': newDay});
    //       prevDate = fecha;
    //       newDay = false;
    //     }
    //     console.log(this.bark_data);
    //     this.filter();
    //   },
    //   async error => {
    //     console.log(error);
    //     if(error.status == '401'){
    //       const toast = await this.toastController.create({
    //         color: 'danger',
    //         header: 'Error',
    //         message: 'The server credentials are wrong please correct them',
    //         duration: 5000
    //       });
    //       toast.present();
    //     } else if(error.status == 0){
    //       const toast = await this.toastController.create({
    //         color: 'danger',
    //         header: 'Error',
    //         message: "The Raspberry's IP is wrong please check it again",
    //         duration: 5000
    //       });
    //       toast.present();
    //     } else{
    //       const toast = await this.toastController.create({
    //         color: 'danger',
    //         header: 'Error',
    //         message: error.statusText,
    //         duration: 5000
    //       });
    //       toast.present();
    //     }
    // })
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
    let hoy = new Date();
    hoy.setSeconds(hoy.getSeconds()-5);
    this.barks.push({"duration": Math.floor(Math.random()*10 + 1), "date": hoy.toISOString()})
    this.storage.set('barks', this.barks);
    this.getData()
    event.target.complete();
  }

  // Format: 07/09/2020  -  13:22:46
  parseDate(fecha: Date){
    return fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear() + '  -  ' + this.addCero(fecha.getHours()) + ':' + this.addCero(fecha.getMinutes()) + ':' + this.addCero(fecha.getSeconds());
  }

  addCero(elem: number){
    let elem_string:string = '' + elem;
    if(elem_string.length == 1){
      return '0' + elem_string
    }
    return elem_string
  }
}
