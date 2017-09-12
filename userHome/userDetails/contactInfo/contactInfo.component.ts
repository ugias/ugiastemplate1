import { Component, OnInit, Input, Output, EventEmitter}
from "@angular/core";
import { Router, ActivatedRoute }                       from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import {NgbDateStruct, NgbDatepickerConfig}                  from "@ng-bootstrap/ng-bootstrap";
import { Token, User, UserContactInfo, Pagination, Organisation, Salutation, Error }
from "../../../../models";
import { CurrentUserService }    from "../../../../services/shared";
import { CommonUtility }                from "../../../../utils/commonUtility";
import { CONFIGURATION }                from "../../../../app.constants";
import { USERHOMECONSTANTS }            from "../../userHome.constants";
import { UserHomeService }              from "../../userHome.service";
import { UserDetailsService }           from "../userDetails.service";
import { StaticUserDataService }        from "../../../../services/staticUserData.service";
import { UserContactInfoService }       from "./contactInfo.service";
import * as swal                        from "sweetalert2";
import {NgProgressService}              from "ng2-progressbar";
@Component({
    selector: "contact-info",
    template: `
    <div [ngSwitch]="isEditMode">
      <template [ngSwitchCase]="true"> ${require("./contactInfoEdit.component.html")} </template>
      <template ngSwitchDefault> ${require("./contactInfo.component.html")} </template>
    </div>`,
    providers: [UserContactInfoService, NgbDatepickerConfig]
})

export class UserContactInfoComponent implements OnInit {
    @Input() userDetails: User;
    @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    salutationList: Salutation[];
    userContactInfo: UserContactInfo;
    errorMessage: string;
    errors: Error[];
    currentDate: Date = new Date();
    ngbDateOfBirth: NgbDateStruct;
    isEditMode: boolean;
    isProcessing: boolean;
    hasEditPermission: boolean = false;

    constructor(private pService: NgProgressService,
        private currentUserService: CurrentUserService,
        private cecRouter: Router,
        private cecActivatedRoute: ActivatedRoute,
        private userContactInfoService: UserContactInfoService,
        private userHomeService: UserHomeService,
        private staticUserDataService: StaticUserDataService,
        private commonUtility: CommonUtility,
        private config: NgbDatepickerConfig) {
        config.minDate = { year: 1900, month: 2, day: 1 };
        config.maxDate = { year: this.currentDate.getFullYear(), month: this.currentDate.getMonth() + 1, day: this.currentDate.getDate() };
        this.isProcessing = false;
    }

    // region: Event handlers
    ngOnInit() {
        this.errorMessage = "";
        this.errors = [];
        this.isEditMode = false;
        this.userContactInfo = new UserContactInfo();

        // Apply security rules
        // Global admins, diocesan admin and organisation admin can edit contact details or logged in user can edit own contact details
        let token = this.currentUserService.token;
        if (token) {
            // Global admins, diocesan admin and organisation admin can edit contact details
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId]) {
                this.hasEditPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin
                    || token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator;
            } else {
                // Logged in user can edit own contact details
                this.hasEditPermission = true;
            }
        };
    }

    onDateOfBirthChange(dateOfBirth) {
        this.ngbDateOfBirth = dateOfBirth;
        this.userContactInfo.dateOfBirth = new Date(this.ngbDateOfBirth.year, this.ngbDateOfBirth.month - 1, this.ngbDateOfBirth.day);
    }

    onContactEditSubmit() {
        // Map view to edit model 
        Object.keys(this.userDetails).forEach(key => this.userContactInfo[key] = this.userDetails[key]);
        if (!this.salutationList) {
            // Initialise with static data
            this.salutationList = this.staticUserDataService.GetSalutationList();
        }
        if (this.userContactInfo.dateOfBirth) {
            this.ngbDateOfBirth = this.commonUtility.ConvertDateStringToNgbDate(this.userContactInfo.dateOfBirth.toString());
        }
        this.isEditMode = true;
    }

    onContactInfoSave() {
        this.pService.start();
        this.errorMessage = "";
        this.errors = [];
        this.isProcessing = true;
        this.handleProcessing.emit(true);
        // Update contact info in the DB
        this.userContactInfoService
            .Update(this.userContactInfo)
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
                    let popupMessage = "You do not have permission to update contact details!";
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
        this.isEditMode = false;
    }

    onContactEditCancel() {
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