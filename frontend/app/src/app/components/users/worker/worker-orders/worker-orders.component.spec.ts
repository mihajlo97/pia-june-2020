import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerOrdersComponent } from './worker-orders.component';

describe('WorkerOrdersComponent', () => {
  let component: WorkerOrdersComponent;
  let fixture: ComponentFixture<WorkerOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
