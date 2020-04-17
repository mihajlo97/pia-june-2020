import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  serverResponse;

  constructor(private http : HttpClient) { }

  sendRequest() {
    this.http.post('http://localhost:3000/', { msg: 'Sending request to server...'})
      .subscribe(data => {
        this.serverResponse = data.toString();
    });
  }

}
