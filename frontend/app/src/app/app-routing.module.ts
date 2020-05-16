import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Error404Component } from './components/error404/error404.component';
import { WorkerRegisterComponent } from './components/register/worker-register/worker-register.component';
import { CompanyRegisterComponent } from './components/register/company-register/company-register.component';
import { ChooseTypeComponent } from './components/register/choose-type/choose-type.component';
import { RegisterSuccessComponent } from './components/register/register-success/register-success.component';
import { WorkerComponent } from './components/users/worker/worker.component';
import { CompanyComponent } from './components/users/company/company.component';
import { AdminComponent } from './components/users/admin/admin.component';
import { AccessForbiddenComponent } from './components/access-forbidden/access-forbidden.component';
import { WorkerAuthGuard } from './guards/worker-auth.guard';
import { CompanyAuthGuard } from './guards/company-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';

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
      { path: 'success', component: RegisterSuccessComponent },
    ],
  },
  {
    path: 'worker',
    component: WorkerComponent,
    canActivate: [WorkerAuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [WorkerAuthGuard],
        children: [],
      },
    ],
  },
  {
    path: 'company',
    component: CompanyComponent,
    canActivate: [CompanyAuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [CompanyAuthGuard],
        children: [],
      },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AdminAuthGuard],
        children: [],
      },
    ],
  },
  { path: 'forbidden', component: AccessForbiddenComponent },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
