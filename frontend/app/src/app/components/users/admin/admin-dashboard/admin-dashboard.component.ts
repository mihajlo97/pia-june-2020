import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Tabs } from 'src/app/models/admin';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  activeTabSelect: boolean[] = [true, false, false];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
  }

  navigateTab(tab: string): void {
    if (tab === Tabs.HOME) {
      this.activeTabSelect = [true, false, false];
      this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
    } else if (tab === Tabs.MANAGE) {
      this.activeTabSelect = [false, true, false];
      this.router.navigate([`${Tabs.MANAGE}`], { relativeTo: this.route });
    } else if (tab === Tabs.CREATE) {
      this.activeTabSelect = [false, false, true];
      this.router.navigate([`${Tabs.CREATE}`], { relativeTo: this.route });
    }
  }
}
