import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import EndPoints from '../common/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {

  host_url = EndPoints.HOST_URL;
  constructor(private http: HttpClient) { }

  get(endpoint: any, queryParams?: any): Observable<any> {
    return this.http.get(`${this.host_url}${endpoint}`, {
      params: queryParams,
    });
  }

  post(endpoint: any, data?: any, queryParam?: any, headers?: any): Observable<any> {
    return this.http.post(`${this.host_url}${endpoint}`, data, {
      params: queryParam,
      headers: headers
    });
  }

  delete(endpoint: any, queryParams?: any): Observable<any> {
    return this.http.delete(`${this.host_url}${endpoint}`, {
      params: queryParams,
    });
  }

  // { 'headers': { "Content-Type": "multipart/form-data" } }
}
