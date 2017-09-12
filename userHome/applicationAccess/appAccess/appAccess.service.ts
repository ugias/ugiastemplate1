import { Injectable }                                   from "@angular/core";
import { Headers, RequestOptions, Response }            from "@angular/http";
import { CONFIGURATION }                                from "../../../../app.constants";
import { ApplicationStatus, Application }               from "../../../../models";
import { Observable }                                   from "rxjs/Observable";
import { HttpDataService }                              from "../../../../services/shared";
import * as swal                                        from "sweetalert2";
@Injectable()
export class AppAcessService {

    constructor(private httpData: HttpDataService) {
    }
    public Add(application: Application): Observable<Application> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "application", JSON.stringify(application))
                .map(response => <Application>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public Update(application: Application): Observable<Application> {
        return Observable.create((observer) => {
            this.httpData.put(CONFIGURATION.baseUrls.apiUrl + "application", JSON.stringify(application))
                .map(response => <Application>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

}
