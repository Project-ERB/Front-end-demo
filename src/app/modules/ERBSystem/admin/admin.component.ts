import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {

  latitude!: number;
  longitude!: number;

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        console.log('Latitude:', this.latitude);
        console.log('Longitude:', this.longitude);
      }, (error) => {
        console.error('Error:', error);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

}
