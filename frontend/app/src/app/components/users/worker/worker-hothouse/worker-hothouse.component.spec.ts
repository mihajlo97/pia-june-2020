import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerHothouseComponent } from './worker-hothouse.component';

describe('WorkerHothouseComponent', () => {
  let component: WorkerHothouseComponent;
  let fixture: ComponentFixture<WorkerHothouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerHothouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerHothouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
