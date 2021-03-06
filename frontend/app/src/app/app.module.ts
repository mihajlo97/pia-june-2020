//Angular core imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

//Dependency imports
import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RECAPTCHA_SETTINGS,
  RecaptchaSettings,
} from 'ng-recaptcha';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { GoogleChartsModule } from 'angular-google-charts';

//App declarations
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Error404Component } from './components/error404/error404.component';
import { WorkerRegisterComponent } from './components/register/worker-register/worker-register.component';
import { CompanyRegisterComponent } from './components/register/company-register/company-register.component';
import { RegistrationService } from './services/registration.service';
import { ChooseTypeComponent } from './components/register/choose-type/choose-type.component';
import { RegisterSuccessComponent } from './components/register/register-success/register-success.component';
import { AdminComponent } from './components/users/admin/admin.component';
import { WorkerComponent } from './components/users/worker/worker.component';
import { CompanyComponent } from './components/users/company/company.component';
import { AccessForbiddenComponent } from './components/access-forbidden/access-forbidden.component';
import { AuthenticationService } from './services/authentication.service';
import { NavbarComponent } from './components/navbar/navbar.component';
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
import { AdminService } from './services/users/admin.service';
import { WorkerService } from './services/users/worker.service';
import { WorkerHothouseComponent } from './components/users/worker/worker-hothouse/worker-hothouse.component';
import { WorkerWarehouseComponent } from './components/users/worker/worker-warehouse/worker-warehouse.component';
import { CompanyDashboardComponent } from './components/users/company/company-dashboard/company-dashboard.component';
import { CompanyHomeComponent } from './components/users/company/company-home/company-home.component';
import { CompanyCatalogComponent } from './components/users/company/company-catalog/company-catalog.component';
import { CompanyProductDetailsComponent } from './components/users/company/company-product-details/company-product-details.component';
import { CompanyNewProductComponent } from './components/users/company/company-new-product/company-new-product.component';
import { CompanyAnalyticsComponent } from './components/users/company/company-analytics/company-analytics.component';
import { CompanyService } from './services/users/company.service';
import { CompanyNewProductStepperComponent } from './components/users/company/company-new-product-stepper/company-new-product-stepper.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    Error404Component,
    WorkerRegisterComponent,
    CompanyRegisterComponent,
    ChooseTypeComponent,
    RegisterSuccessComponent,
    AdminComponent,
    WorkerComponent,
    CompanyComponent,
    AccessForbiddenComponent,
    NavbarComponent,
    ChangePasswordComponent,
    ChangePasswordSuccessComponent,
    AdminHomeComponent,
    AdminManageComponent,
    AdminCreateComponent,
    AdminDashboardComponent,
    AdminCreateWorkerComponent,
    AdminCreateCompanyComponent,
    AdminCreateAdminComponent,
    WorkerDashboardComponent,
    WorkerHomeComponent,
    WorkerOrdersComponent,
    WorkerStoreComponent,
    WorkerCreateComponent,
    WorkerHothouseComponent,
    WorkerWarehouseComponent,
    CompanyDashboardComponent,
    CompanyHomeComponent,
    CompanyCatalogComponent,
    CompanyProductDetailsComponent,
    CompanyNewProductComponent,
    CompanyAnalyticsComponent,
    CompanyNewProductStepperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
    GoogleChartsModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LdwaO0UAAAAAM6e_l3C-jR1rS4EmJjIM5yDJg5j',
      } as RecaptchaSettings,
    },
    RegistrationService,
    AuthenticationService,
    AdminService,
    WorkerService,
    CompanyService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
