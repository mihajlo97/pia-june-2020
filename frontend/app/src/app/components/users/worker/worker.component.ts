import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css'],
})
export class WorkerComponent implements OnInit, OnDestroy {
  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.toastr.clear();
  }
}
