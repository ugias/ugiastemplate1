import { Injectable } from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION } from "../../app.constants";
import { User, Diocese, Organisation, SecretQuestion, JobTitle } from "../../models";
import { Observable } from "rxjs/Observable";
import { HttpDataService } from "../../services/shared";

@Injectable()
export class RegistrationService {

    constructor(private httpData: HttpDataService) { }

    public Save(user: User): Observable<User> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "account", JSON.stringify(user))
                .map(response => <User>response.json())
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

    // TODO: Get it from common data service
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

    public GetOrganisationsByDioceseId(dioceseId: string): Observable<Organisation[]> {
        let select: string = "$select=PublicId,Name,LocationSuburb,LocationPostCode,ExternalId,IsDioceseOffice";
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

    public GetSecretQuestions(): Observable<SecretQuestion[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/getsecretquestions")
                .map(response => <SecretQuestion[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetAccountGetSecretQuestions(): Observable<SecretQuestion[]> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "common/getsecretquestions")
                .map(response => <SecretQuestion[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public GetUserIdForNewAccount(firstName, lastName, dateOfBirth): Observable<string> {
        return Observable.create((observer) => {
            this.httpData.get(CONFIGURATION.baseUrls.apiUrl + "account/getuserid?firstName=" + firstName + "&lastName=" + lastName + "&dateOfBirth=" + dateOfBirth)
                .map(response => <string>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

}
