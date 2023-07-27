import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import EndPoints from '../common/endpoints';
import { AuthModel } from '../modules/auth/models/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiCallsService {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  host_url = EndPoints.HOST_URL;
  _headers: any;
  constructor(private http: HttpClient) {
    const token: any = this.getAuthFromLocalStorage();
    this._headers = new HttpHeaders({
      ['Auth-Token']: token.token,
    });
  }

  get(endpoint: any, queryParams?: any): Observable<any> {
    return this.http.get(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: this._headers,
    });
  }

  getDocument(endpoint: string, queryParams?: any): Observable<Blob> {
    return this.http.get(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: this._headers,
      responseType: 'blob',
    });
  }

  post(endpoint: any, data?: any, queryParam?: any): Observable<any> {
    return this.http.post(`${this.host_url}${endpoint}`, data, {
      params: queryParam,
      headers: this._headers,
    });
  }

  delete(endpoint: any, queryParams?: any): Observable<any> {
    return this.http.delete(`${this.host_url}${endpoint}`, {
      params: queryParams,
      headers: this._headers
    });
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  // { 'headers': { "Content-Type": "multipart/form-data" } }
}
