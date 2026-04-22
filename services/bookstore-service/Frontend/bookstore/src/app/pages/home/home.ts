import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from '../../shared/book-list/book-list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookListComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
