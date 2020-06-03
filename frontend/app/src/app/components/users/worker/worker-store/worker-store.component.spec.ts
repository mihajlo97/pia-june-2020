import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerStoreComponent } from './worker-store.component';

describe('WorkerStoreComponent', () => {
  let component: WorkerStoreComponent;
  let fixture: ComponentFixture<WorkerStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
