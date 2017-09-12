import { Injectable }                                                                                           from "@angular/core";
import { Headers, RequestOptions, Response }                                                                    from "@angular/http";
import { CONFIGURATION }                                                                                        from "../../../app.constants";
import { Task, Pagination, ApplicationClaim, Application, ApplicationStatus}                                    from "../../../models";
import { Observable }                                                                                           from "rxjs/Observable";
import { Subject }                                                                                              from "rxjs/Subject";
import { HttpDataService }                                                                                      from "../../../services/shared";

@Injectable()
export class ApplicationAccessService {
    private applicationClaimsPublish = new Subject<ApplicationClaim[]>();
    applicationClaimsPublishConfirmed$ = this.applicationClaimsPublish.asObservable();

    constructor(private httpData: HttpDataService) { }

    public GetApplicationList(pagination: Pagination, sortOrder: string, sortColumn: string): Observable<Response> {
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "application/search?$skip=" + skip + "&$top=" + pagination.itemsPerPage + "&$count=true" + order;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetApplication(applicationID: string): Observable<Application> {
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "application/search?$filter= Id eq " + applicationID;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <Application>response.json().result)
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

    public ConfirmApplicationClaimsPublish(applicationClaims: ApplicationClaim[]) {
        this.applicationClaimsPublish.next(applicationClaims);
    }

    public ApplicationAccess(applicationId: string): Observable<boolean> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}application/SaveApplicationAccess/${applicationId}`;
        return Observable.create((observer) => {
            this.httpData.post(dataUrl, "")
                .map(response => <boolean>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
