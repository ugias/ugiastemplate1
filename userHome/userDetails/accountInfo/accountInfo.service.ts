import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { Task, Pagination, User, UserAccountInfo, AccountStatus, GlobalRole, DisableReason }
                                             from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class UserAccountInfoService {

    constructor(private httpData: HttpDataService) { }

    public GetAccountStatuses(): Observable<AccountStatus[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}common/getaccountstatuses`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <AccountStatus[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetGlobalRoles(): Observable<GlobalRole[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}common/getglobalroles`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <GlobalRole[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetDisableReasons(): Observable<DisableReason[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}common/getdisablereasons`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <DisableReason[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public Update(userInfo: UserAccountInfo): Observable<User> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "account/UpdateAccountInfo", JSON.stringify(userInfo))
                .map(response => <User>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

}
