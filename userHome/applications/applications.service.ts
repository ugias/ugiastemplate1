import { Injectable }                                                       from "@angular/core";
import { Headers, RequestOptions, Response }                                from "@angular/http";
import { Subject }                                                          from "rxjs/Subject";
import { Observable }                                                       from "rxjs/Observable";
import { HttpDataService }                                                  from "../../../services/shared";
import { CONFIGURATION }                                                    from "../../../app.constants";
import { ApplicationSummary, Pagination, Organisation, ApplicationStatus, ApplicationClaim }  from "../../../models";
@Injectable()
export class ApplicationService {
    private totalItemsUpdate = new Subject<number>();

    constructor(private httpData: HttpDataService) {
    }

    updateConfirmed$ = this.totalItemsUpdate.asObservable();

    public confirmTotalItemUpdate(totalItems: number) {
        this.totalItemsUpdate.next(totalItems);
    }

    public GetApplicationList(pagination: Pagination, sortOrder: string, sortColumn: string, filter: string ): Observable<Response> {
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "application/mysearch?" + filter + "$skip=" + skip + "&$top=" + pagination.itemsPerPage + "&$count=true" + order;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
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
