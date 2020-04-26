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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    Error404Component,
    WorkerRegisterComponent,
    CompanyRegisterComponent,
    ChooseTypeComponent,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
