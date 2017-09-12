import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { Token, Application, Pagination, ApplicationClaim, ApplicationStatus, ApplicationClaimStatus }
    from "../../../models";
import { CONFIGURATION } from "../../../app.constants";
import { USERHOMECONSTANTS } from "../userHome.constants";
import { CurrentUserService } from "../../../services/shared";
import { CommonEmitterService } from "../../../services/commonEmitter.service";
import { ApplicationAccessService } from "./applicationAccess.service";
import { UserHomeService } from "../userHome.service";
import * as swal from "sweetalert2";
@Component({
    selector: "application-access",
    template: require("./applicationAccess.component.html"),
    styles: [require("./applicationAccess.component.less").toString()],
    providers: [ApplicationAccessService, CommonEmitterService]
})

export class ApplicationAccessComponent implements OnInit {
    @Input() applicationAccessList: Application[];
    @Input() applicationClaimStatuses: Observable<ApplicationClaimStatus[]>;
    @Input() application: Application;
    @Input() applicationStatuses: Observable<ApplicationStatus[]>;
    @Output() refreshList: EventEmitter<any> = new EventEmitter();
    @Output() refreshApplication: EventEmitter<any> = new EventEmitter();

    selectedApplicationName: string;
    currentApplicationId: string;
    applicationAddEditMode: boolean;
    roleAddEditMode: boolean;
    errorMessage: string;
    activeRoleTabId: number = 0;
    canAddOrEditApplication: boolean;
    applicationClaimListObservable: Observable<ApplicationClaim[]>;
    applicationsComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.ascOrderString,
        sortColumn: "Name",
        pagination: new Pagination(),
        applicationAccessList: new Array<Application>()
    };

    constructor(private currentUserService: CurrentUserService, private cecRouter: Router, private applicationAccessService: ApplicationAccessService, private userHomeService: UserHomeService) {
        this.applicationsComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
        this.selectedApplicationName = "";
        this.applicationAddEditMode = false;
        this.roleAddEditMode = false;
    }

    ngOnInit() {
        // Apply security rules
        // Only global admin can edit account info;
        let token = this.currentUserService.token;
        if (token) {
            this.canAddOrEditApplication = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin;
        } else {
            this.canAddOrEditApplication = false;
        }

        this.GetApplicationsList();
    }

    onApplicationAddClick() {
        this.applicationAddEditMode = true;
        this.roleAddEditMode = false;
        let app = new Application();
        app.claims = new Array<ApplicationClaim>();
        this.refreshApplication.emit(app);
    }

    onResetEditMode() {
        this.applicationAddEditMode = false;
        this.roleAddEditMode = false;
        this.refreshApplication.emit(new Application());
    }

    onApplicationEditClick(applicationId) {
        this.applicationAddEditMode = true;
        this.roleAddEditMode = false;
        this.GetApplication(applicationId);
    }

    onRoleEditClick(applicationId) {
        this.roleAddEditMode = true;
        this.applicationAddEditMode = false;
        this.activeRoleTabId = 0;
        this.currentApplicationId = applicationId;
        this.selectedApplicationName = this.applicationAccessList.find(a => a.id === applicationId).name;
        this.applicationClaimListObservable = this.applicationAccessService.GetApplicationClaims(applicationId);
    }

    onSelectRoleTab(tabIndex: number) {
        this.activeRoleTabId = tabIndex;
    };

    // endregion: event handlers

    public SortIconClass(columnIndex): string {
        if (columnIndex === this.applicationsComponent.sortColumnIndex) {
            if (this.applicationsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                return USERHOMECONSTANTS.sorting.ascIconClass;
            } else {
                return USERHOMECONSTANTS.sorting.descIconClass;
            }
        } else {
            return "";
        }
    }

    public SortList(columnIndex: number) {
        if (columnIndex === this.applicationsComponent.sortColumnIndex) {
            if (this.applicationsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            switch (columnIndex) {
                case 1:
                    this.applicationsComponent.sortColumn = "Name";
                    break;
                case 2:
                    this.applicationsComponent.sortColumn = "Description";
                    break;
                case 3:
                    this.applicationsComponent.sortColumn = "Url";
                    break;
                default:
                    this.applicationsComponent.sortColumn = "Name";
            }
        }
        this.applicationsComponent.sortColumnIndex = columnIndex;
        this.GetApplicationsList();
        // this.GetStaticApplicationsList();
    }

    public PageChanged(currentPageObject) {
        this.applicationsComponent.pagination.currentPage = currentPageObject.page;
        this.GetApplicationsList();
    }

    public GetApplication(applicationId: string): void {
        this.applicationAccessService
            .GetApplication(applicationId)
            .subscribe(
            response => {
                this.refreshApplication.emit(response[0]);
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                    this.refreshApplication.emit(new Application());
                }
            });
    }

    public onRequestAccessClick(appId: string): void {
        this.applicationAccessService
            .ApplicationAccess(appId)
            .map(response => response)
            .subscribe(
            response => {

                swal({
                    title: "Application Request",
                    text: "Access to this application will be available once your Principal (or their delegate) has approved your request",
                    type: "info",
                    showCancelButton: false,
                    confirmButtonText: "Okay"
                });

                this.GetApplicationsList();
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public GetApplicationsList(): void {
        this.applicationAccessService
            .GetApplicationList(this.applicationsComponent.pagination, this.applicationsComponent.sortOrder, this.applicationsComponent.sortColumn)
            .map(response => response.json())
            .subscribe(
            response => {
                this.refreshList.emit(<Application[]>response.result);
                this.userHomeService.confirmTotalItemUpdate(response.count);
                this.applicationsComponent.pagination.totalItems = response.count;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    public SortApplications(listToSort: Array<Application>): Array<Application> {
        let sortedList: Array<Application>;
        sortedList = listToSort;
        if (this.applicationsComponent.sortColumn === "Name") {
            sortedList = listToSort.sort((n1, n2) => {
                if (this.applicationsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                    if (n1.name > n2.name) {
                        return 1;
                    }
                    if (n1.name < n2.name) {
                        return -1;
                    }
                } else {
                    if (n1.name < n2.name) {
                        return 1;
                    }
                    if (n1.name > n2.name) {
                        return -1;
                    }
                }
                return 0;
            });
        }

        return sortedList;
    }
}