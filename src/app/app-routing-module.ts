import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login }            from './pages/login/login';
import { Register }         from './pages/register/register';
import { Admin }            from './pages/admin/admin';
import { Student }          from './pages/student/student';
import { Teacher }          from './pages/teacher/teacher';
import { TeacherApplication } from './pages/teacher-application/teacher-application';
import { TeacherPending }   from './pages/teacher-pending/teacher-pending';
import { AdminFormateurs }  from './pages/admin-formateurs/admin-formateurs';
import { Courses }          from './pages/admin-cours/admin-cours';
import { TeacherProfile }   from './pages/teacher-profile/teacher-profile';
import { AdminCoursDetail } from './pages/admin-cours-detail/admin-cours-detail';
import { Home }             from './pages/home/home';
import { authGuard, roleGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '',                     component: Home },          // ← Page d'accueil
  { path: 'login',                component: Login },
  { path: 'register',             component: Register },
  { path: 'admin',                component: Admin, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'student',              component: Student, canActivate: [roleGuard], data: { roles: ['ETUDIANT'] } },
  { path: 'teacher',              component: Teacher, canActivate: [roleGuard], data: { roles: ['FORMATEUR'] } },
  { path: 'teacher-application',  component: TeacherApplication, canActivate: [roleGuard], data: { roles: ['FORMATEUR'] } },
  { path: 'teacher-pending',      component: TeacherPending, canActivate: [authGuard] },
  { path: 'admin-formateurs',     component: AdminFormateurs, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-cours',          component: Courses, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'teacher-profile',      component: TeacherProfile, canActivate: [roleGuard], data: { roles: ['FORMATEUR'] } },
  { path: 'admin/formations/:id', component: AdminCoursDetail, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: '**',                   redirectTo: '' },            // ← 404 → accueil
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
