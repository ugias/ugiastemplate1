import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { UserHomeService } from "./userHome.service";
import { USERHOMECONSTANTS } from "./userHome.constants";
import { CONFIGURATION } from "../../app.constants";
import {
    Token, User, Organisation, Task, Pagination, Application, Message,
    AccountSummary, ApplicationStatus, ApplicationClaimStatus, UserInfo
}
    from "../../models";
import { UserAuthenticationService, CurrentUserService } from "../../services/shared";

@Component({
    template: require("./userHome.component.html"),
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [require("./userHome.component.less").toString()],
    providers: [UserHomeService]
})

export class UserHomeComponent implements OnDestroy {
    subscriber: Subscription;
    updateUserSubscriber: Subscription;
    activeTabId: number = 0;
    tabTitle: string;
    totalCount: string;
    activeMessages = { messages: [], totalMessages: 2 };
    errorMessage: string;
    errors: Error[];
    isProcessing: boolean;
    impersonatingUser: string;
    activeUserDetails = new User();
    activeTasksList = new Array<Task>();
    activeMessageList = new Array<Message>();
    activeAccountList = new Array<AccountSummary>();
    applicationAccessList = new Array<Application>();
    applicationClaimStatuses: Observable<ApplicationClaimStatus[]>;
    applicationStatuses: Observable<ApplicationStatus[]>;
    application: Application;
    isOrganisationAdmin: boolean;
    hasMessageViewPermission: boolean = false;

    constructor(private currentUserService: CurrentUserService, private userAuthService: UserAuthenticationService,
        private userHomeService: UserHomeService, private cecRouter: Router,
        private cecActivatedRoute: ActivatedRoute) {
        this.isProcessing = false;
        this.errorMessage = "";
        this.impersonatingUser = "";
        this.isOrganisationAdmin = true;
        this.subscriber = userHomeService.updateConfirmed$.subscribe(
            totalItems => {
                this.totalCount = " (" + totalItems + ")";
            });

        this.updateUserSubscriber = userHomeService.updateUserDetailsConfirmed$.subscribe(
            user => {this.activeUserDetails = user;});
    }

    // region: Event handlers

    ngOnInit() {
        try {
            if (!this.userAuthService.isAuthenticated) {
                this.cecRouter.navigate(["/login"]);
                return;
            }
        } catch (e) {
            this.cecRouter.navigate(["/error"]);
            return;
        }
        let token = this.currentUserService.token;
        this.tabTitle = USERHOMECONSTANTS.tabs.applications;
        let tabId = +this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.tabId];
        let userId = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId];
        if (tabId) {
            this.activeTabId = tabId;
        }
        if (userId) {
            this.impersonatingUser = userId;
        } else {
            this.impersonatingUser = "";
        }

        this.isOrganisationAdmin = this.currentUserService.token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator || (
            this.currentUserService.token.globalRoleCode !== CONFIGURATION.globalRoles.netidUser && this.currentUserService.token.globalRoleCode !== CONFIGURATION.globalRoles.netidDiocesanUser);

        if (token) {
            this.hasMessageViewPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin;
        };
    }

    onReloadMyhome() {
        this.isOrganisationAdmin = this.currentUserService.token.organisationRoleCode === CONFIGURATION.organisationRoles.administrator || (
            this.currentUserService.token.globalRoleCode !== CONFIGURATION.globalRoles.netidUser && this.currentUserService.token.globalRoleCode !== CONFIGURATION.globalRoles.netidDiocesanUser);
    }
    onCancelImpersonation() {
        this.cecRouter.navigate(["/home"]);
    }

    onRefreshTaskList(tasks) {
        this.activeTasksList = tasks;
    }

    onRefreshMessageList(messages) {
        this.activeMessageList = messages;
    }

    onRefreshUserDetails(activeUser) {
        this.activeUserDetails = activeUser;
    }
    onRefreshApplication(application) {
        this.application = application;
    }

    onRefreshAccountList(accountSummary) {
        this.activeAccountList = accountSummary;
    }


    public GetApplicationStatus(): void {

        this.applicationStatuses = this.userHomeService.GetApplicationStatuses();
    }

    public GetApplicationClaimStatuses(): void {
        this.applicationClaimStatuses = this.userHomeService.GetApplicationClaimStatuses();
    }

    public onRefreshApplicationAccessList(applications) {
        this.GetApplicationClaimStatuses();
        this.GetApplicationStatus();
        this.applicationAccessList = applications;
    }

    ngOnDestroy() {
        this.subscriber.unsubscribe();
        this.updateUserSubscriber.unsubscribe();
    }

    // endregion: Event handlers

    public setCurrentTab(tabIndex: number): void {
        if (tabIndex === 5) {
            this.GetApplicationClaimStatuses();
            this.GetApplicationStatus();
        }
        this.activeTabId = tabIndex;
    };

}

