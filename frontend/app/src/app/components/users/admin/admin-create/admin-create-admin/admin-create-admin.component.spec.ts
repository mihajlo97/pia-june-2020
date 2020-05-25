import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateAdminComponent } from './admin-create-admin.component';

describe('AdminCreateAdminComponent', () => {
  let component: AdminCreateAdminComponent;
  let fixture: ComponentFixture<AdminCreateAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
