import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Error404Component } from './components/error404/error404.component';
import { WorkerRegisterComponent } from './components/register/worker-register/worker-register.component';
import { CompanyRegisterComponent } from './components/register/company-register/company-register.component';
import { ChooseTypeComponent } from './components/register/choose-type/choose-type.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegisterComponent,
    children: [
      { path: 'worker', component: WorkerRegisterComponent },
      { path: 'company', component: CompanyRegisterComponent },
      { path: 'choose-type', component: ChooseTypeComponent },
    ],
  },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
