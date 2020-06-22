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
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangePasswordSuccessComponent } from './components/change-password/change-password-success/change-password-success.component';
import { AdminHomeComponent } from './components/users/admin/admin-home/admin-home.component';
import { AdminManageComponent } from './components/users/admin/admin-manage/admin-manage.component';
import { AdminCreateComponent } from './components/users/admin/admin-create/admin-create.component';
import { AdminDashboardComponent } from './components/users/admin/admin-dashboard/admin-dashboard.component';
import { AdminCreateWorkerComponent } from './components/users/admin/admin-create/admin-create-worker/admin-create-worker.component';
import { AdminCreateCompanyComponent } from './components/users/admin/admin-create/admin-create-company/admin-create-company.component';
import { AdminCreateAdminComponent } from './components/users/admin/admin-create/admin-create-admin/admin-create-admin.component';
import { WorkerDashboardComponent } from './components/users/worker/worker-dashboard/worker-dashboard.component';
import { WorkerHomeComponent } from './components/users/worker/worker-home/worker-home.component';
import { WorkerOrdersComponent } from './components/users/worker/worker-orders/worker-orders.component';
import { WorkerStoreComponent } from './components/users/worker/worker-store/worker-store.component';
import { WorkerCreateComponent } from './components/users/worker/worker-create/worker-create.component';
import { WorkerHothouseComponent } from './components/users/worker/worker-hothouse/worker-hothouse.component';
import { WorkerWarehouseComponent } from './components/users/worker/worker-warehouse/worker-warehouse.component';
import { CompanyDashboardComponent } from './components/users/company/company-dashboard/company-dashboard.component';
import { CompanyHomeComponent } from './components/users/company/company-home/company-home.component';
import { CompanyCatalogComponent } from './components/users/company/company-catalog/company-catalog.component';
import { CompanyProductDetailsComponent } from './components/users/company/company-product-details/company-product-details.component';
import { CompanyNewProductComponent } from './components/users/company/company-new-product/company-new-product.component';
import { CompanyAnalyticsComponent } from './components/users/company/company-analytics/company-analytics.component';

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
        children: [
          {
            path: 'change-password',
            component: ChangePasswordComponent,
          },
          {
            path: 'change-password-success',
            component: ChangePasswordSuccessComponent,
          },
          {
            path: 'dashboard',
            component: WorkerDashboardComponent,
            children: [
              {
                path: 'home',
                component: WorkerHomeComponent,
              },
              {
                path: 'orders',
                component: WorkerOrdersComponent,
              },
              {
                path: 'store',
                component: WorkerStoreComponent,
              },
              {
                path: 'create',
                component: WorkerCreateComponent,
              },
              {
                path: 'hothouse/:id',
                component: WorkerHothouseComponent,
              },
              {
                path: 'warehouse/:id',
                component: WorkerWarehouseComponent,
              },
            ],
          },
        ],
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
        children: [
          {
            path: 'change-password',
            component: ChangePasswordComponent,
          },
          {
            path: 'change-password-success',
            component: ChangePasswordSuccessComponent,
          },
          {
            path: 'dashboard',
            component: CompanyDashboardComponent,
            children: [
              {
                path: 'home',
                component: CompanyHomeComponent,
              },
              {
                path: 'catalog',
                component: CompanyCatalogComponent,
              },
              {
                path: 'catalog/:id',
                component: CompanyProductDetailsComponent,
              },
              {
                path: 'new-product',
                component: CompanyNewProductComponent,
              },
              {
                path: 'analytics',
                component: CompanyAnalyticsComponent,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminAuthGuard],
    canActivateChild: [AdminAuthGuard],
    children: [
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'change-password-success',
        component: ChangePasswordSuccessComponent,
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        children: [
          {
            path: 'home',
            component: AdminHomeComponent,
          },
          {
            path: 'manage',
            component: AdminManageComponent,
          },
          {
            path: 'create',
            component: AdminCreateComponent,
            children: [
              { path: 'worker', component: AdminCreateWorkerComponent },
              { path: 'company', component: AdminCreateCompanyComponent },
              { path: 'admin', component: AdminCreateAdminComponent },
            ],
          },
        ],
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
