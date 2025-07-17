import { Routes } from '@angular/router';
import { HomeDemoTwoComponent } from './demos/home-demo-two/home-demo-two.component';
import { CourseDetailsPageComponent } from './pages/course-details-page/course-details-page.component';
import { RegisterComponent } from './pages/register-page/register.component';

import { LoginComponent } from './pages/login/login.component';
import { ProgramsComponent } from './pages/programs/programs.component';
import { UserProgramsComponent } from './pages/user-programs/user-programs.component';
import { AdminProgramsComponent } from './pages/admin-programs/admin-programs.component';
import { CreateProgramComponent } from './pages/create-program/create-program.component';
import { ProgramDashboardComponent } from './pages/program-dashboard/program-dashboard.component';
import { ContentDetailsComponent } from './pages/content-details/content-details.component';
import { CreateQuestionComponent } from './pages/create-question/create-question.component';
import { ContentDashboardComponent } from './pages/content-dashboard/content-dashboard.component';
import { ExamComponent } from './pages/exam/exam.component';
import { SubscriptersComponent } from './pages/subscripters/subscripters.component';
// import { LecturesComponent } from './pages/lectures/lectures.component';
import { UsersComponent } from './pages/users/users.component';
import { canActivateAdminGuard } from './Gaurds/admin.guard';
import { ProgramCompletedComponent } from './pages/program-completed/program-completed.component';
import { EmailConfirmedComponent } from './pages/email-confirmed/email-confirmed.component';
import { EmailConfirmationFailedComponent } from './pages/email-confirmation-failed/email-confirmation-failed.component';
import { ProgramStudentsComponent } from './pages/program-students/program-students.component';
import { StudentsChatNotificationsComponent } from './pages/students-chat-notifications/students-chat-notifications.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
    { path: 'home', component: HomeDemoTwoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'programs', component: ProgramsComponent },
    { path: 'program/dashboard/:id', component: ProgramDashboardComponent },
    { path: 'my-programs', component: AdminProgramsComponent },
    { path: 'questions/add/:id', component: CreateQuestionComponent },
    { path: 'dashboard/content/:id', component: ContentDashboardComponent },
    { path: 'exam/:id/:programId', component: ExamComponent },
    { path: 'create-program', component: CreateProgramComponent },
    { path: 'subscriptions', component: UserProgramsComponent },
    { path: 'content/subscribers/:programId/:contentId', component: SubscriptersComponent },
    // { path: 'program/lectures/:contentId/:userId', component: LecturesComponent },
    { path: 'users', component: UsersComponent,canActivate:[canActivateAdminGuard] },
    { path: 'program-completed', component: ProgramCompletedComponent },
    { path: 'email-confirmed', component: EmailConfirmedComponent },
    { path: 'email-confirmation-failed', component: EmailConfirmationFailedComponent },
    { path: 'students/chats/:id', component: StudentsChatNotificationsComponent },
    { path: 'program/students/:id', component: ProgramStudentsComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: 'dashboard', component: AdminDashboardComponent },

// contentId, subscriber.userId,programId
    { path: 'program-details/:id', component: CourseDetailsPageComponent },
    {
        path: 'content-details/:contentId/:userId/:programId',
        component: ContentDetailsComponent,
    },

    { path: 'register', component: RegisterComponent },

    // Here add new component

    { path: '**', component: HomeDemoTwoComponent }, // This line will remain down from the whole component list
];
