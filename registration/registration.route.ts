import { RouterModule }  from "@angular/router";
import { RegistrationComponent } from "./registration.component";
import { RegistrationConfirmation } from "./registration.confirmation";

export const REGISTRATIONROUTING = RouterModule.forChild([
  { path: "registration", component: RegistrationComponent},
  { path: "confirmation", component: RegistrationConfirmation}
]);

