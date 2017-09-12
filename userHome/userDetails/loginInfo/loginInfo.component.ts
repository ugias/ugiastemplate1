import { Component, OnInit, Input, Output, EventEmitter}
from "@angular/core";
import { Router, ActivatedRoute }       from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Token, User, Pagination, Organisation, UserLoginInfo, Error, LostCredentials}
from "../../../../models";
import { CurrentUserService }    from "../../../../services/shared";
import { CONFIGURATION }                from "../../../../app.constants";
import { USERHOMECONSTANTS }            from "../../userHome.constants";
import { UserHomeService }              from "../../userHome.service";
import { UserDetailsService }           from "../userDetails.service";
import { UserLoginInfoService }         from "./loginInfo.service";
import {NgProgressService}              from "ng2-progressbar";
import * as swal                        from "sweetalert2";

@Component({
    selector: "login-info",
    template: `
    <div [ngSwitch]="isEditMode">
      <template [ngSwitchCase]="true"> ${require("./loginInfoEdit.component.html")} </template>
      <template ngSwitchDefault> ${require("./loginInfo.component.html")} </template>
    </div>`,
    providers: [UserLoginInfoService]
})

export class UserLoginInfoComponent implements OnInit {
    @Input() userDetails: User;
    @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    userLoginInfo: UserLoginInfo;
    errorMessage: string;
    errors: Error[];
    isEditMode: boolean;
    isProcessing: boolean;
    hasEditPermission: boolean = false;

    constructor(private pService: NgProgressService,
        private currentUserService: CurrentUserService,
        private cecRouter: Router, 
        private cecActivatedRoute: ActivatedRoute,
        private userDetailsService: UserDetailsService,
        private userHomeService: UserHomeService,
        private userLoginInfoService: UserLoginInfoService) {
    }

    // region: Event handlers

    ngOnInit() {
        this.errorMessage = "";
        this.errors = [];
        this.isEditMode = false;
        this.isProcessing = false;

        // Apply security rules
        // Global admins can change password or logged in user can change own password
        let token = this.currentUserService.token;
        if (token) {
            // Global admins can change password
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId]) {
                this.hasEditPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin;
            } else {
                // Logged in user can change own password
                this.hasEditPermission = true;
            }
        }
    }

    onLoginEditSubmit() {
        // Map view to edit model 
        this.userLoginInfo = new UserLoginInfo();
        Object.keys(this.userDetails).forEach(key => this.userLoginInfo[key] = this.userDetails[key]);
        this.userLoginInfo.userName = this.userDetails.userId;

        this.isEditMode = true;
    }

    onLoginInfoSave() {
        this.pService.start();
        this.errorMessage = "";
        this.errors = [];
        this.isProcessing = true;
        this.handleProcessing.emit(true);
        if (this.userLoginInfo.password !== this.userLoginInfo.confirmPassword) {
            this.errorMessage = "Input validation failed:";
            this.errors.push({ code: "confirmPassword", message: "Passwords do not match" });
            this.isProcessing = false;
            return;
        }

        let lostCredentials = new LostCredentials();
        lostCredentials.password = this.userLoginInfo.password;
        lostCredentials.userId = this.userLoginInfo.userName;

        this.userLoginInfoService
            .Save(lostCredentials)
            .subscribe(
            (response: LostCredentials) => {
                this.isEditMode = false;
                swal(
                    "Update Confirmed!",
                    "Password has been changed successfully",
                    "success"
                );
            },
            (error) => {
                let parsedErrors = JSON.parse(error._body);
                if (parsedErrors) {
                    this.errorMessage = parsedErrors.message;
                    this.errors = parsedErrors.errors;
                    let popupMessage = "You do not have permission to change password!";
                    if (this.errors) {
                        popupMessage = this.errors[0].message;
                    }
                    swal(
                        parsedErrors.message,
                        popupMessage,
                        "error"
                    );
                }
            });

        this.isEditMode = false;
        this.pService.done();
    }

    onLoginEditCancel() {
        this.isEditMode = false;
    }

    onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    // endRegion: Event handlers

    // public GetUserDetails(): void {
    //     this.userDetailsService
    //         .GetUserDetails("")
    //         .subscribe(
    //         (response: User) => {
    //             this.refreshUserDetails.emit(response);
    //         },
    //         (error) => {
    //             let paersedErrors = JSON.parse(error._body);
    //             if (paersedErrors) {
    //                 this.errorMessage = paersedErrors.message;
    //             }
    //         });
    // }
}