import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-pending',
  templateUrl: './teacher-pending.html',
  styleUrls: ['./teacher-pending.scss']
})
export class TeacherPending {

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}