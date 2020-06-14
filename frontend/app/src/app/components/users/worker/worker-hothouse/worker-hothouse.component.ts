import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkerService } from 'src/app/services/users/worker.service';
import {
  HothouseDashboard,
  HothouseDashboardDataResponse,
  HothouseSpotUIControls,
  SpotState,
  WarehouseItem,
  Seedling,
  WATER_DEFAULT,
  TEMPERATURE_DEFAULT,
  PROGRESS_MAX,
  PROGRESS_MIN,
  PREPARING_TIME,
  WATER_MIN,
  WATER_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
  WarehouseItemType,
  CreateSeedlingRequest,
  UpdateDashboardResponse,
  UpdateWarehouseItemRequest,
  UpdateHothouseRequest,
  WATER_LOW,
  TEMPERATURE_LOW,
  UpdateSeedlingRequest,
  DAY_IN_MILIS,
  DASHBOARD_REFRESH_RATE,
  UPDATE_CONDITIONS_EVERY_MILIS,
  WATER_LEVEL_DECREASE,
  TEMPERATURE_LEVEL_DECREASE,
  NotifyUserRequest,
} from 'src/app/models/worker';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-worker-hothouse',
  templateUrl: './worker-hothouse.component.html',
  styleUrls: ['./worker-hothouse.component.css'],
})
export class WorkerHothouseComponent implements OnInit {
  dashboard: HothouseDashboard = {} as HothouseDashboard;
  lastSelectedSpot = {
    row: 0,
    col: 0,
  };
  activateIntervalRefresh: boolean = false;

  //binded to view
  menuForm: FormGroup;
  loadSuccess: boolean = true;
  waterLow: boolean = false;
  temperatureLow: boolean = false;
  fertilizers: WarehouseItem[];
  seedlings: WarehouseItem[];
  readonly spotStates: SpotState[] = [
    SpotState.EMPTY,
    SpotState.PREPARING,
    SpotState.GROWING,
    SpotState.DONE,
  ];
  readonly minWater = WATER_MIN;
  readonly minTemp = TEMPERATURE_MIN;

  constructor(
    private route: ActivatedRoute,
    private worker: WorkerService,
    private fb: FormBuilder
  ) {
    this.menuForm = fb.group({
      water: [WATER_DEFAULT],
      temperature: [TEMPERATURE_DEFAULT],
    });
    this.refreshDashboard();
  }

  ngOnInit(): void {}

  //view refreshing
  refreshDashboard(): void {
    this.worker
      .getHothouseDashboardData({ _id: this.route.snapshot.paramMap.get('id') })
      .then((res: HothouseDashboardDataResponse) => {
        //bind dashboard data
        this.dashboard._id = this.route.snapshot.paramMap.get('id');
        this.dashboard.model = res;

        //convert dates to appropriate date objects
        this.dashboard.model.hothouseControl.conditionsLastUpdatedOn = new Date(
          this.dashboard.model.hothouseControl.conditionsLastUpdatedOn
        );
        this.dashboard.model.hothouseSpots.forEach((item, index) => {
          this.dashboard.model.hothouseSpots[index].lastOccupiedOn = new Date(
            item.lastOccupiedOn
          );
        });
        this.dashboard.model.seedlings.forEach((item, index) => {
          this.dashboard.model.seedlings[index].plantedOn = new Date(
            item.plantedOn
          );
        });

        //setup view controls
        const now = new Date().getTime();
        this.dashboard.controls = [];

        this.dashboard.model.hothouseSpots.forEach((item) => {
          let control: HothouseSpotUIControls = {} as HothouseSpotUIControls;

          control.display = false;
          control.spot = item;
          //display seedling data
          if (item.occupied) {
            const seedling = this.dashboard.model.seedlings.find(
              ({ row, col }) => item.row === row && item.col === col
            );
            control.seedling = seedling;
            control.state = seedling.done ? SpotState.DONE : SpotState.GROWING;
            control.progress = this.calculateProgress(seedling);
          }
          //display preparing / empty spot
          else {
            control.seedling = null;
            control.progress = PROGRESS_MIN;
            if (!item.lastOccupiedOn) {
              control.state = SpotState.EMPTY;
            } else {
              const readyOn = item.lastOccupiedOn.getTime() + PREPARING_TIME;
              control.state =
                now >= readyOn ? SpotState.EMPTY : SpotState.PREPARING;
            }
          }

          //add control
          this.dashboard.controls.push(control);
        });

        //populate modals
        this.fertilizers = this.dashboard.model.warehouseItems.filter(
          (item) => item.type === WarehouseItemType.FERTILIZER
        );
        this.seedlings = this.dashboard.model.warehouseItems.filter(
          (item) => item.type === WarehouseItemType.SEEDLING
        );

        //bind menu to dashboard model
        this.menuForm
          .get('water')
          .valueChanges.pipe(debounceTime(1000))
          .subscribe((value) => {
            this.updateWater(value);
          });
        this.menuForm
          .get('temperature')
          .valueChanges.pipe(debounceTime(1000))
          .subscribe((value) => {
            this.updateTemperature(value);
          });

        //bind menu data
        this.menuForm
          .get('water')
          .setValue(this.dashboard.model.hothouseControl.waterAmount);
        this.menuForm
          .get('temperature')
          .setValue(this.dashboard.model.hothouseControl.temperature);

        //check errors
        this.loadSuccess = true;

        //start up interval refresher after initial refresh
        if (!this.activateIntervalRefresh) {
          this.intervalViewRefresher();
          this.activateIntervalRefresh = true;
        }
      })
      .catch((err) => {
        console.error('Loading-Hothouse-Dashboard-Exception:', err);
        this.loadSuccess = false;
      });
  }

  intervalViewRefresher(): void {
    setInterval(() => {
      const now = new Date().getTime();

      //update hothouse conditions
      const hothouseControl = this.dashboard.model.hothouseControl;
      let updateMoment = hothouseControl.conditionsLastUpdatedOn.getTime();
      let compoundWaterDecrease = 0;
      let compoundTemperatureDecrease = 0;
      let hourPassed = false;

      while (updateMoment + UPDATE_CONDITIONS_EVERY_MILIS <= now) {
        compoundWaterDecrease += WATER_LEVEL_DECREASE;
        compoundTemperatureDecrease += TEMPERATURE_LEVEL_DECREASE;
        updateMoment += UPDATE_CONDITIONS_EVERY_MILIS;
        hourPassed = true;
      }
      if (hourPassed) {
        const waterLevel =
          hothouseControl.waterAmount - compoundWaterDecrease > WATER_MIN
            ? hothouseControl.waterAmount - compoundWaterDecrease
            : WATER_MIN;
        const temperatureLevel =
          hothouseControl.temperature - compoundTemperatureDecrease >
          TEMPERATURE_MIN
            ? hothouseControl.temperature - compoundTemperatureDecrease
            : TEMPERATURE_MIN;
        this.menuForm.get('water').setValue(waterLevel);
        this.menuForm.get('temperature').setValue(temperatureLevel);
      }

      //update hothouse spots
      for (let i = 0; i < this.dashboard.controls.length; i++) {
        const control = this.dashboard.controls[i];

        if (
          control.state === SpotState.EMPTY ||
          control.state === SpotState.DONE
        ) {
          continue;
        }

        //check if an empty spot is prepared for planting
        else if (control.state === SpotState.PREPARING) {
          if (now >= control.spot.lastOccupiedOn.getTime() + PREPARING_TIME) {
            this.dashboard.controls[i].state = SpotState.EMPTY;
          }
        }

        //update progress on a growing seedling
        else if (control.state === SpotState.GROWING) {
          if (!control.seedling.done) {
            const progress = this.calculateProgress(control.seedling);
            this.dashboard.controls[i].progress = progress;

            if (progress === PROGRESS_MAX) {
              if (this.updateSeedlingOnDone(control.seedling._id)) {
                this.dashboard.controls[i].state = SpotState.DONE;
              }
            }
          }
        }
      }
    }, DASHBOARD_REFRESH_RATE);
  }

  //helper methods
  markSpot(row: number, col: number): void {
    this.lastSelectedSpot.row = row;
    this.lastSelectedSpot.col = col;
  }

  itemStocked(quantity: number): boolean {
    return Math.floor(quantity) > 0;
  }

  calculateProgress(seedling: Seedling): number {
    if (seedling.done) {
      return PROGRESS_MAX;
    }

    let progress: number;
    const now = new Date().getTime();
    const plantedOn = seedling.plantedOn.getTime();
    const doneOn = plantedOn + DAY_IN_MILIS * seedling.daysToGrow;
    const compoundAcceleratedTime = DAY_IN_MILIS * seedling.growthAcceleratedBy;

    progress = Math.floor(
      ((now + compoundAcceleratedTime - plantedOn) / (doneOn - plantedOn)) * 100
    );
    progress = progress > PROGRESS_MAX ? PROGRESS_MAX : progress;

    return progress;
  }

  calculateProgressWidth(control: HothouseSpotUIControls): string {
    return `width: ${control.progress}%`;
  }

  updateSeedlingOnDone(id: string): boolean {
    const req: UpdateSeedlingRequest = {
      _id: id,
      done: true,
    };

    this.worker
      .updateSeedling(req)
      .then((res: UpdateDashboardResponse) => {
        return res.success;
      })
      .catch((err) => {
        console.error(
          'Seedling-Done-On-Interval-Exception: Failed to update seedling when growth time elapsed.',
          err
        );
        return false;
      });

    return true;
  }

  //user actions
  updateWater(value: number): void {
    if (value < WATER_MIN || value > WATER_MAX) {
      return;
    }

    const req: UpdateHothouseRequest = {
      _id: this.dashboard._id,
      controls: { waterAmount: value },
    };
    this.worker
      .updateHothouse(req)
      .then((res: UpdateDashboardResponse) => {
        if (res.success) {
          this.dashboard.model.hothouseControl.waterAmount = value;
          this.waterLow = value < WATER_LOW;

          if (this.waterLow) {
            const notifyRequest: NotifyUserRequest = {
              _id: this.dashboard._id,
            };
            this.worker.notifyUser(notifyRequest).catch((err) => {
              console.error(
                'Notify-User-Low-Conditions-Exception: Failed to notify user via email.',
                err
              );
            });
          }
        }
      })
      .catch((err) => {
        console.error(
          'Update-Hothouse-Control-Exception: Failed to update water levels.',
          err
        );
      });
  }

  updateTemperature(value: number): void {
    if (value < TEMPERATURE_MIN || value > TEMPERATURE_MAX) {
      return;
    }

    const req: UpdateHothouseRequest = {
      _id: this.dashboard._id,
      controls: { temperature: value },
    };
    this.worker
      .updateHothouse(req)
      .then((res: UpdateDashboardResponse) => {
        if (res.success) {
          this.dashboard.model.hothouseControl.temperature = value;
          this.temperatureLow = value < TEMPERATURE_LOW;

          if (this.temperatureLow) {
            const notifyRequest: NotifyUserRequest = {
              _id: this.dashboard._id,
            };
            this.worker.notifyUser(notifyRequest).catch((err) => {
              console.error(
                'Notify-User-Low-Conditions-Exception: Failed to notify user via email.',
                err
              );
            });
          }
        }
      })
      .catch((err) => {
        console.error(
          'Update-Hothouse-Control-Exception: Failed to update temperature levels.',
          err
        );
      });
  }

  async plantSeedling(seedlingItem: WarehouseItem): Promise<boolean> {
    const reqCreate: CreateSeedlingRequest = {
      seedling: {
        hothouse: this.dashboard._id,
        name: seedlingItem.name,
        manufacturer: seedlingItem.manufacturer,
        row: this.lastSelectedSpot.row,
        col: this.lastSelectedSpot.col,
        daysToGrow: seedlingItem.daysToGrow,
      },
    };
    const seedlingResponse: UpdateDashboardResponse = await this.worker.createSeedling(
      reqCreate
    );
    if (!seedlingResponse.success) {
      console.error(
        'Create-Seedling-Exception: Failed to save seedling to server.'
      );
      return Promise.reject(false);
    }

    const reqUpdate: UpdateWarehouseItemRequest = {
      _id: seedlingItem._id,
      hothouse: this.dashboard._id,
      quantity: seedlingItem.quantity - 1,
    };
    const warehouseResponse: UpdateDashboardResponse = await this.worker.updateWarehouseItem(
      reqUpdate
    );
    if (!warehouseResponse.success) {
      console.error(
        'Update-Warehouse-Item-Exception: Failed to update warehouse.'
      );
      return Promise.reject(false);
    }

    this.refreshDashboard();
    return Promise.resolve(true);
  }

  pickSeedling(seedling: Seedling): void {
    const req: UpdateSeedlingRequest = {
      _id: seedling._id,
      picked: true,
    };

    this.worker
      .updateSeedling(req)
      .then((res: UpdateDashboardResponse) => {
        if (res.success) {
          this.refreshDashboard();
        }
      })
      .catch((err) => {
        console.error(
          'Update-Seedling-Exception: Failed to update seedling.',
          err
        );
      });
  }

  async applyFertilizer(fertilizer: WarehouseItem): Promise<boolean> {
    const seedling = this.dashboard.model.seedlings.find(
      (item) =>
        item.row === this.lastSelectedSpot.row &&
        item.col === this.lastSelectedSpot.col
    );

    const reqSeedling: UpdateSeedlingRequest = {
      _id: seedling._id,
      accelerateGrowthBy: fertilizer.accelerateGrowthBy,
    };
    const resSeedling: UpdateDashboardResponse = await this.worker.updateSeedling(
      reqSeedling
    );
    if (!resSeedling.success) {
      console.error(
        'Update-Seedling-Exception: Failed to update time to grow.'
      );
      return Promise.reject(false);
    }

    const reqWarehouse: UpdateWarehouseItemRequest = {
      _id: fertilizer._id,
      hothouse: this.dashboard._id,
      quantity: fertilizer.quantity - 1,
    };
    const resWarehouse: UpdateDashboardResponse = await this.worker.updateWarehouseItem(
      reqWarehouse
    );
    if (!resWarehouse.success) {
      console.error(
        'Update-Warehouse-Item-Exception: Failed to update warehouse.'
      );
      return Promise.reject(false);
    }

    this.refreshDashboard();
    return Promise.resolve(true);
  }
}
