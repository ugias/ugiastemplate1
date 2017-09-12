import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { AccountRole, ApplicationClaim, RoleApplicationClaim }
                                             from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class AssignGroupRolesService {

    constructor(private httpData: HttpDataService) { }

    public GetOrganisationRoles(): Observable<AccountRole[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/getroles")
                .map(response => <AccountRole[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public SubmitGroupApplicationClaims(roleApplicationClaim: RoleApplicationClaim): Observable<boolean> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}application/SaveApplicationClaims`;
        return Observable.create((observer) => {
            this.httpData.post(dataUrl, JSON.stringify(roleApplicationClaim))
                .map(response => <boolean>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    // public GetApplicationClaims(applicationId): Observable<ApplicationClaim[]> {
    //     let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}application/getapplicationclaims/${applicationId}`;
    //     return Observable.create((observer) => {
    //         this.httpData.get(dataUrl)
    //             .map(response => <ApplicationClaim[]>response.json().result)
    //             .subscribe((userData) => {
    //                 observer.next(userData);
    //             }, (error) => observer.error(error),
    //             () => observer.complete());
    //     });
    // }

    // public Update(userInfo: UserAccountInfo): Observable<User> {
    //     return Observable.create((observer) => {
    //         this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "account/UpdateAccountInfo", JSON.stringify(userInfo))
    //             .map(response => <User>response.json().result)
    //             .subscribe((userData) => {
    //                 observer.next(userData);
    //             }, (error) => observer.error(error),
    //             () => observer.complete());
    //     });
    // }

}
