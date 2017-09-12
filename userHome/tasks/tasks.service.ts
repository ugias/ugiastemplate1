import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../app.constants";
import { Task, Pagination }                  from "../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../services/shared";

@Injectable()
export class TasksService {

    constructor(private httpData: HttpDataService) { }

    public GetTasksList(pagination: Pagination, sortOrder: string, sortColumn: string): Observable<Response> {
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "task/search?" + "$skip=" + skip + "&$top=" + pagination.itemsPerPage + "&$count=true" + order;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
