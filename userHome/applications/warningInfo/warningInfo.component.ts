import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Observable } from "rxjs/Observable";
import { ApplicationSummary, Pagination, Organisation, UserInfo } from "../../../../models";
import { USERHOMECONSTANTS } from "../../userHome.constants";
import { WarningInfoService } from "./WarningInfo.service";
import { ApplicationService } from "./../applications.service";
import {NgProgressService} from "ng2-progressbar";

@Component({
    selector: "warningInfo-component",
    template: require("./warningInfo.component.html"),
    styles: [require("./warningInfo.component.less").toString()],
    providers: [WarningInfoService]
})

export class WarningInfoComponent implements OnInit {
    @Input() applications: ApplicationSummary[];
    @Output() refresh: EventEmitter<any> = new EventEmitter();
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

    constructor(private pService: NgProgressService, private netIdRouter: Router, private warningInfoService: WarningInfoService, private applicationService: ApplicationService) {
        this.applicationsComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
    }

    public ngOnInit() {
        this.pService.start();
        this.GetApplications();
        this.pService.done();
    }

    public PageChanged(currentPageObject) {
        this.pService.start();
        this.applicationsComponent.pagination.currentPage = currentPageObject.page;
        this.GetApplications();
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

    public SortList(columnIndex: number) {
       
        if (columnIndex === this.applicationsComponent.sortColumnIndex) {
            if (this.applicationsComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.applicationsComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            if (columnIndex === 1) {
                this.applicationsComponent.sortColumn = "ApplicationName";
            }
            else {
                this.applicationsComponent.sortColumn = "Notification";
            }
        }
        this.applicationsComponent.sortColumnIndex = columnIndex;
        this.pService.start();
        this.GetApplications();
        this.pService.done();
    }

    public GetApplications(): void {
        let odataUrl = "$filter=ApplicationStatusCode eq 'InActive'&";
        this.warningInfoService
            .GetApplicationList(this.applicationsComponent.pagination, this.applicationsComponent.sortOrder, this.applicationsComponent.sortColumn, odataUrl)
            .map(response => response.json())
            .subscribe(
            response => {
                this.applicationService.confirmTotalItemUpdate(response.count);
                this.applicationsComponent.pagination.totalItems = response.count;
                this.refresh.emit(<ApplicationSummary[]>response.result);
            },
            (error) => {
                let parsedErrors = JSON.parse(error._body);
                if (parsedErrors) {
                    this.errorMessage = parsedErrors.message;
                }
            });
    }
}
