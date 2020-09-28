import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

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

  public filters_copy: {
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


  constructor(public toastController: ToastController, private router: Router, private route: ActivatedRoute) {
    route.params.subscribe(params => {
      console.log(params);
      this.filters = JSON.parse(JSON.stringify(params));
      this.filters_copy = JSON.parse(JSON.stringify(params));
      console.log(this.filters);
    });
  }

  ngOnInit() {
  }

  async filter() {
    if(this.filters.start_date && !this.filters.end_date){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce and ending date',
        duration: 4000
      });
      toast.present();
      return
    }
    if(!this.filters.start_date && this.filters.end_date){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce and starting date',
        duration: 4000
      });
      toast.present();
      return
    }
    if(new Date(this.filters.start_date).getTime() > new Date(this.filters.end_date).getTime()){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'The starting date cannot be later than the ending date',
        duration: 4000
      });
      toast.present();
      return
    }
    if(this.filters.start_time && !this.filters.end_time){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce and ending time',
        duration: 4000
      });
      toast.present();
      return
    }
    if(!this.filters.start_time && this.filters.end_time){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce and starting time',
        duration: 4000
      });
      toast.present();
      return
    }
    if(this.filters.min_dur < 0){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce a positive min. duration',
        duration: 4000
      });
      toast.present();
      return
    }
    if(this.filters.max_dur < 0){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce a positive max. duration',
        duration: 4000
      });
      toast.present();
      return
    }
    if(this.filters.max_dur < this.filters.min_dur){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'max. duration can not be smaller than min.duration',
        duration: 4000
      });
      toast.present();
      return
    }

    console.log(this.filters.start_date, this.filters.end_date);
    console.log(this.filters.start_time, this.filters.end_time);
    console.log(this.filters.min_dur, this.filters.max_dur);
    this.router.navigate(['/record', this.filters]);
  }

  navigateRecord(){
    this.router.navigate(['/record', this.filters_copy]);
  }

}
