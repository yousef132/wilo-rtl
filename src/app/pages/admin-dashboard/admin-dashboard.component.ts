import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  registeredPrograms: string[];
  joinDate: string;
  lastLogin: string;
  isActive: boolean;
}

export interface Content {
  id: number;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  duration?: string;
  url?: string;
  description: string;
  order: number;
  isPublished: boolean;
}

export interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  contents: Content[];
  isPublished: boolean;
}

export interface Program {
  id: number;
  title: string;
  description: string;
  instructor: string;
  sections: Section[];
  enrolledUsers: number;
  totalSections: number;
  totalContents: number;
  createdDate: string;
  isPublished: boolean;
}
@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
activeTab = 'users';
  users: User[] = [];
  programs: Program[] = [];
  selectedProgram: Program | null = null;
  expandedSections: { [key: number]: boolean } = {};
  loading = false;
  searchTerm = '';
  selectedRole = 'all';
  
  // Modal states
  showUserModal = false;
  showProgramModal = false;
  showSectionModal = false;
  showContentModal = false;
  
  // Editing states
  editingUser: User | null = null;
  editingProgram: Program | null = null;
  editingSection: Section | null = null;
  editingContent: Content | null = null;
  currentSectionId: number | null = null;

  tabs = [
    { id: 'users', label: 'Users' },
    { id: 'programs', label: 'Programs' },
    { id: 'analytics', label: 'Analytics' }
  ];

  

  ngOnInit() {
    this.loadUsers();
    this.loadPrograms();
  }

  // API Methods
  loadUsers() {
    this.loading = true;
    // Replace with actual API call
    // this.http.get<User[]>('/api/admin/users').subscribe(users => {
    //   this.users = users;
    //   this.loading = false;
    // });
    
    // Mock data
    this.users = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        registeredPrograms: ['React Basics', 'Advanced JavaScript'],
        joinDate: '2024-01-15',
        lastLogin: '2024-07-10',
        isActive: true
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'instructor',
        registeredPrograms: ['React Basics'],
        joinDate: '2024-02-20',
        lastLogin: '2024-07-12',
        isActive: true
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'student',
        registeredPrograms: ['Python Fundamentals', 'Advanced JavaScript'],
        joinDate: '2024-03-10',
        lastLogin: '2024-07-08',
        isActive: false
      }
    ];
    this.loading = false;
  }

  loadPrograms() {
    this.loading = true;
    // Replace with actual API call
    // this.http.get<Program[]>('/api/admin/programs').subscribe(programs => {
    //   this.programs = programs;
    //   this.loading = false;
    // });
    
    // Mock data
    this.programs = [
      {
        id: 1,
        title: 'React Basics',
        description: 'Learn the fundamentals of React development',
        instructor: 'Jane Smith',
        enrolledUsers: 45,
        totalSections: 6,
        totalContents: 24,
        createdDate: '2024-01-01',
        isPublished: true,
        sections: [
          {
            id: 1,
            title: 'Introduction to React',
            description: 'Getting started with React',
            order: 1,
            isPublished: true,
            contents: [
              {
                id: 1,
                title: 'What is React?',
                type: 'video',
                duration: '15:30',
                description: 'Introduction to React framework',
                order: 1,
                isPublished: true,
                url: 'https://example.com/video1'
              },
              {
                id: 2,
                title: 'Setting up Development Environment',
                type: 'document',
                description: 'Step by step setup guide',
                order: 2,
                isPublished: true,
                url: 'https://example.com/doc1'
              }
            ]
          },
          {
            id: 2,
            title: 'Components and JSX',
            description: 'Understanding React components',
            order: 2,
            isPublished: true,
            contents: [
              {
                id: 3,
                title: 'Creating Your First Component',
                type: 'video',
                duration: '20:45',
                description: 'Building React components',
                order: 1,
                isPublished: true,
                url: 'https://example.com/video2'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Advanced JavaScript',
        description: 'Master advanced JavaScript concepts',
        instructor: 'John Doe',
        enrolledUsers: 32,
        totalSections: 8,
        totalContents: 36,
        createdDate: '2024-02-15',
        isPublished: true,
        sections: [
          {
            id: 3,
            title: 'Closures and Scope',
            description: 'Understanding JavaScript closures',
            order: 1,
            isPublished: true,
            contents: [
              {
                id: 4,
                title: 'What are Closures?',
                type: 'video',
                duration: '18:20',
                description: 'Deep dive into closures',
                order: 1,
                isPublished: true,
                url: 'https://example.com/video3'
              }
            ]
          }
        ]
      }
    ];
    this.loading = false;
  }

  // User Management Methods
  createUser(userData: Partial<User>) {
    // API call: POST /api/admin/users
    // this.http.post<User>('/api/admin/users', userData).subscribe(user => {
    //   this.users.push(user);
    //   this.showUserModal = false;
    // });
    
    const newUser: User = {
      id: Date.now(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'student',
      registeredPrograms: [],
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    this.users.push(newUser);
    this.showUserModal = false;
  }

  updateUser(userId: number, userData: Partial<User>) {
    // API call: PUT /api/admin/users/:id
    // this.http.put<User>(`/api/admin/users/${userId}`, userData).subscribe(user => {
    //   const index = this.users.findIndex(u => u.id === userId);
    //   if (index !== -1) {
    //     this.users[index] = user;
    //   }
    // });
    
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };
    }
    this.showUserModal = false;
    this.editingUser = null;
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      // API call: DELETE /api/admin/users/:id
      // this.http.delete(`/api/admin/users/${userId}`).subscribe(() => {
      //   this.users = this.users.filter(u => u.id !== userId);
      // });
      
      this.users = this.users.filter(u => u.id !== userId);
    }
  }

  assignUserToProgram(userId: number, programId: number) {
    // API call: POST /api/admin/users/:userId/programs/:programId
    // this.http.post(`/api/admin/users/${userId}/programs/${programId}`, {}).subscribe();
  }

  removeUserFromProgram(userId: number, programId: number) {
    // API call: DELETE /api/admin/users/:userId/programs/:programId
    // this.http.delete(`/api/admin/users/${userId}/programs/${programId}`).subscribe();
  }

  // Program Management Methods
  createProgram(programData: Partial<Program>) {
    // API call: POST /api/admin/programs
    // this.http.post<Program>('/api/admin/programs', programData).subscribe(program => {
    //   this.programs.push(program);
    //   this.showProgramModal = false;
    // });
    
    const newProgram: Program = {
      id: Date.now(),
      title: programData.title || '',
      description: programData.description || '',
      instructor: programData.instructor || '',
      sections: [],
      enrolledUsers: 0,
      totalSections: 0,
      totalContents: 0,
      createdDate: new Date().toISOString(),
      isPublished: false
    };
    this.programs.push(newProgram);
    this.showProgramModal = false;
  }

  updateProgram(programId: number, programData: Partial<Program>) {
    // API call: PUT /api/admin/programs/:id
    // this.http.put<Program>(`/api/admin/programs/${programId}`, programData).subscribe(program => {
    //   const index = this.programs.findIndex(p => p.id === programId);
    //   if (index !== -1) {
    //     this.programs[index] = program;
    //   }
    // });
    
    const index = this.programs.findIndex(p => p.id === programId);
    if (index !== -1) {
      this.programs[index] = { ...this.programs[index], ...programData };
    }
    this.showProgramModal = false;
    this.editingProgram = null;
  }

  deleteProgram(programId: number) {
    if (confirm('Are you sure you want to delete this program?')) {
      // API call: DELETE /api/admin/programs/:id
      // this.http.delete(`/api/admin/programs/${programId}`).subscribe(() => {
      //   this.programs = this.programs.filter(p => p.id !== programId);
      // });
      
      this.programs = this.programs.filter(p => p.id !== programId);
    }
  }

  // Section Management Methods
  createSection(programId: number, sectionData: Partial<Section>) {
    // API call: POST /api/admin/programs/:programId/sections
    // this.http.post<Section>(`/api/admin/programs/${programId}/sections`, sectionData).subscribe(section => {
    //   const program = this.programs.find(p => p.id === programId);
    //   if (program) {
    //     program.sections.push(section);
    //   }
    //   this.showSectionModal = false;
    // });
    
    const program = this.programs.find(p => p.id === programId);
    if (program) {
      const newSection: Section = {
        id: Date.now(),
        title: sectionData.title || '',
        description: sectionData.description || '',
        order: program.sections.length + 1,
        contents: [],
        isPublished: false
      };
      program.sections.push(newSection);
      program.totalSections = program.sections.length;
    }
    this.showSectionModal = false;
  }

  updateSection(sectionId: number, sectionData: Partial<Section>) {
    // API call: PUT /api/admin/sections/:id
    // this.http.put<Section>(`/api/admin/sections/${sectionId}`, sectionData).subscribe();
    
    if (this.selectedProgram) {
      const section = this.selectedProgram.sections.find(s => s.id === sectionId);
      if (section) {
        Object.assign(section, sectionData);
      }
    }
    this.showSectionModal = false;
    this.editingSection = null;
  }

  deleteSection(sectionId: number) {
    if (confirm('Are you sure you want to delete this section?')) {
      // API call: DELETE /api/admin/sections/:id
      // this.http.delete(`/api/admin/sections/${sectionId}`).subscribe();
      
      if (this.selectedProgram) {
        this.selectedProgram.sections = this.selectedProgram.sections.filter(s => s.id !== sectionId);
        this.selectedProgram.totalSections = this.selectedProgram.sections.length;
      }
    }
  }

  // Content Management Methods
  createContent(sectionId: number, contentData: Partial<Content>) {
    // API call: POST /api/admin/sections/:sectionId/contents
    // this.http.post<Content>(`/api/admin/sections/${sectionId}/contents`, contentData).subscribe(content => {
    //   const section = this.findSectionById(sectionId);
    //   if (section) {
    //     section.contents.push(content);
    //   }
    //   this.showContentModal = false;
    // });
    
    const section = this.findSectionById(sectionId);
    if (section) {
      const newContent: Content = {
        id: Date.now(),
        title: contentData.title || '',
        type: contentData.type || 'video',
        duration: contentData.duration,
        url: contentData.url,
        description: contentData.description || '',
        order: section.contents.length + 1,
        isPublished: false
      };
      section.contents.push(newContent);
      if (this.selectedProgram) {
        this.selectedProgram.totalContents = this.selectedProgram.sections.reduce((total, s) => total + s.contents.length, 0);
      }
    }
    this.showContentModal = false;
  }

  updateContent(contentId: number, contentData: Partial<Content>) {
    // API call: PUT /api/admin/contents/:id
    // this.http.put<Content>(`/api/admin/contents/${contentId}`, contentData).subscribe();
    
    if (this.selectedProgram) {
      for (const section of this.selectedProgram.sections) {
        const content = section.contents.find(c => c.id === contentId);
        if (content) {
          Object.assign(content, contentData);
          break;
        }
      }
    }
    this.showContentModal = false;
    this.editingContent = null;
  }

  deleteContent(contentId: number) {
    if (confirm('Are you sure you want to delete this content?')) {
      // API call: DELETE /api/admin/contents/:id
      // this.http.delete(`/api/admin/contents/${contentId}`).subscribe();
      
      if (this.selectedProgram) {
        for (const section of this.selectedProgram.sections) {
          section.contents = section.contents.filter(c => c.id !== contentId);
        }
        this.selectedProgram.totalContents = this.selectedProgram.sections.reduce((total, s) => total + s.contents.length, 0);
      }
    }
  }

  // UI Helper Methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getTabClass(tabId: string): string {
    return tabId === this.activeTab ? 'tab-active' : 'tab-inactive';
  }

  getRoleBadgeClass(role: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (role) {
      case 'admin':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'instructor':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'student':
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      return matchesSearch && matchesRole;
    });
  }

  getTotalEnrollments(): number {
    return this.programs.reduce((total, program) => total + program.enrolledUsers, 0);
  }

  getActiveUsers(): number {
    return this.users.filter(user => user.isActive).length;
  }

  // Modal Methods
  openUserModal(user?: User) {
    this.editingUser = user || null;
    this.showUserModal = true;
  }

  openProgramModal(program?: Program) {
    this.editingProgram = program || null;
    this.showProgramModal = true;
  }

  openSectionModal(section?: Section) {
    this.editingSection = section || null;
    this.showSectionModal = true;
  }

  openContentModal(sectionId: number, content?: Content) {
    this.currentSectionId = sectionId;
    this.editingContent = content || null;
    this.showContentModal = true;
  }

  closeModal() {
    this.selectedProgram = null;
    this.showUserModal = false;
    this.showProgramModal = false;
    this.showSectionModal = false;
    this.showContentModal = false;
    this.editingUser = null;
    this.editingProgram = null;
    this.editingSection = null;
    this.editingContent = null;
    this.currentSectionId = null;
  }

  // Program Detail Methods
  viewProgram(program: Program) {
    this.selectedProgram = program;
  }

  editProgram(program: Program) {
    this.openProgramModal(program);
  }

  editUser(user: User) {
    this.openUserModal(user);
  }

  editSection(section: Section) {
    this.openSectionModal(section);
  }

  editContent(content: Content) {
    const sectionId = this.findSectionIdByContent(content.id);
    if (sectionId) {
      this.openContentModal(sectionId, content);
    }
  }

  viewUserDetails(user: User) {
    // Implementation for viewing user details
    console.log('View user details:', user);
  }

  toggleSection(sectionId: number) {
    this.expandedSections[sectionId] = !this.expandedSections[sectionId];
  }

  // Helper Methods
  findSectionById(sectionId: number): Section | undefined {
    if (this.selectedProgram) {
      return this.selectedProgram.sections.find(s => s.id === sectionId);
    }
    return undefined;
  }

  findSectionIdByContent(contentId: number): number | undefined {
    if (this.selectedProgram) {
      for (const section of this.selectedProgram.sections) {
        if (section.contents.some(c => c.id === contentId)) {
          return section.id;
        }
      }
    }
    return undefined;
  }
}
