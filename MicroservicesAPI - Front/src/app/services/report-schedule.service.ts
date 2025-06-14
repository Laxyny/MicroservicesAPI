import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportScheduleService {
    private apiUrl = 'http://localhost:7000';

    constructor(private http: HttpClient) { }

    getReportSchedule(storeId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/reports/schedule/${storeId}`, { withCredentials: true });
    }

    saveReportSchedule(schedule: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/reports/schedule`, schedule, { withCredentials: true });
    }

    getReportHistory(storeId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/reports/history/${storeId}`, { withCredentials: true });
    }

    downloadReport(reportId: string): void {
        window.open(`${this.apiUrl}/reports/${reportId}`, '_blank');
    }
}