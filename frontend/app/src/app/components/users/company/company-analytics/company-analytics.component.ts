import { Component, OnInit } from '@angular/core';
import { OrderAnalytics, GetAnalyticsResponse } from 'src/app/models/company';
import { CompanyService } from 'src/app/services/users/company.service';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-company-analytics',
  templateUrl: './company-analytics.component.html',
  styleUrls: ['./company-analytics.component.css'],
})
export class CompanyAnalyticsComponent implements OnInit {
  dataFetched: boolean = false;
  serverErrorOccurred: boolean = false;

  analytics: any[] = [];
  barChartType: ChartType = ChartType.BarChart;
  chartOptions: any = {
    colors: ['#0275d8'],
  };

  constructor(private company: CompanyService) {
    company
      .getAnalytics()
      .then((res: GetAnalyticsResponse) => {
        res.data.forEach((item) => {
          let row = [];
          item.date = new Date(item.date);
          const label = `${item.date.getDate()}/${item.date.getMonth()}/${item.date.getFullYear()}`;

          row.push(label);
          row.push(item.orders);
          this.analytics.push(row);
        });
        this.serverErrorOccurred = false;
      })
      .catch((err) => {
        console.error(
          'Fetching-Analytics-Exception: A server error occurred while fetching the analytics.',
          err
        );
        this.serverErrorOccurred = true;
      })
      .finally(() => {
        this.dataFetched = true;
      });
  }

  ngOnInit(): void {}
}
