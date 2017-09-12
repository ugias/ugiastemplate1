import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { User, Diocese, Organisation, JobTitle, AccountRole }
from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class UserOrganisationInfoService {

    constructor(private httpData: HttpDataService) { }
    public GetDioceseList(): Observable<Diocese[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "v1/EF/SearchDiocese?$orderby=DioceseName asc")
                .map(response => <Diocese[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetOrganisationsByDiocese(diocesePublicId: string): Observable<Organisation[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "v1/EF/GetDiocese/" + diocesePublicId)
                .map(response => <Organisation[]>response.json().result.organisations)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetOrganisationsByDioceseId(dioceseId: number): Observable<Organisation[]> {
        let select: string = "$select=PublicId,Name,LocationSuburb,LocationPostCode,ExternalId";
        let filter: string = `&$filter=DioceseId eq ${dioceseId} and IsActive eq true`;
        let order: string = "&$orderby=ExternalId asc";
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "v1/EF/SearchOrganisation?" + select + filter + order;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <Organisation[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetOrganisationByExtOrganisationId(extOrganisationId: string, userId: string): Observable<Organisation> {
        let dataUrl = CONFIGURATION.baseUrls.apiUrl + "organisation?extOrganisationId=" + extOrganisationId + "&userId=" + userId;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <Organisation>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetJobTitles(): Observable<JobTitle[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}common/getpositions`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <JobTitle[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetRoles(): Observable<AccountRole[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/GetRoles")
                .map(response => <AccountRole[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public Add(organisation: Organisation): Observable<Organisation> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "organisation", JSON.stringify(organisation))
                .map(response => <Organisation>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public Update(organisation: Organisation): Observable<Organisation> {
        return Observable.create((observer) => {
            this.httpData.put(CONFIGURATION.baseUrls.apiUrl + "organisation", JSON.stringify(organisation))
                .map(response => <Organisation>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

}
