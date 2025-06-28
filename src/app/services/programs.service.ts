import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProgramDetailsForUpdate, ProgramCard, ProgramDetails, ProgramQuery, Section } from '../models/program/programs';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { map } from 'rxjs';
import { ContentSubscribers } from '../models/content/content';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  baseUrl = environment.API_URL;
  constructor(private http: HttpClient) { }

  registerInProgram(programId: number) {
    return this.http.post<Result<number>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.REGISTER_IN_PROGRAM + programId,
      null
    ).pipe(map(response => response.data));
  }


  getPrograms(query: ProgramQuery) {
    let params = new HttpParams();
    if (query.title) params = params.set('title', query.title);
    if (query.index) params = params.set('index', query.index.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
  
    return this.http.get<Result<ProgramCard[]>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_ALL_PROGRAMS,{params:params}
    ).pipe(map(response => response.data));
  }
  
  getStudentPrograms() {
    return this.http.get<Result<ProgramCard[]>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_STUDENT_PROGRAMS
    ).pipe(map(response => response.data));
  }
  
  getProgramsForCoach(query: ProgramQuery) {
    let params = new HttpParams();
    if (query.title) params = params.set('title', query.title);
    if (query.index) params = params.set('index', query.index.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
  
    return this.http.get<Result<ProgramCard[]>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.ADMIN_PROGRAMS
    ).pipe(map(response => response.data));
  }
  
  getProgramDetails(id: number) {
    return this.http.get<Result<ProgramDetails>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_PROGRAM_DETAILS + id
    ).pipe(map(response => response.data));
  }
  

  
  createProgram(formData: FormData) {
    return this.http.post<Result<number>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.CREATE_PROGRAM,
      formData
    ).pipe(map(response => response.data));
  }
  
  updateProgramDetails(program: FormData) {
    return this.http.put<Result<any>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.UPDATE_PROGRAM_DETAILS,
      program
    ).pipe(map(response => response.data));
  }
  

  getProgramDetailsForDashboard(programId: number) {
    return this.http.get<Result<ProgramDetailsForUpdate>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_PROGRAM_DETAILS_FOR_DASHBOARD + programId
    ).pipe(
      map(response => response.data)
    );
  }

  getContentSubscribers(contentId: number) {
    return this.http.get<Result<ContentSubscribers[]>>(
      this.baseUrl + API_CONSTANTS.CONTENT.GET_SUBSCRIBERS + contentId
    ).pipe(map(response => response.data));
  }


  


}
