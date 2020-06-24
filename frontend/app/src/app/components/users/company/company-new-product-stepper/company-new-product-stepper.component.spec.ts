import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyNewProductStepperComponent } from './company-new-product-stepper.component';

describe('CompanyNewProductStepperComponent', () => {
  let component: CompanyNewProductStepperComponent;
  let fixture: ComponentFixture<CompanyNewProductStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyNewProductStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyNewProductStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
