import { RouterModule }  from "@angular/router";
import { UserHomeComponent } from "./userHome.component";
import { UserDetailsComponent } from "./userDetails";
import { ApplicationComponent } from "./applications";
import { UserAuthenticationService} from "../../services/shared";

export const USERHOMEROUTING = RouterModule.forChild([
  { path: "myhome", component: UserHomeComponent },
  { path: "userDetails/:accountId/:userId", component: UserDetailsComponent },
  { path: "applications", component: ApplicationComponent }
]);

