// import { CommonModule } from '@angular/common';
// import { Component, TemplateRef, ViewChild } from '@angular/core';
// import {
//     FormBuilder,
//     FormGroup,
//     FormsModule,
//     ReactiveFormsModule,
//     Validators,
// } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ToastrService } from 'ngx-toastr';
// import { AuthService } from '../../services/authr/auth.service';
// import { UpdateUserForAdminResponse } from '../../models/auth/auth';
// export interface User {
//     id: string;
//     name: string;
//     email: string;

//     role: 'admin' | 'instructor' | 'student';
//     registeredPrograms: string[];
//     joinDate: string;
//     lastLogin: string;
//     isActive: boolean;
// }

// export interface Content {
//     id: number;
//     title: string;
//     type: 'video' | 'document' | 'quiz' | 'assignment';
//     duration?: string;
//     url?: string;
//     description: string;
//     order: number;
//     isPublished: boolean;
// }

// export interface Section {
//     id: number;
//     title: string;
//     description: string;
//     order: number;
//     contents: Content[];
//     isPublished: boolean;
// }

// export interface Program {
//     id: number;
//     title: string;
//     description: string;
//     instructor: string;
//     sections: Section[];
//     enrolledUsers: number;
//     totalSections: number;
//     totalContents: number;
//     createdDate: string;
//     isPublished: boolean;
// }
// @Component({
//     selector: 'app-admin-dashboard',
//     imports: [CommonModule, FormsModule, ReactiveFormsModule],
//     templateUrl: './admin-dashboard.component.html',
//     styleUrl: './admin-dashboard.component.scss',
// })
// export class AdminDashboardComponent {
//     activeTab = 'users';
//     users: User[] = [];
//     programs: Program[] = [];
//     selectedProgram: Program | null = null;
//     expandedSections: { [key: number]: boolean } = {};
//     loading = false;
//     searchTerm = '';
//     selectedRole = 'all';
 
//     // Modal states
//     showUserModal = false;
//     showProgramModal = false;
//     showSectionModal = false;
//     showContentModal = false;

//     // Editing states
//     editingUser: User | null = null;
//     editingProgram: Program | null = null;
//     editingSection: Section | null = null;
//     editingContent: Content | null = null;
//     currentSectionId: number | null = null;

//     tabs = [
//         { id: 'users', label: 'Users' },
//         { id: 'programs', label: 'Programs' },
//         { id: 'analytics', label: 'Analytics' },
//     ];

//     constructor(
//         private fb: FormBuilder,
//         private modalService: NgbModal,
//         private toastr: ToastrService,
//         private authService: AuthService
//     ) {
//         // create user form
   
//     }

//     ngOnInit() {
//         // this.loadUsers();
//         // this.loadPrograms();
//     }


   
//     openUserModal(user?: User) {
//         this.editingUser = user || null;
//         this.showUserModal = true;
//         if (user) {
//             this.editUserForm = this.fb.group({
//                 name: [user.name],
//                 email: [user.email],
//                 role: [user.role],
//                 isActive: [user.isActive],
//             });
//         } else {
//             this.editUserForm = this.fb.group({
//                 name: [''],
//                 email: [''],
//                 role: ['student'],
//                 isActive: [true],
//             });
//         }
//     }
//     // User Management Methods
//     createUser(userData: Partial<User>) {
//         const newUser: User = {
//             id: Date.now().toString(),
//             name: userData.name || '',
//             email: userData.email || '',
//             role: userData.role || 'student',
//             registeredPrograms: [],
//             joinDate: new Date().toISOString(),
//             lastLogin: new Date().toISOString(),
//             isActive: true,
//         };
//         this.users.push(newUser);
//         this.showUserModal = false;
//     }








//     deleteProgram(programId: number) {
//         if (confirm('Are you sure you want to delete this program?')) {
//             // API call: DELETE /api/admin/programs/:id
//             // this.http.delete(`/api/admin/programs/${programId}`).subscribe(() => {
//             //   this.programs = this.programs.filter(p => p.id !== programId);
//             // });

//             this.programs = this.programs.filter((p) => p.id !== programId);
//         }
//     }

//     // Section Management Methods
//     createSection(programId: number, sectionData: Partial<Section>) {
//         const program = this.programs.find((p) => p.id === programId);
//         if (program) {
//             const newSection: Section = {
//                 id: Date.now(),
//                 title: sectionData.title || '',
//                 description: sectionData.description || '',
//                 order: program.sections.length + 1,
//                 contents: [],
//                 isPublished: false,
//             };
//             program.sections.push(newSection);
//             program.totalSections = program.sections.length;
//         }
//         this.showSectionModal = false;
//     }

//     updateSection(sectionId: number, sectionData: Partial<Section>) {
//         // API call: PUT /api/admin/sections/:id
//         // this.http.put<Section>(`/api/admin/sections/${sectionId}`, sectionData).subscribe();

//         if (this.selectedProgram) {
//             const section = this.selectedProgram.sections.find(
//                 (s) => s.id === sectionId
//             );
//             if (section) {
//                 Object.assign(section, sectionData);
//             }
//         }
//         this.showSectionModal = false;
//         this.editingSection = null;
//     }

//     deleteSection(sectionId: number) {
//         if (confirm('Are you sure you want to delete this section?')) {
//             // API call: DELETE /api/admin/sections/:id
//             // this.http.delete(`/api/admin/sections/${sectionId}`).subscribe();

//             if (this.selectedProgram) {
//                 this.selectedProgram.sections =
//                     this.selectedProgram.sections.filter(
//                         (s) => s.id !== sectionId
//                     );
//                 this.selectedProgram.totalSections =
//                     this.selectedProgram.sections.length;
//             }
//         }
//     }

//     // Content Management Methods
//     createContent(sectionId: number, contentData: Partial<Content>) {
//         // API call: POST /api/admin/sections/:sectionId/contents
//         // this.http.post<Content>(`/api/admin/sections/${sectionId}/contents`, contentData).subscribe(content => {
//         //   const section = this.findSectionById(sectionId);
//         //   if (section) {
//         //     section.contents.push(content);
//         //   }
//         //   this.showContentModal = false;
//         // });

//         const section = this.findSectionById(sectionId);
//         if (section) {
//             const newContent: Content = {
//                 id: Date.now(),
//                 title: contentData.title || '',
//                 type: contentData.type || 'video',
//                 duration: contentData.duration,
//                 url: contentData.url,
//                 description: contentData.description || '',
//                 order: section.contents.length + 1,
//                 isPublished: false,
//             };
//             section.contents.push(newContent);
//             if (this.selectedProgram) {
//                 this.selectedProgram.totalContents =
//                     this.selectedProgram.sections.reduce(
//                         (total, s) => total + s.contents.length,
//                         0
//                     );
//             }
//         }
//         this.showContentModal = false;
//     }

//     updateContent(contentId: number, contentData: Partial<Content>) {
//         // API call: PUT /api/admin/contents/:id
//         // this.http.put<Content>(`/api/admin/contents/${contentId}`, contentData).subscribe();

//         if (this.selectedProgram) {
//             for (const section of this.selectedProgram.sections) {
//                 const content = section.contents.find(
//                     (c) => c.id === contentId
//                 );
//                 if (content) {
//                     Object.assign(content, contentData);
//                     break;
//                 }
//             }
//         }
//         this.showContentModal = false;
//         this.editingContent = null;
//     }

//     deleteContent(contentId: number) {
//         if (confirm('Are you sure you want to delete this content?')) {
//             // API call: DELETE /api/admin/contents/:id
//             // this.http.delete(`/api/admin/contents/${contentId}`).subscribe();

//             if (this.selectedProgram) {
//                 for (const section of this.selectedProgram.sections) {
//                     section.contents = section.contents.filter(
//                         (c) => c.id !== contentId
//                     );
//                 }
//                 this.selectedProgram.totalContents =
//                     this.selectedProgram.sections.reduce(
//                         (total, s) => total + s.contents.length,
//                         0
//                     );
//             }
//         }
//     }

//     // UI Helper Methods
//     setActiveTab(tab: string) {
//         this.activeTab = tab;
//     }

//     getTabClass(tabId: string): string {
//         return tabId === this.activeTab ? 'tab-active' : 'tab-inactive';
//     }

//     getRoleBadgeClass(role: string): string {
//         const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
//         switch (role) {
//             case 'admin':
//                 return `${baseClass} bg-red-100 text-red-800`;
//             case 'instructor':
//                 return `${baseClass} bg-blue-100 text-blue-800`;
//             case 'student':
//                 return `${baseClass} bg-green-100 text-green-800`;
//             default:
//                 return `${baseClass} bg-gray-100 text-gray-800`;
//         }
//     }

//     get filteredUsers(): User[] {
//         return this.users.filter((user) => {
//             const matchesSearch =
//                 user.name
//                     .toLowerCase()
//                     .includes(this.searchTerm.toLowerCase()) ||
//                 user.email
//                     .toLowerCase()
//                     .includes(this.searchTerm.toLowerCase());
//             const matchesRole =
//                 this.selectedRole === 'all' || user.role === this.selectedRole;
//             return matchesSearch && matchesRole;
//         });
//     }

//     getTotalEnrollments(): number {
//         return this.programs.reduce(
//             (total, program) => total + program.enrolledUsers,
//             0
//         );
//     }

//     getActiveUsers(): number {
//         return this.users.filter((user) => user.isActive).length;
//     }

//     openProgramModal(program?: Program) {
//         this.editingProgram = program || null;
//         this.showProgramModal = true;
//     }

//     openSectionModal(section?: Section) {
//         this.editingSection = section || null;
//         this.showSectionModal = true;
//     }

//     openContentModal(sectionId: number, content?: Content) {
//         this.currentSectionId = sectionId;
//         this.editingContent = content || null;
//         this.showContentModal = true;
//     }

//     closeModal() {
//         this.selectedProgram = null;
//         this.showUserModal = false;
//         this.showProgramModal = false;
//         this.showSectionModal = false;
//         this.showContentModal = false;
//         this.editingUser = null;
//         this.editingProgram = null;
//         this.editingSection = null;
//         this.editingContent = null;
//         this.currentSectionId = null;
//     }

//     // Program Detail Methods
//     viewProgram(program: Program) {
//         this.selectedProgram = program;
//     }

//     editProgram(program: Program) {
//         this.openProgramModal(program);
//     }

//     editUser(user: User) {
//         this.openUserModal(user);
//     }

//     editSection(section: Section) {
//         this.openSectionModal(section);
//     }

//     editContent(content: Content) {
//         const sectionId = this.findSectionIdByContent(content.id);
//         if (sectionId) {
//             this.openContentModal(sectionId, content);
//         }
//     }

//     viewUserDetails(user: User) {
//         // Implementation for viewing user details
//         console.log('View user details:', user);
//     }

//     toggleSection(sectionId: number) {
//         this.expandedSections[sectionId] = !this.expandedSections[sectionId];
//     }

//     // Helper Methods
//     findSectionById(sectionId: number): Section | undefined {
//         if (this.selectedProgram) {
//             return this.selectedProgram.sections.find(
//                 (s) => s.id === sectionId
//             );
//         }
//         return undefined;
//     }

//     findSectionIdByContent(contentId: number): number | undefined {
//         if (this.selectedProgram) {
//             for (const section of this.selectedProgram.sections) {
//                 if (section.contents.some((c) => c.id === contentId)) {
//                     return section.id;
//                 }
//             }
//         }
//         return undefined;
//     }
// }
