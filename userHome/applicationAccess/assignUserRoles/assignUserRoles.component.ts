import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ChangeDetectorRef }
from "@angular/core";
import { Router }                       from "@angular/router";
import { Response }                     from "@angular/http";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Diocese, Organisation, Error, Pagination, AccountApplicationClaim, ApplicationClaim }
from "../../../../models";
import { USERHOMECONSTANTS }            from "../../userHome.constants";
import { CommonDataService }            from "../../../../services/shared";
import { StaticUserDataService }         from "../../../../services/staticUserData.service";
import { CommonEmitterService }          from "../../../../services/commonEmitter.service";
import { UserHomeService }              from "../../userHome.service";
import { ApplicationAccessService }     from "../applicationAccess.service";
import { AssignUserRolesService }       from "./assignUserRoles.service";
import * as swal                        from "sweetalert2";

@Component({
    selector: "assign-user-roles",
    template: require("./assignUserRoles.component.html"),
    styles: [require("./assignUserRoles.component.less").toString()],
    providers: [AssignUserRolesService, CommonDataService, StaticUserDataService]
})

export class AssignUserRolesComponent implements OnInit {
    @Input() currentApplicationId: string;
    @Input() applicationClaimListObservable: Observable<ApplicationClaim[]>;
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    assignRoleEmitterId: string = "assignUserRoleEmitter";
    messageHeader: string;
    errors: Error[];
    dioceseListObservable: Observable<Diocese[]>;
    accountApplicationClaims: AccountApplicationClaim[];
    organisationList: Organisation[];
    dioceseIdToProcess: number;
    extOrganisationIdToProcess: string;
    applicationClaims: ApplicationClaim[];
    assigningUserRolesComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.ascOrderString,
        sortColumn: "UserId",
        pagination: new Pagination()
    };
    isProcessing: boolean;

    constructor(private assignUserRolesService: AssignUserRolesService,
        private applicationAccessService: ApplicationAccessService,
        private staticUserDataService: StaticUserDataService,
        private commonDataService: CommonDataService,
        private ref: ChangeDetectorRef) {
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

        // Get organisation roles
        this.dioceseListObservable = this.commonDataService.GetDioceseList();
         this.applicationClaimListObservable
            .subscribe(
            (response: ApplicationClaim[]) => {
                this.applicationClaims = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
            });
    }

    onDioceseIdChange(dioceseId) {
        this.dioceseIdToProcess = dioceseId;
        this.accountApplicationClaims = [];

        this.commonDataService
            .GetOrganisationsByDioceseId(dioceseId)
            .subscribe(
            (response: Organisation[]) => {
                this.organisationList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
            });
    }

    onOrganisationChange(extOrganisationId) {
        this.messageHeader = "";
        this.extOrganisationIdToProcess = extOrganisationId;
        this.accountApplicationClaims = [];
        this.GetAccountApplicationClaims(this.extOrganisationIdToProcess);
    }

    onPageChanged(currentPageObject) {
        this.assigningUserRolesComponent.pagination.currentPage = currentPageObject.page;
        this.GetAccountApplicationClaims(this.extOrganisationIdToProcess);
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

    public ProcessSubmitRequest(assignUserRolesComponent: AssignUserRolesComponent) {
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
            assignUserRolesComponent.SubmitAccountApplicationClaims(assignUserRolesComponent.accountApplicationClaims);
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

        this.GetAccountApplicationClaims(this.extOrganisationIdToProcess);
    }

    public IsRoleAlreadyExist(applicationClaims, applicationClaimId) {
        let exists = applicationClaims.find(claims => claims.applicationClaimId === applicationClaimId);
        return exists;
    }

    public GetAccountApplicationClaims(externalOrganisationId: string): void {
        this.assignUserRolesService
            .GetAccountApplicationClaims(externalOrganisationId, this.currentApplicationId, this.assigningUserRolesComponent.pagination, this.assigningUserRolesComponent.sortOrder, this.assigningUserRolesComponent.sortColumn)
            .map(response => response.json())
            .subscribe(response => {
                this.accountApplicationClaims = <AccountApplicationClaim[]>response.result;
                this.assigningUserRolesComponent.pagination.totalItems = response.count; // get from the response    
                for (let accountClaim of this.accountApplicationClaims) {
                    for (let applicationCliam of this.applicationClaims) {
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
        this.assignUserRolesService
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
