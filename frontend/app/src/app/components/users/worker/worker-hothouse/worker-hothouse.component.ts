import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-worker-hothouse',
  templateUrl: './worker-hothouse.component.html',
  styleUrls: ['./worker-hothouse.component.css'],
})
export class WorkerHothouseComponent implements OnInit {
  id: string;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {}
}
