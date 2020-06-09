import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerWarehouseComponent } from './worker-warehouse.component';

describe('WorkerWarehouseComponent', () => {
  let component: WorkerWarehouseComponent;
  let fixture: ComponentFixture<WorkerWarehouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerWarehouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
