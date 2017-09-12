import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../app.constants";
import { USERHOMECONSTANTS }                from "../userHome.constants";
import { Task, Pagination }                  from "../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../services/shared";

@Injectable()
export class MessagesService {

    constructor(private httpData: HttpDataService) { }

    public GetMessageList(userId: string, pagination: Pagination, sortOrder: string, sortColumn: string, includeRead: boolean): Observable<Response> {
        let filter = "";
        if (includeRead === false) {
            filter = `&$filter=MessageStatusCode eq '${USERHOMECONSTANTS.messageStatus.unread}'`;
        }
        let order: string = "&$orderby=" + sortColumn + " " + sortOrder;
        let skip: any = (pagination.currentPage - 1) * pagination.itemsPerPage;
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}message/SearchByUserId?userId=${userId}&$skip=${skip}&$top=${pagination.itemsPerPage}&$count=true${filter}${order}`;
        //     let dataUrl = CONFIGURATION.baseUrls.apiUrl + "message/search?" + "$skip=" + skip + "&$top=" + pagination.itemsPerPage + "&$count=true" + filter + order;        
        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }
}
