import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import CryptoJS from 'crypto-js';

@Injectable()
export class DatabaseService {

  public data: {
    ip: string,
    server_user: string,
    server_password: string,
    camera_user: string,
    camera_password: string,
    song:string,
    song_autoplay: boolean
  } = {
    ip: '',
    server_user: '',
    server_password: '',
    camera_user: '',
    camera_password: '',
    song: '',
    song_autoplay: false
  };
  private secretkey: string = 'JDGASGUygjhdgasugdFUDGJGJHGUFGDSFUASBJHGD';

  constructor(private storage: Storage) { 
    console.log('Database service loaded');
    this.get_settings();
  }

  check_changes() {
    let stored_data = {};
    return this.storage.get('data').then((val) => {
      if(val){
        console.log(val);
        for (let key of Object.keys(this.data)) {
          if(key == 'song_autoplay'){
            stored_data[key] = val[key];
          }else{
            stored_data[key] = CryptoJS.AES.decrypt(val[key], this.secretkey).toString(CryptoJS.enc.Utf8);
          }
          console.log(this.data[key], stored_data[key], this.data[key] != stored_data[key]);
          if(this.data[key] != stored_data[key]){
            return true;
          }
        }
      }
      return false;
    });
  }

  data_stored() {
    return this.storage.get('data').then((val) => {
      if(val){
        return true;
      }else{
        return false
      }
    });
  }

  get_settings() {
    this.storage.get('data').then((val) => {
      if(val){
        console.log(val);
        for (let key of Object.keys(this.data)) {
          if(key == 'song_autoplay'){
            this.data[key] = val[key];
          }else{
            this.data[key] = CryptoJS.AES.decrypt(val[key], this.secretkey).toString(CryptoJS.enc.Utf8);
          }
        }
      }
      console.log(this.data);
    });
  }

  save_settings() {
    let encryptedData = JSON.parse(JSON.stringify(this.data));
    for (let key of Object.keys(this.data)) {
      if(key == 'song_autoplay'){
        encryptedData[key] = this.data[key];
      }else{
        encryptedData[key] = CryptoJS.AES.encrypt(this.data[key], this.secretkey).toString();
      }
    }
    console.log(encryptedData);
    this.storage.set('data', encryptedData);
  }

}
