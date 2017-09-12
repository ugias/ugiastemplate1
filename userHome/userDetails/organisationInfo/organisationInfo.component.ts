import { Component, Input, Output, EventEmitter, OnInit }
    from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Token, User, Diocese, Organisation, Error, JobTitle, AccountRole, OrganisationStatus }
    from "../../../../models";
import { CurrentUserService } from "../../../../services/shared";
import { CommonUtility } from "../../../../utils/commonUtility";
import { CONFIGURATION } from "../../../../app.constants";
import { USERHOMECONSTANTS } from "../../userHome.constants";
import { UserHomeService } from "../../userHome.service";
import { UserDetailsService } from "../userDetails.service";
import { StaticUserDataService } from "../../../../services/staticUserData.service";
import { UserOrganisationInfoService } from "./organisationInfo.service";
import { NgProgressService } from "ng2-progressbar";
import * as swal from "sweetalert2";
const _ = require("underscore");

@Component({
    selector: "organisation-info",
    template: `
    <div [ngSwitch]="isAddEditUIMode">
      <template [ngSwitchCase]="true"> ${require("./organisationInfoEdit.component.html")} </template>
      <template ngSwitchDefault> ${require("./organisationInfo.component.html")} </template>
    </div>`,
    providers: [UserOrganisationInfoService]
})

export class UserOrganisationInfoComponent implements OnInit {
    @Input() userOrganisations: Organisation[];
    @Input() accountIdToUse: string; //For impersonation use only
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    dioceseList: Diocese[];
    organisationList: Organisation[];
    organisationListObservable: Observable<Organisation[]>;
    jobTitleList: JobTitle[];
    roleList: AccountRole[];
    statusCodeList: OrganisationStatus[];
    organisationModel: Organisation;
    errors: Error[];
    organisationLegendTitle: string;
    errorMessage: string;
    isEditMode: boolean;
    isAddEditUIMode: boolean;
    ngbFromDate: NgbDateStruct;
    ngbToDate: NgbDateStruct;
    isProcessing: boolean;
    isError: boolean;
    hasEditPermission: boolean;
    hasControlEditPermission: boolean = true;
    canSelectNetIdPositionType: boolean = true;
    disableEditStatus: boolean = false;
    impExternalOrganisationId: string;
    currentUserExtOrganId: string;
    constructor(private pService: NgProgressService,
        private currentUserService: CurrentUserService,
        private _router: Router,
        private cecActivatedRoute: ActivatedRoute,
        private userOrganisationInfoService: UserOrganisationInfoService,
        private userHomeService: UserHomeService,
        private staticUserDataService: StaticUserDataService,
        private commonUtility: CommonUtility) {
    }

    // region: Event handlers

    ngOnInit() {
        this.errorMessage = "";
        this.impExternalOrganisationId = "";
        this.errors = [];
        this.isAddEditUIMode = false;
        this.isEditMode = false;
        this.isProcessing = false;
        this.organisationModel = new Organisation();
        this.currentUserExtOrganId = this.currentUserService.userInfo.organisation.extOrganisationId;
        // Apply security rules
        let token = this.currentUserService.token;
        if (token) {
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId]) {
                this.hasEditPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin
                    || token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator;
                this.hasControlEditPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin
                    || token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator;
                if (token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator) {
                    this.impExternalOrganisationId = this.currentUserService.userInfo.organisation.accountOrganisationId;
                }
            } else {
                this.hasEditPermission = true;
                this.hasControlEditPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin;
            }
        };

        // Get diocese list
        this.userOrganisationInfoService
            .GetDioceseList()
            .subscribe(
            (response: Diocese[]) => {
                this.dioceseList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
            });
        // Get job titles
        this.GetJobTitles();
        // get roles
        this.GetRoles();
        // Get organisation status list
        this.statusCodeList = this.staticUserDataService.GetOrganisationStatusList();
    }

    onOrganisationAddSubmit() {
        let token = this.currentUserService.token;
        this.isAddEditUIMode = true;
        this.isEditMode = false;
        this.hasControlEditPermission = true;
        this.ngbFromDate = null;
        this.ngbToDate = null;
        this.organisationModel = new Organisation();
        this.organisationLegendTitle = "Add Organisation";
        this.canSelectNetIdPositionType = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
            || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin
            || token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin
            || token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator;
        if (!this.canSelectNetIdPositionType) {
            this.organisationModel.roleCode = CONFIGURATION.organisationRoles.standard;
        }
    }

    onOrganisationEditSubmit(id) {
        this.isAddEditUIMode = true;
        this.isEditMode = true;
        this.canSelectNetIdPositionType = true;
        this.disableEditStatus = this.userOrganisations.length === 1;
        this.organisationLegendTitle = "Edit Organisation";
        let found = this.userOrganisations.find(o => o.accountOrganisationId === id);
        this.organisationModel = _.clone(found);

        // Set position/job title
        let jobTileFound = this.jobTitleList.find(o => o.code === this.organisationModel.jobTitle);
        if (!jobTileFound) {
            this.organisationModel.otherJobTitle = this.organisationModel.jobTitle;
            this.organisationModel.jobTitle = USERHOMECONSTANTS.otherJobTitle;
        }

        if (this.organisationModel.fromDate) {
            this.ngbFromDate = this.commonUtility.ConvertDateStringToNgbDate(this.organisationModel.fromDate.toString());
        }
        if (this.organisationModel.toDate) {
            this.ngbToDate = this.commonUtility.ConvertDateStringToNgbDate(this.organisationModel.toDate.toString());
        }

        this.organisationListObservable = this.userOrganisationInfoService.GetOrganisationsByDioceseId(this.organisationModel.dioceseId);
    }

    onOrganisationInfoSave() {
        this.pService.start();
        this.errorMessage = "";
        this.errors = [];
        this.isProcessing = true;
        this.handleProcessing.emit(true);
        // Set job title before submit
        if (this.organisationModel.jobTitle === USERHOMECONSTANTS.otherJobTitle) {
            this.organisationModel.jobTitle = this.organisationModel.otherJobTitle;
        }
        if (this.organisationModel.accountOrganisationId) {
            this.userOrganisationInfoService
                .Update(this.organisationModel)
                .subscribe(
                (response: Organisation) => {
                    this.isAddEditUIMode = false;
                    swal(
                        "Update Confirmed!",
                        "Request has been processed successfully",
                        "success"
                    );
                    let impUserId = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId];
                    if (impUserId) {
                        let navigationExtras = {
                            queryParams: { "userId": impUserId, "tabId": USERHOMECONSTANTS.tabIds.myDetailsId, "detailTabId": 1 }
                        };
                        this._router.navigate(["/home"], navigationExtras);
                    } else {
                        this._router.navigate(["/home"], { queryParams: { "tabId": USERHOMECONSTANTS.tabIds.myDetailsId, "detailTabId": 1 } });
                    }
                    this.handleProcessing.emit(false);
                    this.isAddEditUIMode = false;
                },
                (error) => {

                    let parsedErrors = JSON.parse(error._body);

                    if (parsedErrors) {
                        swal(
                            "Failed to Save organisation",
                            parsedErrors.errors[0].message,
                            "error");
                    }
                }).add(t => {
                    this.handleProcessing.emit(false);
                    this.isProcessing = false;
                });
        } else {
            this.organisationModel.accountId = this.accountIdToUse;
            this.userOrganisationInfoService
                .Add(this.organisationModel)
                .subscribe(
                (response: Organisation) => {
                    swal(
                        "Add Confirmed!",
                        "Organisation request has been added successfully and waiting for Principal approval",
                        "success"
                    );
                    let navigationExtras = {
                        queryParams: { "tabId": USERHOMECONSTANTS.tabIds.myDetailsId, "detailTabId": 1 }
                    };
                    this.isAddEditUIMode = false;
                    this.handleProcessing.emit(false);
                    this._router.navigate(["/home"], navigationExtras);
                },
                (error) => {
                    let parsedErrors = JSON.parse(error._body);
                    if (parsedErrors) {
                        this.errorMessage = "You have an overlapping date range, please read help documentation!";
                        this.errors = parsedErrors.errors;
                        let popupMessage = "Failed to add organisation. Please try later...";
                         let title = parsedErrors.message;
                        if (this.errors) {
                            popupMessage = "You have an overlapping date range, please read help documentation!";
                            title = "Invalid Date Range";
                        }
                        swal(
                            title,
                            popupMessage,
                            "error"
                        );
                    }
                }).add(t => {
                    this.handleProcessing.emit(false);
                    this.isProcessing = false;
                });
        }
        this.pService.done();

    }

    onOrganisationEditCancel() {
        this.isAddEditUIMode = false;
        this.isProcessing = false;
        this.organisationModel = new Organisation();
        this.errorMessage = null;
    }

    onHandleProcessing(isProcessing) {
        //   this.isProcessing = isProcessing;
    }

    onDioceseIdChange(dioceseId) {
        this.organisationListObservable = this.userOrganisationInfoService.GetOrganisationsByDioceseId(dioceseId);
    }

    onFromDateChange(fromDate) {
        this.ngbFromDate = fromDate;
        this.organisationModel.fromDate = new Date(this.ngbFromDate.year, this.ngbFromDate.month - 1, this.ngbFromDate.day);
    }

    onToDateChange(toDate) {
        this.ngbToDate = toDate;
        this.organisationModel.toDate = new Date(this.ngbToDate.year, this.ngbToDate.month - 1, this.ngbToDate.day);
    }

    onJobTitleChange(jobTitle) {
        this.organisationModel.jobTitle = jobTitle;
        // Reset other job title
        if (jobTitle !== USERHOMECONSTANTS.otherJobTitle) {
            this.organisationModel.otherJobTitle = "";
        }
    }

    public GetOrganisationByExtOrganisationId(extOrganisationId, userId) {
        this.userOrganisationInfoService
            .GetOrganisationByExtOrganisationId(extOrganisationId, userId)
            .subscribe(
            (response: Organisation) => {
                this.organisationModel = response;
                this.userOrganisationInfoService
                    .GetOrganisationsByDioceseId(this.organisationModel.dioceseId)
                    .subscribe(
                    (orgResponse: Organisation[]) => {
                        this.organisationList = orgResponse;
                    },
                    (error) => {
                        let paersedErrors = JSON.parse(error._body);
                        if (paersedErrors) {
                            this.errorMessage = paersedErrors.message;
                            this.errors = paersedErrors.errors;
                        }
                    });

            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public GetJobTitles() {
        // Get global roles list list
        this.userOrganisationInfoService
            .GetJobTitles()
            .subscribe(
            (response: JobTitle[]) => {
                this.jobTitleList = _.sortBy(response, "name");
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public GetRoles() {
        // Get global roles list list
        this.userOrganisationInfoService
            .GetRoles()
            .subscribe(
            (response: AccountRole[]) => {
                this.roleList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }
}