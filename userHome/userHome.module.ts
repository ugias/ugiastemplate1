import { NgModule }                 from "@angular/core";
import { CommonModule }             from "@angular/common";
import { FormsModule }              from "@angular/forms";
import { TabsModule }               from "ng2-bootstrap/components/tabs";
import { PaginationModule }         from "ng2-bootstrap/components/pagination";
import {NgbModule}                  from "@ng-bootstrap/ng-bootstrap";
import { ApplicationComponent }    from "./applications";
import { MessagesComponent }        from "./messages";
import { TasksComponent }           from "./tasks";
import { UserDetailsComponent }     from "./userDetails";
import { WarningInfoComponent, AppInfoComponent, ViewRolesComponent }        from "./applications";
import { AppAccessComponent }        from "./applicationAccess";
import { AccountsComponent }        from "./accounts";
import { ApplicationAccessComponent, AssignGroupRolesComponent, AssignUserRolesComponent }
from "./applicationAccess";
import { UserAccountInfoComponent, UserContactInfoComponent, UserLoginInfoComponent, UserOrganisationInfoComponent, SecretQuestionsComponent }
from "./userDetails";
import { UserHomeService }          from "./userHome.service";
import { USERHOMECONSTANTS }        from "./userHome.constants";
import { USERHOMEROUTING }          from "./userHome.route";
import { UserHomeComponent }        from "./userHome.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    PaginationModule,
    NgbModule,
    USERHOMEROUTING
  ],
  declarations: [
    UserHomeComponent,
    TasksComponent,
    ApplicationComponent,
    MessagesComponent,
    AccountsComponent,
    UserDetailsComponent,
    UserAccountInfoComponent,
    UserContactInfoComponent,
    UserLoginInfoComponent,
    UserOrganisationInfoComponent,
    SecretQuestionsComponent,
    AppInfoComponent,
    WarningInfoComponent,
    ViewRolesComponent,
    ApplicationAccessComponent,
    AssignGroupRolesComponent,
    AppAccessComponent,
    AssignUserRolesComponent
  ],
  providers: [UserHomeService]
})

export class UserHomeModule { }
