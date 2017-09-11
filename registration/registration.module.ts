import { NgModule }                 from "@angular/core";
import { CommonModule }             from "@angular/common";
import { FormsModule }              from "@angular/forms";
import { NgbModule }                  from "@ng-bootstrap/ng-bootstrap";
import { REGISTRATIONROUTING }      from "./registration.route";
import { RegistrationComponent }    from "./registration.component";
import { RegistrationConfirmation } from "./registration.confirmation";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    REGISTRATIONROUTING
  ],
  declarations: [
    RegistrationComponent,
    RegistrationConfirmation
  ]
})

export class RegistrationModule { }
