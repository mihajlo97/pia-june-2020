import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-choose-type',
  templateUrl: './choose-type.component.html',
  styleUrls: ['./choose-type.component.css'],
})
export class ChooseTypeComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  displayRegistrationForm(type: string): void {
    if (type === 'worker') {
      this.router.navigate(['../worker'], { relativeTo: this.route });
    } else if (type === 'company') {
      this.router.navigate(['../company'], { relativeTo: this.route });
    } else {
      console.error('Unsupported child route of component Register.');
    }
  }
}
