import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../app.constants";
import { Task, Pagination, User }            from "../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../services/shared";

@Injectable()
export class UserDetailsService {
    // private userDetailsUpdate = new Subject<User>();

    constructor(private httpData: HttpDataService) { }

    public GetUserDetails(id: string): Observable<User> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}account/GetUserAsAdmin/${id}`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <User>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

public GetAllMyOrganisations(userId: string): Observable<User> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}GetAllMyOrganisations?userId=${userId}`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <User>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
