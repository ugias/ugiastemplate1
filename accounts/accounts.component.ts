import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { AccountSummary, Pagination, Organisation, UserInfo, AccountStatus, AccountRole, GlobalRole } from "../../../models";
import { USERHOMECONSTANTS } from "../userHome.constants";
import { CurrentUserService } from "../../../services/shared";
import { AccountsService } from "./accounts.service";
import { UserHomeService } from "../userHome.service";
import { NgProgressService } from "ng2-progressbar";
import { CONFIGURATION } from "../../../app.constants";
import * as swal from "sweetalert2";
@Component({
    selector: "accounts-component",
    template: require("./accounts.component.html"),
    styles: [require("./accounts.component.less").toString()],
    providers: [AccountsService]
})

export class AccountsComponent implements OnInit {
    @Input() accountList: AccountSummary[];
    @Output() refreshList: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    isProcessing: boolean;
    accountsComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.ascOrderString,
        sortColumn: "Firstname",
        pagination: new Pagination(),
        accounts: new Array<AccountSummary>()
    };
    isDioceseUser: boolean;
    searchComponent = {
        keyword: "",
        organisationId: "",
        statusCode: "",
        roleCode: "",
        accountCode: ""
    };

    organisations: Organisation[];
    accountStatuses: AccountStatus[];
    roles: AccountRole[];
    globalRoles: GlobalRole[];
    userName: string;
    isRoleFilter: boolean;

    constructor(private pService: NgProgressService, private currentUserService: CurrentUserService, private netIdRouter: Router,
        private accountsService: AccountsService, private userHomeService: UserHomeService) {
        this.accountsComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
        this.searchComponent = {
            keyword: "",
            organisationId: "00000000-0000-0000-0000-000000000001",
            statusCode: "-1",
            roleCode: "-1",
            accountCode: "-1"
        };

        this.GetAccounts(this.currentUserService.userInfo.organisation);
    }

    public ngOnInit() {
        this.pService.start();
        // 
        this.GetOrganisations();
        this.GetAccountStatuses();
        this.GetRoles();
        this.GetGlobalRoles();
        this.isDioceseUser = this.currentUserService.token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanUser;
        this.pService.done();
        this.isRoleFilter = (this.currentUserService.token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin ||
            this.currentUserService.token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin ||
            this.currentUserService.token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanAdmin ||
            this.currentUserService.token.globalRoleCode === CONFIGURATION.globalRoles.netidDiocesanUser);
    }

    public PageChanged(currentPageObject) {
        this.pService.start();
        this.accountsComponent.pagination.currentPage = currentPageObject.page;
        let organisation = this.organisations.find(o => o.extOrganisationId === this.searchComponent.organisationId);
        this.GetAccounts(organisation);
        this.pService.done();
    }

    public SortIconClass(columnIndex): string {
        if (columnIndex === this.accountsComponent.sortColumnIndex) {
            if (this.accountsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                return USERHOMECONSTANTS.sorting.ascIconClass;
            } else {
                return USERHOMECONSTANTS.sorting.descIconClass;
            }
        } else {
            return "";
        }
    }

    public DeLink(accountOrganisationId: string, name: string, organisationName: string): void {
        this.pService.start();

        this.DelinkOrganisation(this.accountsService, accountOrganisationId, name, organisationName);
        let organisation = this.organisations.find(o => o.extOrganisationId === this.searchComponent.organisationId);
         this.GetAccounts(organisation);
        this.pService.done();
    }

    private DelinkOrganisation(accountsService: AccountsService, accountOrganisationId: string, name: string, organisationName: string): void {
        swal({
            title: "Delink " + name,
            text: "you are about to disassociate user from " + organisationName,
            type: "info",
            showCancelButton: true,
            confirmButtonText: "Ok"
        }).then(function () {

            accountsService.DelinkOrganisation(accountOrganisationId)
                .subscribe(
                response => {
                    swal({
                        title: "Delink " + name,
                        text: response,
                        type: "info",
                        showCancelButton: false,
                        confirmButtonText: "Ok"
                    })
                });
            (error) => {
                let parsedError = JSON.parse(error._body);
                if (parsedError) {
                    this.errorMessage = parsedError.message;
                }
            };
        }, function (dismiss) {
        });
    }

    public onSubmit(): void {
        this.pService.start();
        this.GetAccounts(this.searchComponent.organisationId);
        this.pService.done();
    }
    public Reset(): void {
        let organIdSelected = this.organisations[0].extOrganisationId;

        if (this.organisations.length > 1) {
            organIdSelected = "00000000-0000-0000-0000-000000000001";
        }

        this.searchComponent = {
            keyword: "",
            organisationId: organIdSelected,
            statusCode: "-1",
            roleCode: "-1",
            accountCode: "-1"
        };

        this.accountsComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };

        this.GetAccounts(this.currentUserService.userInfo.organisation);
    }
    public onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }
    public SortList(columnIndex: number) {
        if (columnIndex === this.accountsComponent.sortColumnIndex) {
            if (this.accountsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.accountsComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.accountsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.accountsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            switch (columnIndex) {
                case 1:
                    this.accountsComponent.sortColumn = "Firstname";
                    break;
                case 2:
                    this.accountsComponent.sortColumn = "Lastname";
                    break;
                case 3:
                    this.accountsComponent.sortColumn = "DioceseName";
                    break;
                case 4:
                    this.accountsComponent.sortColumn = "GlobalRoleCode";
                    break;
                case 5:
                    this.accountsComponent.sortColumn = "OrganisationName";
                    break;
                case 6:
                    this.accountsComponent.sortColumn = "PositionCode";
                    break;
                case 7:
                    this.accountsComponent.sortColumn = "FromDate";
                    break;
                case 8:
                    this.accountsComponent.sortColumn = "ToDate";
                    break;
                case 9:
                    this.accountsComponent.sortColumn = "OrganisationStatusCode";
                    break;

                default:
                    this.accountsComponent.sortColumn = "Firstname";
            }
        }

        this.accountsComponent.sortColumnIndex = columnIndex;
        let organisation = this.organisations.find(o => o.extOrganisationId === this.searchComponent.organisationId);
        this.pService.start();
        this.GetAccounts(organisation);
        this.pService.done();
    }

    public GetAccounts(selectedOrganisation): void {
        this.isProcessing = true;
        let odataUrl = this.BuildOdataUrl();
        this.accountsService
            .GetAccountsList(selectedOrganisation, this.accountsComponent.pagination, this.accountsComponent.sortOrder, this.accountsComponent.sortColumn, odataUrl)
            .map(response => response.json())
            .subscribe(
            response => {
                this.refreshList.emit(<AccountSummary[]>response.result);
                this.accountsComponent.pagination.totalItems = response.count; // get from the response 
                this.userHomeService.confirmTotalItemUpdate(response.count); // get from the response
            },
            (error) => {
                let parsedErrors = JSON.parse(error._body);
                if (parsedErrors) {
                    this.errorMessage = parsedErrors.message;
                    this.accountsComponent.accounts = [];
                }
            });

        this.isProcessing = false;
    }

    public GetAccountsListNames(accountSummaries: AccountSummary[]): void {
        this.accountsService
            .GetAccountsListNames(accountSummaries)
            .map(response => response.json())
            .subscribe(
            response => {
                this.refreshList.emit(<AccountSummary[]>response.result);
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }


    private GetAccountStatuses(): void {
        this.accountsService
            .GetAccountStatuses()
            .subscribe(
            (response: AccountStatus[]) => {
                this.accountStatuses = response;
                let allStatus = new AccountStatus();
                allStatus.code = "-1";
                allStatus.name = "ALL";
                allStatus.description = "All statues";
                this.accountStatuses.push(allStatus);
                this.searchComponent.statusCode = allStatus.code;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    private BuildOdataUrl(): string {

        let odataUrl = "";
        let filterSet = false;

        if (this.searchComponent.statusCode !== "-1" || this.searchComponent.roleCode !== "-1" || this.searchComponent.accountCode !== "-1"
            || this.searchComponent.organisationId !== "00000000-0000-0000-0000-000000000001" || this.searchComponent.keyword !== "") {
            odataUrl = "$filter=";
            if (this.searchComponent.keyword) {
                odataUrl += "(startswith(tolower(Firstname),'" + this.searchComponent.keyword.toLowerCase() + "') or startswith(tolower(Lastname),'" +
                    this.searchComponent.keyword.toLowerCase() + "') or startswith(tolower(DisplayName),'" + this.searchComponent.keyword.toLowerCase() + "')) ";

                filterSet = true;
            }

            if (this.searchComponent.statusCode !== "-1") {
                if (filterSet) {
                    odataUrl += "and (AccountStatusCode eq '" + this.searchComponent.statusCode + "')";
                }
                else {
                    odataUrl += "(AccountStatusCode eq '" + this.searchComponent.statusCode + "')";
                    filterSet = true;
                }
            }

            if (this.searchComponent.roleCode !== "-1") {
                if (filterSet) {
                    odataUrl += "and (RoleCode eq '" + this.searchComponent.roleCode + "')";
                }
                else {
                    odataUrl += "(RoleCode eq '" + this.searchComponent.roleCode + "')";
                    filterSet = true;
                }
            }

            if (this.searchComponent.organisationId !== "00000000-0000-0000-0000-000000000001") {
                if (filterSet) {
                    odataUrl += "and (ExtOrganisationId eq " + this.searchComponent.organisationId + ")";
                }
                else {
                    odataUrl += "(ExtOrganisationId eq " + this.searchComponent.organisationId + ")";
                    filterSet = true;
                }
            }

            if (this.searchComponent.accountCode !== "-1") {
                if (filterSet) {
                    odataUrl += "and (GlobalRoleCode eq '" + this.searchComponent.accountCode + "')";
                }
                else {
                    odataUrl += "(GlobalRoleCode eq '" + this.searchComponent.accountCode + "')";
                    filterSet = true;
                }
            }
        }


        if (odataUrl) {
            odataUrl += "&";
        }

        return odataUrl;
    }


    private GetGlobalRoles(): void {
        this.accountsService
            .GetGlobalRoles()
            .subscribe(
            (response: GlobalRole[]) => {
                this.globalRoles = response;
                let allRoles = new GlobalRole();
                allRoles.code = "-1";
                allRoles.name = "ALL";
                this.globalRoles.push(allRoles);
                this.searchComponent.accountCode = allRoles.code;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    private GetRoles(): void {
        this.accountsService
            .GetRoles()
            .subscribe(
            (response: AccountRole[]) => {
                this.roles = response;
                let allRoles = new AccountRole();
                allRoles.code = "-1";
                allRoles.name = "ALL";
                allRoles.description = "All roles";
                this.roles.push(allRoles);
                this.searchComponent.roleCode = allRoles.code;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    private GetOrganisations(): void {
        this.accountsService
            .GetOrganisations()
            .subscribe(
            (response: Organisation[]) => {
                this.organisations = response;

                if (this.organisations.length > 1 || this.currentUserService.token.globalRoleCode !== CONFIGURATION.globalRoles.netidUser) {
                    let organisation = new Organisation();
                    organisation.extOrganisationId = "00000000-0000-0000-0000-000000000001";
                    organisation.name = "ALL";
                    this.organisations.push(organisation);
                    this.searchComponent.organisationId = organisation.extOrganisationId;
                }
                else {
                    this.searchComponent.organisationId = this.organisations[0].extOrganisationId;
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