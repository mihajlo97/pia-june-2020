import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Tabs } from 'src/app/models/worker';
import { WorkerService } from 'src/app/services/users/worker.service';

@Component({
  selector: 'app-worker-dashboard',
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css'],
})
export class WorkerDashboardComponent implements OnInit {
  activeTabSelect: boolean[] = [true, false, false, false];
  tabs: Tabs[] = [Tabs.HOME, Tabs.ORDERS, Tabs.STORE, Tabs.CREATE];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private worker: WorkerService
  ) {
    worker.loadNotifications();
  }

  ngOnInit(): void {
    this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
  }

  navigateTab(tab: Tabs): void {
    switch (tab) {
      case Tabs.HOME: {
        this.activeTabSelect = [true, false, false, false];
        this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
        break;
      }
      case Tabs.ORDERS: {
        this.activeTabSelect = [false, true, false, false];
        this.router.navigate([`${Tabs.ORDERS}`], { relativeTo: this.route });
        break;
      }
      case Tabs.STORE: {
        this.activeTabSelect = [false, false, true, false];
        this.router.navigate([`${Tabs.STORE}`], { relativeTo: this.route });
        break;
      }
      case Tabs.CREATE: {
        this.activeTabSelect = [false, false, false, true];
        this.router.navigate([`${Tabs.CREATE}`], { relativeTo: this.route });
        break;
      }
      default: {
        console.error('Navigation-Tab-Exception: Tab does not exist.');
      }
    }
  }
}
