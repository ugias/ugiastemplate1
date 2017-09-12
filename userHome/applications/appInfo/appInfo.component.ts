import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { ApplicationSummary, Pagination, Organisation, UserInfo } from "../../../../models";
import { USERHOMECONSTANTS } from "../../userHome.constants";
import { CurrentUserService, UserAuthenticationService } from "../../../../services/shared";
import { AppInfoService } from "./appInfo.service";
import { ApplicationService } from "./../applications.service";
import {NgProgressService} from "ng2-progressbar";

@Component({
    selector: "appInfo-component",
    template: require("./appInfo.component.html"),
    styles: [require("./appInfo.component.less").toString()],
    providers: [AppInfoService]
})

export class AppInfoComponent implements OnInit {
    @Input() applications: ApplicationSummary[];
    @Input() organisations: Organisation[];
    @Output() refreshApps: EventEmitter<any> = new EventEmitter();
    @Output() refreshOrgans: EventEmitter<any> = new EventEmitter();
    @Output() redirect: EventEmitter<any> = new EventEmitter();
    @Output() reloadMyhome: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    selectedOrganisationId: string;
    position: string;
    role: string;
    email: string;
    applicationsComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.ascOrderString,
        sortColumn: "ApplicationName",
        pagination: new Pagination()
    };

    constructor(private pService: NgProgressService, private currentUserService: CurrentUserService, private netIdRouter: Router,
        private applicationService: ApplicationService, private userAuthService: UserAuthenticationService, private appInfoService: AppInfoService) {
        this.applicationsComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
    }

    public ngOnInit() {
        this.pService.start();
        if (this.currentUserService.token) {
            this.GetApplications(this.currentUserService.userInfo.organisation);
            this.GetOrganisations();
        }
        this.pService.done();
    }

    public PageChanged(currentPageObject) {
        this.pService.start();
        this.applicationsComponent.pagination.currentPage = currentPageObject.page;
        let organisation = this.organisations.find(o => o.extOrganisationId === this.selectedOrganisationId);
        this.GetApplications(organisation);
        this.pService.done();
    }

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

    public OnAppWarning(): void {
        this.redirect.emit(1);
    }

    public OnAppClick(url: string): void {
        if (url.indexOf("elearning") !== -1) {
            this.appInfoService.GetGetElearningUrl()
                .subscribe(appUrl => {
                    this.netIdRouter.navigate(["/"]).then(result => { window.location.href = appUrl; });
                });
        } else {
            this.netIdRouter.navigate(["/"]).then(result => { window.location.href = url; });
        }
    }

    public OnAppNameClick(applicationId: string, url: string): void {
        let natWindow = window.open();
        if (url.indexOf("elearning") !== -1) {
            this.appInfoService.GetGetElearningUrl()
                .subscribe(appUrl => {
                    //natWindow.open(appUrl);
                    natWindow.location.href = appUrl;
                });
        } else {
            this.appInfoService.GetClientApplicationToken(applicationId)
                .subscribe(token => {
                    let appUrl = url.indexOf("?") !== -1 ? `${url}&q=${token}` : `${url}?q=${token}`;
                    //natWindow.open(appUrl);
                    natWindow.location.href = appUrl;
                });
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
                    this.applicationsComponent.sortColumn = "ApplicationName";
                    break;
                case 2:
                    this.applicationsComponent.sortColumn = "Roles";
                    break;
                case 3:
                    this.applicationsComponent.sortColumn = "FromDate";
                    break;
                case 3:
                    this.applicationsComponent.sortColumn = "ToDate";
                    break;
                default:
                    this.applicationsComponent.sortColumn = "ApplicationName";
            }
        }
        this.pService.start();
        this.applicationsComponent.sortColumnIndex = columnIndex;
        let organisation = this.organisations.find(o => o.extOrganisationId === this.selectedOrganisationId);
        this.GetApplications(organisation);
        this.pService.done();

    }

    public OrganisationChange(selectedOrganisation): void {

        // Refresh user access token
        this.userAuthService
            .ResetAccessToken(selectedOrganisation)
            .subscribe(
            (response) => {

                let organFound = this.organisations.find(o => o.extOrganisationId === selectedOrganisation);

                let userInfo = this.currentUserService.userInfo;
                userInfo.organisation = organFound;
                this.selectedOrganisationId = organFound.extOrganisationId;
                this.role = organFound.roleCode;
                this.position = organFound.jobTitle;
                this.email = organFound.email;
                this.applicationsComponent.pagination.currentPage = USERHOMECONSTANTS.pagination.currentPage;
                this.currentUserService.userInfo = userInfo;
                this.GetApplications(organFound);
                this.reloadMyhome.emit();
            },
            (error) => {
                this.errorMessage = JSON.parse(error._body).error_description;
            });
    }

    private BuildOdataUrl(selectedOrganisation): string {

        let odataUrl = "";
        // return only active applications
        if (!selectedOrganisation === undefined) {
            let odataUrl = `$filter=(ExtOrganisationId eq ${this.selectedOrganisationId} and ApplicationStatusCode eq 'Active')&`;
        }

        return odataUrl;
    }

    public GetApplications(selectedOrganisation): void {
        let odataUrl = this.BuildOdataUrl(selectedOrganisation);
        this.applicationService
            .GetApplicationList(this.applicationsComponent.pagination, this.applicationsComponent.sortOrder, this.applicationsComponent.sortColumn, odataUrl)
            .map(response => response.json())
            .subscribe(
            response => {
                this.applicationService.confirmTotalItemUpdate(response.count);
                this.applicationsComponent.pagination.totalItems = response.count;
                this.refreshApps.emit(<ApplicationSummary[]>response.result);
            },
            (error) => {
                let parsedErrors = JSON.parse(error._body);
                if (parsedErrors) {
                    this.errorMessage = parsedErrors.message;
                }
            });
    }

    private GetOrganisations(): void {
        this.applicationService
            .GetOrganisations()
            .subscribe(
            (response: Organisation[]) => {
                this.refreshOrgans.emit(response);
                if (!this.selectedOrganisationId) {
                    if (!this.currentUserService.userInfo.organisation) {
                        let organ = response.find(o => o.isMain === true);
                        this.selectedOrganisationId = organ.extOrganisationId;
                        this.role = organ.roleCode;
                        this.position = organ.jobTitle;
                        this.email = organ.email;
                        let userInfo = new UserInfo();
                        userInfo.organisation = new Organisation();
                        userInfo.organisation = organ;
                        this.currentUserService.userInfo = userInfo;
                    }
                    else {
                        this.selectedOrganisationId = this.currentUserService.userInfo.organisation.extOrganisationId;
                        this.role = this.currentUserService.userInfo.organisation.roleCode;
                        this.position = this.currentUserService.userInfo.organisation.jobTitle;
                        this.email = this.currentUserService.userInfo.organisation.email;
                    }
                }
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }
}