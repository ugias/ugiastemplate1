import { Injectable }                                   from "@angular/core";
import { Headers, RequestOptions, Response }            from "@angular/http";
import { Subject }                                      from "rxjs/Subject";
import { CONFIGURATION }                                from "../../app.constants";
import { Observable }                                   from "rxjs/Observable";
import { HttpDataService, CurrentUserService }          from "../../services/shared";
import { User, UserInfo, ApplicationClaimStatus, ApplicationStatus, Organisation}        from "../../models";

@Injectable()
export class UserHomeService {
    public totalTasks: number;
    private totalItemsUpdate = new Subject<number>();
    private userDetailsUpdate = new Subject<User>();

    constructor(private httpData: HttpDataService, private currentUserService: CurrentUserService) {
        this.totalTasks = 0;
    }

    updateConfirmed$ = this.totalItemsUpdate.asObservable();
    updateUserDetailsConfirmed$ = this.userDetailsUpdate.asObservable();

    public confirmTotalItemUpdate(totalTasks: number) {
        this.totalItemsUpdate.next(totalTasks);
    }
    public userDetailsUpdateConfirm(user: User) {
        this.userDetailsUpdate.next(user);
    }

    public GetApplicationStatuses(): Observable<ApplicationStatus[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/GetApplicationStatuses")
                .map(response => <ApplicationStatus[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetApplicationClaimStatuses(): Observable<ApplicationClaimStatus[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/GetApplicationClaimStatuses")
                .map(response => <ApplicationClaimStatus[]>response.json().result)
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
}

