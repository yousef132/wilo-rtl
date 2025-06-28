import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Section } from '../models/program/programs';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { map } from 'rxjs';
import { CreateSection, DahsboardSection } from '../models/section/section';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  baseUrl = environment.API_URL;
  constructor(private http: HttpClient) { }



  createSection(createSection: CreateSection) {
    return this.http.post<Result<Section>>(
      this.baseUrl + API_CONSTANTS.SECTION.CREATE_SECTION,
      createSection
    ).pipe(map(response => response.data));
  }
  
  // in the program details
  getSectionsWithContents(programId: number) {
    return this.http.get<Result<Section[]>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_SECTIONS_WITH_PROGRAMS + programId
    ).pipe(map(response => response.data));
  }
  updateSectionIndex(sectionId: number, newIndex: number,programId:number) {
    // create params object
    const params = {
      sectionId: sectionId,
      newIndex: newIndex,
      programId:programId
    };
    return this.http.put<Result<any>>(
      this.baseUrl + API_CONSTANTS.SECTION.UPDATE_SECTION_INDEX
      , params
    ).pipe(map(response => response.data));
  }
  
    updateSection(sectionId: number, name:string,newIndex:number) {
      // store data in request body
    const params = {
        Id: sectionId,
        name:name,
        index:newIndex
      };

    return this.http.put<Result<any>>(
      this.baseUrl + API_CONSTANTS.SECTION.UPDATE_SECTION
      , params
    ).pipe(map(response => response.data));
  }
  // in the dashboard
  getSectionsForDashboard(programId: number) {
    return this.http.get<Result<DahsboardSection[]>>(
      this.baseUrl + API_CONSTANTS.PROGRAM.GET_SECTIONS_FOR_DASHBOARD + programId
    ).pipe(map(response => response.data));
  } 
  
}
