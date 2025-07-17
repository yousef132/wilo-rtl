import { Injectable } from '@angular/core';
import { Content, Program, Section, User } from '../pages/admin-dashboard/admin-dashboard.component';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
 private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  // User Management APIs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  assignUserToProgram(userId: number, programId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/programs/${programId}`, {});
  }

  removeUserFromProgram(userId: number, programId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/programs/${programId}`);
  }

  // Program Management APIs
  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }

  createProgram(programData: Partial<Program>): Observable<Program> {
    return this.http.post<Program>(`${this.apiUrl}/programs`, programData);
  }

  updateProgram(programId: number, programData: Partial<Program>): Observable<Program> {
    return this.http.put<Program>(`${this.apiUrl}/programs/${programId}`, programData);
  }

  deleteProgram(programId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/programs/${programId}`);
  }

  // Section Management APIs
  createSection(programId: number, sectionData: Partial<Section>): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/programs/${programId}/sections`, sectionData);
  }

  updateSection(sectionId: number, sectionData: Partial<Section>): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/sections/${sectionId}`, sectionData);
  }

  deleteSection(sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}`);
  }

  // Content Management APIs
  createContent(sectionId: number, contentData: Partial<Content>): Observable<Content> {
    return this.http.post<Content>(`${this.apiUrl}/sections/${sectionId}/contents`, contentData);
  }

  updateContent(contentId: number, contentData: Partial<Content>): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/contents/${contentId}`, contentData);
  }

  deleteContent(contentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contents/${contentId}`);
  }

  // Analytics APIs
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }

  getUserEnrollments(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/enrollments`);
  }

  getProgramAnalytics(programId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/programs/${programId}/analytics`);
  }
}
