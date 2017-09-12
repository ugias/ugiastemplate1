import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { Task, Pagination, User, UserContactInfo }            from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class UserContactInfoService {

    constructor(private httpData: HttpDataService) { }

    public Update(contactInfo: UserContactInfo): Observable<User> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "account/UpdateContactInfo", JSON.stringify(contactInfo))
                .map(response => <User>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    // public GetUserDetails(userId: string): Observable<User> {
    //     let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}account?userId=${userId}`;

    //     return Observable.create((observer) => {
    //         this.httpData.get(dataUrl)
    //             .map(response => <User>response.json().result)
    //             .subscribe((userData) => {
    //                 observer.next(userData);
    //             }, (error) => observer.error(error),
    //             () => observer.complete());
    //     });
    // }
}
