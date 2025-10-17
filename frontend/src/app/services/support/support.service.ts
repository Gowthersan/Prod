import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environDev } from '../../../environments/environment.development';

export interface SupportContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface SupportResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = environDev.urlServer;

  constructor(private http: HttpClient) {}

  /**
   * Envoie un message de support au backend
   */
  sendSupportMessage(data: SupportContactData): Observable<SupportResponse> {
    return this.http.post<SupportResponse>(`${this.apiUrl}/api/support/contact`, data);
  }
}
