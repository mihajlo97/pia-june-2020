import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-worker-hothouse',
  templateUrl: './worker-hothouse.component.html',
  styleUrls: ['./worker-hothouse.component.css'],
})
export class WorkerHothouseComponent implements OnInit {
  //MOCK-DATA
  id: string;
  grid = [
    {
      row: 1,
      col: 1,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 1,
      col: 2,
      occupied: true,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 1,
      col: 3,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 1,
      col: 4,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    { row: 1, col: 5, occupied: true, display: false, ready: true, done: true },
    {
      row: 2,
      col: 1,
      occupied: false,
      display: false,
      ready: false,
      done: false,
    },
    {
      row: 2,
      col: 2,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    { row: 2, col: 3, occupied: true, display: false, ready: true, done: true },
    {
      row: 2,
      col: 4,
      occupied: false,
      display: false,
      ready: false,
      done: false,
    },
    {
      row: 2,
      col: 5,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 3,
      col: 1,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 3,
      col: 2,
      occupied: true,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 3,
      col: 3,
      occupied: true,
      display: false,
      ready: true,
      done: false,
    },
    {
      row: 3,
      col: 4,
      occupied: false,
      display: false,
      ready: false,
      done: false,
    },
    {
      row: 3,
      col: 5,
      occupied: false,
      display: false,
      ready: true,
      done: false,
    },
  ];
  fertilizers = [
    { fertilizer: 'Test grow', factor: 1, quantity: 20 },
    { fertilizer: 'Test grow bigger', factor: 3, quantity: 42 },
    { fertilizer: 'Test grow ultra', factor: 10, quantity: 7 },
    { fertilizer: 'Test grow instant', factor: 365, quantity: 3 },
  ];
  seedlings = [
    { seedling: 'Test apple', days: 7, quantity: 20 },
    { seedling: 'Test pear', days: 10, quantity: 12 },
    { seedling: 'Test plum', days: 12, quantity: 45 },
    { seedling: 'Test cherry', days: 6, quantity: 36 },
    { seedling: 'Test peach', days: 14, quantity: 7 },
  ];

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {}
}
