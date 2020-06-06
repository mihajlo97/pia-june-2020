import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WorkerService } from 'src/app/services/users/worker.service';
import {
  CreateHothouseRequest,
  CreateHothouseResponse,
} from 'src/app/models/worker';
import { AuthenticationService } from 'src/app/services/authentication.service';

//use jQuery
declare var $: any;

@Component({
  selector: 'app-worker-create',
  templateUrl: './worker-create.component.html',
  styleUrls: ['./worker-create.component.css'],
})
export class WorkerCreateComponent implements OnInit {
  createForm: FormGroup;
  didCreateHothouseFail: boolean;

  constructor(
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private worker: WorkerService
  ) {
    this.createForm = fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      dimensionWidth: [
        1,
        Validators.compose([Validators.min(1), Validators.required]),
      ],
      dimensionHeight: [
        1,
        Validators.compose([Validators.min(1), Validators.required]),
      ],
    });
  }

  ngOnInit(): void {}

  createHothouse(): void {
    this.didCreateHothouseFail = false;

    const req: CreateHothouseRequest = {
      username: this.auth.getLoggedInUser(),
      name: this.createForm.value.name,
      location: this.createForm.value.location,
      width: this.createForm.value.dimensionWidth,
      height: this.createForm.value.dimensionHeight,
    };

    this.worker
      .createHothouse(req)
      .then((res: CreateHothouseResponse) => {
        if (res.success) {
          $('#successModal').modal('show');
        }
      })
      .catch((err) => {
        this.didCreateHothouseFail = true;
      });
  }

  closeModal(): void {
    this.createForm.reset();
    $('#successModal').modal('hide');
  }
}
