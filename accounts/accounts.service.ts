import { Injectable } from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION } from "../../../app.constants";
import { Pagination, Organisation, AccountStatus, AccountRole, AccountSummary, GlobalRole } from "../../../models";
import { Observable } from "rxjs/Observable";
import { HttpDataService, CurrentUserService } from "../../../services/shared";

@Injectable()
export class AccountsService {

    constructor(private httpData: HttpDataService) { }

    public GetAccountsList(organisation: Organisation, pagination: Pagination, sortOrder: string, sortColumn: string, filter: string): Observable<Response> {
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "account/Search?" + filter + "$skip=" + skip + "&$top=" + pagination.itemsPerPage + "&$count=true" + order;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetAccountsListNames(accountSummaries: AccountSummary[]): Observable<Response> {
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "Organisation/GetEfOrganisations?";

        return Observable.create((observer) => {
            this.httpData.post(dataUrl, JSON.stringify(accountSummaries))
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetAccountStatuses(): Observable<AccountStatus[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/GetAccountStatuses")
                .map(response => <AccountStatus[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetGlobalRoles(): Observable<GlobalRole[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "account/GetGlobalRole")
                .map(response => <GlobalRole[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetRoles(): Observable<AccountRole[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/GetRoles")
                .map(response => <AccountRole[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetOrganisations(): Observable<Organisation[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "organisation/GetCurrentOrganisations")
                .map(response => <Organisation[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public DelinkOrganisation(id: string): Observable<string> {
        return Observable.create((observer) => {
              let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}organisation/delete?accountOrganisationId=` + id;

            this.httpData.delete(dataUrl)
                .map(response => <Organisation[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
