import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkerService } from 'src/app/services/users/worker.service';
import { Observable, Subscription } from 'rxjs';
import {
  HothouseItem,
  UPDATE_CONDITIONS_EVERY_MILIS,
  WATER_LEVEL_DECREASE,
  TEMPERATURE_LEVEL_DECREASE,
  WATER_MIN,
  TEMPERATURE_MIN,
  WATER_LOW,
  TEMPERATURE_LOW,
} from 'src/app/models/worker';
import { map } from 'rxjs/operators';

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
    this.itemStream$ = worker.getHothouses().pipe(
      map((items) => {
        const now = new Date().getTime();
        items.forEach((item, index) => {
          let updateMoment = new Date(item.conditionsLastUpdatedOn).getTime();
          let compoundWaterDecrease = 0;
          let compoundTemperatureDecrease = 0;
          let hourPassed = false;

          //update difference since last saved to db
          while (updateMoment + UPDATE_CONDITIONS_EVERY_MILIS <= now) {
            compoundWaterDecrease += WATER_LEVEL_DECREASE;
            compoundTemperatureDecrease += TEMPERATURE_LEVEL_DECREASE;
            updateMoment += UPDATE_CONDITIONS_EVERY_MILIS;
            hourPassed = true;
          }
          if (hourPassed) {
            items[index].waterAmount =
              item.waterAmount - compoundWaterDecrease > WATER_MIN
                ? item.waterAmount - compoundWaterDecrease
                : WATER_MIN;
            items[index].temperature =
              item.temperature - compoundTemperatureDecrease > TEMPERATURE_MIN
                ? item.temperature - compoundTemperatureDecrease
                : TEMPERATURE_MIN;
          }

          //show notifications if conditions low
          if (
            item.waterAmount < WATER_LOW ||
            item.temperature < TEMPERATURE_LOW
          ) {
            worker.manageNotifications(item._id, item.name);
          }
        });
        return items;
      })
    );
  }

  ngOnInit(): void {}

  viewHothouse(id: number): void {
    this.router.navigate([`../hothouse/${id}`], { relativeTo: this.route });
  }

  viewWarehouse(id: number): void {
    this.router.navigate([`../warehouse/${id}`], { relativeTo: this.route });
  }
}
