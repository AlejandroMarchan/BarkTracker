import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public navCtrl: NavController, public toastController: ToastController, private databaseService: DatabaseService) {
    this.initial_check();
  }

  async initial_check(){
    console.log((await this.databaseService.data_stored().then()).valueOf());
    
    if(!(await this.databaseService.data_stored().then()).valueOf()){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce the IP and SERVER credentials.',
        duration: 4000
      });
      toast.present();
      this.navCtrl.navigateForward('/settings');
    }
  }
  
  async bark_record(){
    if(!this.databaseService.data.ip || !this.databaseService.data.server_user || !this.databaseService.data.server_password){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce the IP and SERVER credentials.',
        duration: 4000
      });
      toast.present();
      this.navCtrl.navigateForward('/settings');
    }else{
      this.navCtrl.navigateForward('/record');
    }
  }

  async camera(){
    if(!this.databaseService.data.ip || !this.databaseService.data.camera_user || !this.databaseService.data.camera_password){
      const toast = await this.toastController.create({
        color: 'danger',
        message: 'Please, introduce the IP and CAMERA credentials.',
        duration: 4000
      });
      toast.present();
      this.navCtrl.navigateForward('/settings');
    }else{
      this.navCtrl.navigateForward('/camera');
    }
  }

}
