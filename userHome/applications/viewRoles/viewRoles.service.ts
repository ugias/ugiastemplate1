import { Injectable } from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION } from "../../../../app.constants";
import { ApplicationClaim, AccountApplicationClaim, Pagination }
    from "../../../../models";
import { Observable } from "rxjs/Observable";
import { HttpDataService } from "../../../../services/shared";

@Injectable()
export class ViewUserRolesService {

    constructor(private httpData: HttpDataService) { }


    public GetApplicationClaimsByAccountOrganisationId(externalOrganisationId, applicationId, accountOrganisationId) {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}account/searchapplicationclaims/${externalOrganisationId}/${applicationId}/?$filter=AccountOrganisationId eq ${accountOrganisationId}`;
        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetAccountApplicationClaims(externalOrganisationId: string, applicationId: string, pagination: Pagination, sortOrder: string, sortColumn: string): Observable<Response> {
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}account/SearchClaimsForMyOrganisation/${externalOrganisationId}/${applicationId}?$skip=${skip}&$top=${pagination.itemsPerPage}&$count=true${order}`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public SubmitAccountApplicationClaims(accountApplicationClaims: AccountApplicationClaim[]): Observable<boolean> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}account/processaccountapplicationclaims`;
        return Observable.create((observer) => {
            this.httpData.post(dataUrl, JSON.stringify(accountApplicationClaims))
                .map(response => <boolean>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetApplicationClaims(applicationId): Observable<ApplicationClaim[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}application/getapplicationclaims/${applicationId}`;
        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <ApplicationClaim[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
