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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
