import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public navCtrl: NavController, public toastController: ToastController, private databaseService: DatabaseService) { }

  ngOnInit() {
  }

  getSong(event){
    console.log(event);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = () => {

      // get the blob of the image:
      let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
      console.log(blob);
      
      // create blobURL, such that we could use it in an image element:
      this.databaseService.data.song = URL.createObjectURL(blob);

    };

    reader.onerror = (error) => {

      //handle errors

    };
  }

  async atras() {
    if((await this.databaseService.check_changes().then()).valueOf()){
      const toast = await this.toastController.create({
        header: 'Unsaved changes',
        message: 'Do you want to exit?',
        position: 'middle',
        buttons: [
          {
            text: 'Exit',
            handler: () => {
              this.navCtrl.navigateRoot('/');
            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              
            }
          }
        ]
      });
      toast.present();
    }else{
      this.navCtrl.navigateRoot('/');
    }
  }

  guardar() {
    this.databaseService.save_settings();
    this.navCtrl.navigateRoot('/');
  }

}
