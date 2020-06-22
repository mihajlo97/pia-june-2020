import { Component, OnInit } from '@angular/core';
import { Tabs } from 'src/app/models/company';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css'],
})
export class CompanyDashboardComponent implements OnInit {
  Tabs = Tabs;

  activeTabSelect: boolean[] = [true, false, false, false];

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
  }

  ngOnInit(): void {}

  navigateTab(tab: Tabs): void {
    switch (tab) {
      case Tabs.HOME: {
        this.activeTabSelect = [true, false, false, false];
        this.router.navigate([`${Tabs.HOME}`], { relativeTo: this.route });
        break;
      }
      case Tabs.ANALYTICS: {
        this.activeTabSelect = [false, true, false, false];
        this.router.navigate([`${Tabs.ANALYTICS}`], { relativeTo: this.route });
        break;
      }
      case Tabs.CATALOG: {
        this.activeTabSelect = [false, false, true, false];
        this.router.navigate([`${Tabs.CATALOG}`], { relativeTo: this.route });
        break;
      }
      case Tabs.NEW: {
        this.activeTabSelect = [false, false, false, true];
        this.router.navigate([`${Tabs.NEW}`], { relativeTo: this.route });
        break;
      }
      default: {
        console.error('Navigation-Tab-Exception: Tab does not exist.');
      }
    }
  }
}
