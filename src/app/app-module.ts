import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthInterceptor } from './services/auth-interceptor';

// ── Non-standalone → declarations ─────────────────────
import { Login }             from './pages/login/login';
import { Register }          from './pages/register/register';
import { Teacher }           from './pages/teacher/teacher';
import { TeacherApplication } from './pages/teacher-application/teacher-application';
import { TeacherProfile }    from './pages/teacher-profile/teacher-profile';

// ── Standalone → imports ───────────────────────────────
import { Student }          from './pages/student/student';
import { Admin }            from './pages/admin/admin';
import { TeacherPending }   from './pages/teacher-pending/teacher-pending';
import { AdminFormateurs }  from './pages/admin-formateurs/admin-formateurs';
import { Categories }       from './pages/admin-categories/categories/categories';
import { SousCategories }   from './pages/admin-categories/sous-categories/sous-categories';
import { Courses }          from './pages/admin-cours/admin-cours';
import { AdminBloques }     from './pages/admin-bloques/admin-bloques';
import { AdminDashboard }   from './pages/admin-dashboard/admin-dashboard';
import { AdminEtudiants }   from './pages/admin-etudiants/admin-etudiants';
import { Home }             from './pages/home/home';
import { AdminCoursDetail } from './pages/admin-cours-detail/admin-cours-detail';
import { TeacherQuiz }      from './pages/teacher-quiz/teacher-quiz';

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    Teacher,
    TeacherApplication,
    TeacherProfile,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule, // 🔥 IMPORTANT

    // Standalone components
    Student,
    Admin,
    TeacherPending,
    AdminFormateurs,
    Categories,
    SousCategories,
    Courses,
    AdminBloques,
    AdminDashboard,
    AdminEtudiants,
    AdminCoursDetail,
    Home,
    TeacherQuiz,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App],
})
export class AppModule {}