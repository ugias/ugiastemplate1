import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { Task, Pagination, LostCredentials }            from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class UserLoginInfoService {

    constructor(private httpData: HttpDataService) { }

     public Save(lostCredentials: LostCredentials): Observable<LostCredentials> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "Recovery/ChangeCurrentPassword", JSON.stringify(lostCredentials))
                .map(response => <LostCredentials>response.json())
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
