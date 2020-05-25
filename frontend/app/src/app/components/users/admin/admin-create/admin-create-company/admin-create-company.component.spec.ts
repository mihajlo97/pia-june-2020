import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateCompanyComponent } from './admin-create-company.component';

describe('AdminCreateCompanyComponent', () => {
  let component: AdminCreateCompanyComponent;
  let fixture: ComponentFixture<AdminCreateCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
