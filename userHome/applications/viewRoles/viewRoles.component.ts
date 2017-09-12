import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ChangeDetectorRef }
    from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { Diocese, Organisation, Error, Pagination, AccountApplicationClaim, ApplicationClaim, ApplicationSummary }
    from "../../../../models";
import { USERHOMECONSTANTS } from "../../userHome.constants";
import { CommonDataService, CurrentUserService } from "../../../../services/shared";
import { CommonEmitterService } from "../../../../services/commonEmitter.service";
import { UserHomeService } from "../../userHome.service";
import { ApplicationService } from "../applications.service";
import { ViewUserRolesService } from "./ViewRoles.service";
import * as swal from "sweetalert2";

@Component({
    selector: "view-user-roles",
    template: require("./viewRoles.component.html"),
    styles: [require("./ViewRoles.component.less").toString()],
    providers: [ViewUserRolesService, CommonDataService]
})

export class ViewRolesComponent implements OnInit {
    @Input() isAdministrator: boolean;
    @Input() accountOrganisationId: string;
    @Input() applicationClaimListObservable: Observable<ApplicationClaim[]>;
    @Input() applications: ApplicationSummary[];
    currentAccountApplicationClaim: AccountApplicationClaim[];
    appClaims: ApplicationClaim[];
   
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    assignRoleEmitterId: string = "assignUserRoleEmitter";
    messageHeader: string;
    errors: Error[];
    accountApplicationClaims: AccountApplicationClaim[];
    dioceseIdToProcess: number;
    applicationIdToProcess: string;
    applicationClaims: ApplicationClaim[];
    assigningUserRolesComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.ascOrderString,
        sortColumn: "UserId",
        pagination: new Pagination()
    };
    isProcessing: boolean;
    organisationName: string;

    constructor(private viewRolesService: ViewUserRolesService,
        private applicationService: ApplicationService,
        private commonDataService: CommonDataService,
        private ref: ChangeDetectorRef, private currentUserService: CurrentUserService) {
        this.assigningUserRolesComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
    }

    // region: Event handlers

    ngOnInit() {
        this.messageHeader = "";
        this.errors = [];
        this.isProcessing = false;
        this.organisationName = this.currentUserService.userInfo.organisation.name;
        this.GetApplicationClaimsByAccountOrganisationId(this.currentUserService.userInfo.organisation.extOrganisationId, this.applications[0].applicationId, this.accountOrganisationId);
        this.onApplicationChange(this.applications[0].applicationId);
    }

    onApplicationChange(applicationId) {
        this.messageHeader = "";
        this.applicationIdToProcess = applicationId;
        this.accountApplicationClaims = [];
        this.GetApplicationClaimsByAccountOrganisationId(this.currentUserService.userInfo.organisation.extOrganisationId, applicationId, this.accountOrganisationId);
        this.GetAccountApplicationClaims(this.applicationIdToProcess);
    }

    onPageChanged(currentPageObject) {
        this.assigningUserRolesComponent.pagination.currentPage = currentPageObject.page;
        this.GetAccountApplicationClaims(this.applicationIdToProcess);
    }

    onAssignUserRolesSubmit() {
        this.messageHeader = "";
        this.errors = [];
        this.isProcessing = true;
        this.ProcessSubmitRequest(this);
        this.isProcessing = false;
    }

    onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    // endRegion: Event handlers

    public ProcessSubmitRequest(viewRolesComponent: ViewRolesComponent) {
        let continueProcessing = false;
        swal({
            title: "Are you sure?",
            text: "You are submitting this request.",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        }).then(function () {
            continueProcessing = true;
            viewRolesComponent.SubmitAccountApplicationClaims(viewRolesComponent.accountApplicationClaims);
        }, function (dismiss) {
            continueProcessing = false;
        });
    }

    public SortIconClass(columnIndex): string {
        if (columnIndex === this.assigningUserRolesComponent.sortColumnIndex) {
            if (this.assigningUserRolesComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                return USERHOMECONSTANTS.sorting.ascIconClass;
            } else {
                return USERHOMECONSTANTS.sorting.descIconClass;
            }
        } else {
            return "";
        }
    }

    public SortList(columnIndex: number) {
        if (columnIndex === this.assigningUserRolesComponent.sortColumnIndex) {
            if (this.assigningUserRolesComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.assigningUserRolesComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.assigningUserRolesComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.assigningUserRolesComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            switch (columnIndex) {
                case 1:
                    this.assigningUserRolesComponent.sortColumn = "UserId";
                    break;
                case 2:
                    this.assigningUserRolesComponent.sortColumn = "Role";
                    break;
                default:
                    this.assigningUserRolesComponent.sortColumn = "UserId";
            }
        }
        this.assigningUserRolesComponent.sortColumnIndex = columnIndex;

        this.GetAccountApplicationClaims(this.applicationIdToProcess);
    }

    public IsRoleAlreadyExist(applicationClaims, applicationClaimId) {
        let exists = applicationClaims.find(claims => claims.applicationClaimId === applicationClaimId);
        return exists;
    }

    public GetApplicationClaimsByAccountOrganisationId(extOrganisationId: string, applicationIdToProcess: string, accountOrganisationId: string): void {
        this.viewRolesService
            .GetApplicationClaimsByAccountOrganisationId(extOrganisationId, applicationIdToProcess, accountOrganisationId)
            .map(response => response.json())
            .subscribe(response => {
                this.currentAccountApplicationClaim = <AccountApplicationClaim[]>response.result;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
            });
    }

    public GetAccountApplicationClaims(applicationIdToProcess: string): void {
        this.viewRolesService
            .GetAccountApplicationClaims(this.currentUserService.userInfo.organisation.extOrganisationId,
            applicationIdToProcess, this.assigningUserRolesComponent.pagination, this.assigningUserRolesComponent.sortOrder, this.assigningUserRolesComponent.sortColumn)
            .map(response => response.json())
            .subscribe(response => {

                this.accountApplicationClaims = <AccountApplicationClaim[]>response.result;
                this.assigningUserRolesComponent.pagination.totalItems = response.count; // get from the response    

                for (let accountClaim of this.accountApplicationClaims) {
                    for (let applicationCliam of this.currentAccountApplicationClaim[0].applicationClaims) {
                        if (!accountClaim.applicationClaims.find(claim => claim.applicationClaimId === applicationCliam.applicationClaimId)) {
                            let tmpApplicationClaim = new ApplicationClaim();
                            tmpApplicationClaim.applicationClaimId = applicationCliam.applicationClaimId;
                            tmpApplicationClaim.isSelected = false;
                            tmpApplicationClaim.name = applicationCliam.name;
                            tmpApplicationClaim.statusCode = applicationCliam.statusCode;
                            accountClaim.applicationClaims.push(tmpApplicationClaim);
                        }
                    }
                    accountClaim.applicationClaims.sort((n1, n2) => {
                        if (n1.name > n2.name) return 1;
                        if (n1.name < n2.name) return -1;
                    });
                }
             
                this.ref.detectChanges();
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
            });
    }

    public SubmitAccountApplicationClaims(accountApplicationClaims: AccountApplicationClaim[]): boolean {
        this.viewRolesService
            .SubmitAccountApplicationClaims(accountApplicationClaims)
            .subscribe((response: boolean) => {
                if (response === true) {
                    this.messageHeader = "Your request has been processed successfully!";
                    swal(
                        "Done!",
                        "Your request has been completed successfully!",
                        "success"
                    );
                } else {
                    swal(
                        "Failed!",
                        "Failed to process your request! Please try later...",
                        "error"
                    );
                }
            },
            (error) => {
                swal(
                    "Failed!",
                    "Failed to process your request! Please try later...",
                    "error"
                );
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
                return false;
            });
        return true;
    }
}
