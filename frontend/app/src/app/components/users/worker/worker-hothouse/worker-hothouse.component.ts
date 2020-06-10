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
} from 'src/app/models/worker';
import { FormGroup, FormBuilder } from '@angular/forms';

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
  seedlingss = [
    { seedling: 'Test apple', days: 7, quantity: 20 },
    { seedling: 'Test pear', days: 10, quantity: 12 },
    { seedling: 'Test plum', days: 12, quantity: 45 },
    { seedling: 'Test cherry', days: 6, quantity: 36 },
    { seedling: 'Test peach', days: 14, quantity: 7 },
  ];

  dashboard: HothouseDashboard;
  menuForm: FormGroup;

  loadSuccess: boolean;

  spotStates: SpotState[] = [
    SpotState.EMPTY,
    SpotState.PREPARING,
    SpotState.GROWING,
    SpotState.DONE,
  ];
  fertilizers: WarehouseItem[] = [];
  seedlings: WarehouseItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private worker: WorkerService,
    private fb: FormBuilder
  ) {
    this.menuForm = fb.group({
      water: [WATER_DEFAULT],
      temperature: [TEMPERATURE_DEFAULT],
    });
    worker
      .getHothouseDashboardData({ _id: this.route.snapshot.paramMap.get('id') })
      .then((res: HothouseDashboardDataResponse) => {
        //bind dashboard data
        this.dashboard._id = this.route.snapshot.paramMap.get('id');
        this.dashboard.model = res;

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
          let control: HothouseSpotUIControls;

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

        //bind menu to dashboard model
        this.menuForm.get('water').valueChanges.subscribe((value) => {
          if (value > WATER_MIN && value < WATER_MAX) {
            this.dashboard.model.hothouseControl.waterAmount = value;
          }
          console.log(
            '[DEBUG]: dashboard.model.hothouseControl:',
            this.dashboard.model.hothouseControl
          );
        });
        this.menuForm.get('temperature').valueChanges.subscribe((value) => {
          if (value > TEMPERATURE_MIN && value < TEMPERATURE_MAX) {
            this.dashboard.model.hothouseControl.temperature = value;
          }
          console.log(
            '[DEBUG]: dashboard.model.hothouseControl:',
            this.dashboard.model.hothouseControl
          );
        });

        //check errors
        this.loadSuccess = true;
      })
      .catch((err) => {
        console.error('Loading-Hothouse-Dashboard-Exception:', err.error);
        this.loadSuccess = false;
      });
  }

  ngOnInit(): void {}

  calculateProgressWidth(control: HothouseSpotUIControls): string {
    return `width: ${control.progress}%`;
  }

  plantSeedling(seedling: Seedling): void {}

  pickSeedling(seedling: Seedling): void {}

  applyFertilizer(fertilizer: WarehouseItem): void {}
}
