import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import EndPoints from '../common/endpoints';
import { AuthModel } from '../modules/auth/models/auth.model';
import { environment } from 'src/environments/environment';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root',
})
export class ApiCallsService {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  host_url = environment.apiUrl;

  constructor(private http: HttpClient, private utils: Utils) {}

  get(endpoint: any, queryParams?: any): Observable<any> {
    const token: any = this.utils.getAuth();
    const _headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
    return this.http.get(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: _headers,
    });
  }

  getDocument(endpoint: string, queryParams?: any): Observable<Blob> {
    const token: any = this.utils.getAuth();
    const _headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
    return this.http.get(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: _headers,
      responseType: 'blob',
    });
  }

  post(endpoint: any, data?: any, queryParam?: any): Observable<any> {
    const token: any = this.utils.getAuth();
    const _headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
    return this.http.post(`${this.host_url}${endpoint}`, data, {
      params: queryParam,
      headers: _headers,
    });
  }

  delete(endpoint: any, queryParams?: any): Observable<any> {
    const token: any = this.utils.getAuth();
    const _headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
    return this.http.delete(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: _headers,
    });
  }

  put(endpoint: any, data?: any, queryParam?: any): Observable<any> {
    const token: any = this.utils.getAuth();
    const _headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
    return this.http.put(`${this.host_url}${endpoint}`, data, {
      params: queryParam,
      headers: _headers,
      responseType: 'text',
    });
  }
  // { 'headers': { "Content-Type": "multipart/form-data" } }
}
