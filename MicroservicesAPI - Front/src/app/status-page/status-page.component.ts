import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, CommonModule } from '@angular/common';

interface ServiceStatus {
  name: string;
  status: string;
  lastChecked: string;
}

@Component({
  selector: 'app-status-page',
  imports: [NgFor, CommonModule],
  templateUrl: './status-page.component.html',
  styleUrl: './status-page.component.css'
})

export class StatusPageComponent implements OnInit {
  services: ServiceStatus[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadStatus();
    setInterval(() => this.loadStatus(), 10000);
  }

  loadStatus(): void {
    this.http.get<{ services: ServiceStatus[] }>('http://localhost:8080/status')
      .subscribe(data => {
        this.services = data.services;
      });
  }
}
