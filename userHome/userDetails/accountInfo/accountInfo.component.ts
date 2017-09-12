import { Component, Input, Output, EventEmitter, OnInit }
    from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { Token, User, UserAccountInfo, AccountStatus, GlobalRole, DisableReason, Error }
    from "../../../../models";
import { CurrentUserService } from "../../../../services/shared";
import { CONFIGURATION } from "../../../../app.constants";
import { USERHOMECONSTANTS } from "../../userHome.constants";
import { UserHomeService } from "../../userHome.service";
import { UserDetailsService } from "../userDetails.service";
import { StaticUserDataService } from "../../../../services/staticUserData.service";
import { UserAccountInfoService } from "./accountInfo.service";
import * as swal from "sweetalert2";
import { NgProgressService } from "ng2-progressbar";

@Component({
    selector: "account-info",
    template: `
    <div [ngSwitch]="isEditMode">
      <template [ngSwitchCase]="true"> ${require("./accountInfoEdit.component.html")} </template>
      <template ngSwitchDefault> ${require("./accountInfo.component.html")} </template>
    </div>`,
    providers: [UserAccountInfoService]
})

export class UserAccountInfoComponent implements OnInit {
    @Input() userDetails: User;
    //@Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    accountStatusList: AccountStatus[];
    globalRoleList: GlobalRole[];
    disableReasons: DisableReason[];
    userAccountInfo: UserAccountInfo;
    errorMessage: string;
    errors: Error[];
    isEditMode: boolean;
    isProcessing: boolean;
    hasEditPermission: boolean = false;
    disabledReasonValid: boolean;
    constructor(private pService: NgProgressService,
        private currentUserService: CurrentUserService,
        private cecRouter: Router,
        private cecActivatedRoute: ActivatedRoute,
        private userAccountInfoService: UserAccountInfoService,
        private userHomeService: UserHomeService,
        private staticUserDataService: StaticUserDataService) {
    }

    // region: Event handlers

    ngOnInit() {
        this.errorMessage = "";
        this.errors = [];
        this.isEditMode = false;
        this.isProcessing = false;

        // Apply security rules
        // Only global admin can edit account info;
        let token = this.currentUserService.token;
        if (token) {
            this.hasEditPermission = (token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin
                || token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin);
        };
        this.disabledReasonValid = true;
    }

    onAccountEditSubmit() {
        this.pService.start();
        this.userAccountInfo = new UserAccountInfo();
        this.userAccountInfo.disableReason = new DisableReason();
        // Map view to edit model 
        Object.keys(this.userDetails).forEach(key => this.userAccountInfo[key] = this.userDetails[key]);

        if (this.userDetails.disableReasonCode === CONFIGURATION.disabledReasons.other) {
            this.userAccountInfo.disableReasonComment = this.userDetails.disableReasonComment;
        }

        if (!this.accountStatusList) {
            // Initialise with static data
            this.accountStatusList = this.staticUserDataService.GetAccountStatusList();
            this.disableReasons = this.staticUserDataService.GetDisableReasonList();
            this.globalRoleList = this.staticUserDataService.GetGlobalRoleList();
            // Get data from persistent storage
            this.GetAccountStatuses();
            //this.GetGlobalRoles();
            this.GetDisableReasons();
        }
        this.isEditMode = true;
        this.pService.done();
    }
    public AccountStatusChange(selecteAccount): void {
        this.disabledReasonValid = (CONFIGURATION.accountStatuses.inActive === selecteAccount && this.userAccountInfo.disableReasonCode !== null);

        if (CONFIGURATION.accountStatuses.active === selecteAccount || CONFIGURATION.accountStatuses.pending === selecteAccount) {
            this.disabledReasonValid = true;
        }
    }

    public AccountselecteDisableReasonChange(selecteDisableReason): void {
        this.disabledReasonValid = true;
    }

    onAccountInfoSave() {
        this.pService.start();
        this.errorMessage = "";
        this.errors = [];
        this.isProcessing = true;
        this.isEditMode = false;
        this.handleProcessing.emit(true);

        if (this.userAccountInfo.accountStatusCode !== CONFIGURATION.accountStatuses.inActive) {
            this.userAccountInfo.disableReason = null;
            this.userAccountInfo.disableReasonCode = null;
        }

        this.userAccountInfoService
            .Update(this.userAccountInfo)
            .subscribe(
            (response: User) => {
                this.userHomeService.userDetailsUpdateConfirm(response);
                this.isEditMode = false;
                swal(
                    "Update Confirmed!",
                    "Request has been processed successfully",
                    "success"
                );
                let impUserId = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId];
                if (impUserId) {
                    let navigationExtras = {
                        queryParams: { "userId": impUserId, "tabId": USERHOMECONSTANTS.tabIds.myDetailsId }
                    };
                    this.cecRouter.navigate(["/home"], navigationExtras);
                } else {
                    this.cecRouter.navigate(["/home"], { queryParams: { "tabId": USERHOMECONSTANTS.tabIds.myDetailsId } });
                }
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                    let popupMessage = "You do not have permission to update account details!";
                    if (this.errors) {
                        popupMessage = this.errors[0].message;
                    }
                    swal(
                        paersedErrors.message,
                        popupMessage,
                        "error"
                    );
                }
            })
            .add(t => {
                this.isProcessing = false;
                this.handleProcessing.emit(false);
                this.isEditMode = false;
            });
        this.pService.done();
    }

    onAccountEditCancel() {
        this.isEditMode = false;
    }

    onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    // endRegion: Event handlers

    public GetAccountStatuses() {
        // Get account status list
        this.userAccountInfoService
            .GetAccountStatuses()
            .subscribe(
            (response: AccountStatus[]) => {
                this.accountStatusList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public GetGlobalRoles() {
        // Get global roles list list
        this.userAccountInfoService
            .GetGlobalRoles()
            .subscribe(
            (response: GlobalRole[]) => {
                this.globalRoleList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public GetDisableReasons() {
        // Get disable reasons list
        this.userAccountInfoService
            .GetDisableReasons()
            .subscribe(
            (response: DisableReason[]) => {
                this.disableReasons = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }


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