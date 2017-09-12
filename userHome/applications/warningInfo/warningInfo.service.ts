import { Injectable } from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION } from "../../../../app.constants";
import { ApplicationSummary, Pagination} from "../../../../models";
import { Observable } from "rxjs/Observable";
import { HttpDataService, CurrentUserService} from "../../../../services/shared";

@Injectable()
export class WarningInfoService {
    constructor(private httpData: HttpDataService) { }

    public GetApplicationList(pagination: Pagination, sortOrder: string, sortColumn: string, filter: string): Observable<Response> {
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
}