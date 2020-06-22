import { Component, OnInit } from '@angular/core';
import { CompanyService } from 'src/app/services/users/company.service';
import { Observable } from 'rxjs';
import { ProductBasicInfo } from 'src/app/models/company';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-company-catalog',
  templateUrl: './company-catalog.component.html',
  styleUrls: ['./company-catalog.component.css'],
})
export class CompanyCatalogComponent implements OnInit {
  itemStream$: Observable<ProductBasicInfo[]>;

  constructor(
    private company: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.itemStream$ = company.getCompanyCatalog();
  }

  ngOnInit(): void {}

  viewProduct(product: ProductBasicInfo): void {
    this.router.navigate([`${product._id}`], {
      relativeTo: this.route,
    });
  }
}
