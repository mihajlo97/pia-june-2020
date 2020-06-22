import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProductDetailsComponent } from './company-product-details.component';

describe('CompanyProductDetailsComponent', () => {
  let component: CompanyProductDetailsComponent;
  let fixture: ComponentFixture<CompanyProductDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyProductDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
