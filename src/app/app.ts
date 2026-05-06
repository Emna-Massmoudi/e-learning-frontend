import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('elearning-frontend');

  private apiUrl = 'https://elearning-backend-1-lb7k.onrender.com';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get(`${this.apiUrl}/ping`, { responseType: 'text' }).subscribe();

    setInterval(() => {
      this.http.get(`${this.apiUrl}/ping`, { responseType: 'text' }).subscribe();
    }, 600000);
  }
}