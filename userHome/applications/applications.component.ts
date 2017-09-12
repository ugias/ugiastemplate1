import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import * as moment from "moment";
import { ApplicationSummary, Pagination, Organisation, UserInfo, ApplicationClaim } from "../../../models";
import { CONFIGURATION } from "../../../app.constants";
import { USERHOMECONSTANTS } from "../userHome.constants";
import { CurrentUserService } from "../../../services/shared";
import { ApplicationService } from "./applications.service";

@Component({
    selector: "applications-component",
    template: require("./applications.component.html"),
    styles: [require("./applications.component.less").toString()],
    providers: [ApplicationService]
})


export class ApplicationComponent implements OnDestroy, OnInit {
    @Output() reloadMyhome: EventEmitter<any> = new EventEmitter();
    subscriber: Subscription;
    errorMessage: string;
    activeTabId: number = 0;
    tabTitle: string;
    totalCount: string;
    isAdministrator: boolean;
    accountOrganisationId: string;
    applicationClaimListObservable: Observable<ApplicationClaim[]>;
    appInfo = new Array<ApplicationSummary>();
    appWarningInfo = new Array<ApplicationSummary>();
    appInfoOrganisations = new Array<Organisation>();
    constructor(private netIdRouter: Router, private applicationService: ApplicationService, private currentUserService: CurrentUserService) {

        this.subscriber = applicationService.updateConfirmed$.subscribe(
            totalItems => {
                this.totalCount = " (" + totalItems + ")";
            });
    }
    public ngOnInit(): void {
        if (this.currentUserService.token) {
            this.isAdministrator = (this.currentUserService.token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator);
            if (!this.currentUserService.userInfo) {
                this.accountOrganisationId = this.currentUserService.userInfo.organisation.accountOrganisationId;
            }
        }
    }

    public setCurrentTab(tabIndex: number): void {
        if (tabIndex === 2) {
            this.applicationClaimListObservable = this.applicationService.GetApplicationClaims(this.appInfo[0].applicationId);
            this.accountOrganisationId = this.currentUserService.userInfo.organisation.accountOrganisationId;
        }
        this.activeTabId = tabIndex;
    };

    public ngOnDestroy(): void {
        this.subscriber.unsubscribe();
    }
    public onRedirect(tabIndex: number): void {
        this.setCurrentTab(tabIndex);
    }

    public onRefreshAppInfo(applications: ApplicationSummary[]): void {
        this.appInfo = applications;
        this.isAdministrator = (this.currentUserService.userInfo.organisation.roleCode === CONFIGURATION.organisationRoles.administrator);
    }

    public onRefreshWarningInfo(applications: ApplicationSummary[]): void {
        this.appWarningInfo = applications;
    }

    public onRefreshClaims(applications: ApplicationSummary[]): void {
        this.appWarningInfo = applications;
    }

    public onRefreshAppInfoOrganisations(organisations: Organisation[]): void {
        this.appInfoOrganisations = organisations;
    }

    public onReloadMyhome(): void {
        this.reloadMyhome.emit();
    }
}