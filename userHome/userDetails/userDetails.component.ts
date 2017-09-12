import { Component, OnInit, Input, Output, EventEmitter}
from "@angular/core";
import { Router, ActivatedRoute }       from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Subscription }                 from "rxjs/Subscription";
import { Token, User, Pagination, Organisation }
from "../../../models";
import { CurrentUserService }    from "../../../services/shared";
import { USERHOMECONSTANTS }            from "../userHome.constants";
import { UserHomeService }              from "../userHome.service";
import { StaticUserDataService }        from "../../../services/staticUserData.service";
import { UserDetailsService }           from "./userDetails.service";
import {NgProgressService} from "ng2-progressbar";
const _ = require("underscore");

@Component({
    selector: "userDetails-component",
    template: require("./userDetails.component.html"),
    styles: [require("./userDetails.component.less").toString()],
    providers: [StaticUserDataService, UserDetailsService]
})

export class UserDetailsComponent implements OnInit {
    @Input() userDetails: User;
    @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    loggedIn: boolean = false;
    activeTabId: number = 0;
    canSeeSecretQuestions: boolean = true;

    constructor(private currentUserService: CurrentUserService, private _router: Router,
        private userDetailsService: UserDetailsService, private userHomeService: UserHomeService, 
        private cecActivatedRoute: ActivatedRoute, private pService: NgProgressService) {
    }

    public ngOnInit() {
        this.pService.start();
        this.userDetails = new User();
        this.errorMessage = "";
        let impUserId = this.cecActivatedRoute.snapshot.params[USERHOMECONSTANTS.params.accountId];
         let userId = this.cecActivatedRoute.snapshot.params[USERHOMECONSTANTS.params.userId];
        if (impUserId) {
            let navigationExtras = {
                queryParams: {"accountId": impUserId, "tabId": USERHOMECONSTANTS.tabIds.myDetailsId, "userId": userId  }
            };
          this._router.navigate(["/myhome"], navigationExtras);
        } else {
            let impUserId = "";
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.accountId]) {
                impUserId = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.accountId];
                this.canSeeSecretQuestions = false;
            }
            this.GetUserDetails(impUserId);
        }
    }

    public setCurrentTab(tabIndex: number): void {
        this.activeTabId = tabIndex;
    };

    public GetUserDetails(accountId: string): void {
        this.userDetailsService
            .GetUserDetails(accountId)
            .subscribe(
            (response: User) => {
                response.organisations = _.sortBy(response.organisations, "name");
                this.refreshUserDetails.emit(response);
            },
            (error) => {
                this._router.navigate(["/home"]);
            })
            .add(c => {
                this.pService.done();
            });
    }
}