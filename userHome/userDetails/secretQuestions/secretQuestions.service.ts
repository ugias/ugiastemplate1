import { Injectable }                        from "@angular/core";
import { Headers, RequestOptions, Response } from "@angular/http";
import { CONFIGURATION }                     from "../../../../app.constants";
import { Task, SecretQuestion, User, UserSecretQuestionInfo }
from "../../../../models";
import { Observable }                        from "rxjs/Observable";
import { HttpDataService }                   from "../../../../services/shared";

@Injectable()
export class SecretQuestionsService {

    constructor(private httpData: HttpDataService) { }

    public GetSecretQuestions(): Observable<SecretQuestion[]> {
        let dataUrl = `${CONFIGURATION.baseUrls.apiUrl}common/getsecretquestions`;

        return Observable.create((observer) => {
            this.httpData.get(dataUrl)
                .map(response => <SecretQuestion[]>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

    public Update(userSecretQuestionInfo: UserSecretQuestionInfo): Observable<User> {
        return Observable.create((observer) => {
            this.httpData.post(CONFIGURATION.baseUrls.apiUrl + "account/UpdateSecretQuestions", JSON.stringify(userSecretQuestionInfo))
                .map(response => <User>response.json().result)
                .subscribe((userData) => {
                    observer.next(userData);
                }, (error) => observer.error(error),
                () => observer.complete());
        });
    }

}
