import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateWorkerComponent } from './admin-create-worker.component';

describe('AdminCreateWorkerComponent', () => {
  let component: AdminCreateWorkerComponent;
  let fixture: ComponentFixture<AdminCreateWorkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateWorkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
