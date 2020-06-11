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
} from 'src/app/models/worker';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-worker-hothouse',
  templateUrl: './worker-hothouse.component.html',
  styleUrls: ['./worker-hothouse.component.css'],
})
export class WorkerHothouseComponent implements OnInit {
  dashboard: HothouseDashboard = {} as HothouseDashboard;
  menuForm: FormGroup;
  fertilizers: WarehouseItem[];
  seedlings: WarehouseItem[];
  lastSelectedSpot = {
    row: 0,
    col: 0,
  };

  spotStates: SpotState[] = [
    SpotState.EMPTY,
    SpotState.PREPARING,
    SpotState.GROWING,
    SpotState.DONE,
  ];
  loadSuccess: boolean = true;

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

        //bind menu data
        this.menuForm
          .get('water')
          .setValue(this.dashboard.model.hothouseControl.waterAmount);
        this.menuForm
          .get('temperature')
          .setValue(this.dashboard.model.hothouseControl.temperature);

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
            if (seedling.done) {
              control.progress = PROGRESS_MAX;
            } else {
              const plantedOn = seedling.plantedOn.getTime();
              const doneOn =
                plantedOn + 1000 * 60 * 60 * 24 * seedling.daysToGrow;
              control.progress = Math.floor(
                ((now - plantedOn) / (doneOn - plantedOn)) * 100
              );
            }
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
                now > readyOn ? SpotState.EMPTY : SpotState.PREPARING;
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
        this.menuForm.get('water').valueChanges.subscribe((value) => {
          if (value > WATER_MIN && value < WATER_MAX) {
            this.dashboard.model.hothouseControl.waterAmount = value;
          }
        });
        this.menuForm.get('temperature').valueChanges.subscribe((value) => {
          if (value > TEMPERATURE_MIN && value < TEMPERATURE_MAX) {
            this.dashboard.model.hothouseControl.temperature = value;
          }
        });

        console.log('[DEBUG]: Dashboard: ', this.dashboard);
        //check errors
        this.loadSuccess = true;
      })
      .catch((err) => {
        console.error('Loading-Hothouse-Dashboard-Exception:', err);
        this.loadSuccess = false;
      });
  }

  markSpot(row: number, col: number): void {
    this.lastSelectedSpot.row = row;
    this.lastSelectedSpot.col = col;
  }

  itemStocked(quantity: number): boolean {
    return Math.floor(quantity) > 0;
  }

  calculateProgressWidth(control: HothouseSpotUIControls): string {
    return `width: ${control.progress}%`;
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
        'Create-Seedling-Exception: Failed to save seedling to server.'
      );
      return Promise.reject(false);
    }

    this.refreshDashboard();
    return Promise.resolve(true);
  }

  pickSeedling(seedling: Seedling): void {}

  applyFertilizer(fertilizer: WarehouseItem): void {}
}
