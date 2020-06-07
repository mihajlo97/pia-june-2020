import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkerService } from 'src/app/services/users/worker.service';
import { Observable, Subscription } from 'rxjs';
import { HothouseItem } from 'src/app/models/worker';

@Component({
  selector: 'app-worker-home',
  templateUrl: './worker-home.component.html',
  styleUrls: ['./worker-home.component.css'],
})
export class WorkerHomeComponent implements OnInit {
  itemStream$: Observable<HothouseItem[]>;
  itemSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private worker: WorkerService
  ) {
    this.itemStream$ = worker.getHothouses();
    this.itemSubscription = this.itemStream$.subscribe();
  }

  ngOnInit(): void {}

  viewHothouse(id: number): void {
    console.log('[DEBUG]: HothouseID: ', id);
  }

  viewWarehouse(id: number): void {
    console.log('[DEBUG]: HothouseID: ', id);
  }

  ngOnDestroy(): void {
    this.itemSubscription.unsubscribe();
  }
}
