import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private ip: string = '192.168.0.18';
  private server_user: string = 'server admin';
  private server_password: string = 'test server';
  private camera_user: string = 'camera admin';
  private camera_password: string = 'test camera';
  private song:string = '';
  private song_autoplay: boolean = false;

  constructor() { }

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
      this.song = URL.createObjectURL(blob);

    };

    reader.onerror = (error) => {

      //handle errors

    };
  }

  save_settings() {
    console.log(this.song);
  }

}
