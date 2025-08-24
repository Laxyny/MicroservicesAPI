import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {

    constructor(private http: HttpClient) { }

    generateReport(storeId: string): Observable<{ id: string }> {

        return this.http.post<{ id: string }>(
            'http://localhost:7000/reports/generate',
            {
                storeId,
                includeProducts: true,
                includeCharts: true,
                locale: 'fr'
            },
            { withCredentials: true }
        );

    }

    downloadReportFile(reportId: string): void {
        this.http.get(`http://localhost:7000/reports/${reportId}`,
            { responseType: 'blob', withCredentials: true })
            .subscribe((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rapport-${reportId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            });
    }
}
