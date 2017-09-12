import { Component, OnInit, Input, Output, EventEmitter}
from "@angular/core";
import { Router, ActivatedRoute }       from "@angular/router";
import { Observable }                   from "rxjs/Observable";
import { Token, User, SecretQuestion, UserSecretQuestionInfo, Error }
from "../../../../models";
import { CurrentUserService }           from "../../../../services/shared";
import { CommonUtility }                from "../../../../utils/commonUtility";
import { CONFIGURATION }                from "../../../../app.constants";
import { USERHOMECONSTANTS }            from "../../userHome.constants";
import { UserHomeService }              from "../../userHome.service";
import { UserDetailsService }           from "../userDetails.service";
import { StaticUserDataService }        from "../../../../services/staticUserData.service";
import { SecretQuestionsService }       from "./secretQuestions.service";
import * as swal                        from "sweetalert2";
import {NgProgressService}              from "ng2-progressbar";

@Component({
    selector: "secret-question-info",
    template: `
    <div [ngSwitch]="isEditMode">
      <template [ngSwitchCase]="true"> ${require("./secretQuestionsEdit.component.html")} </template>
      <template ngSwitchDefault> ${require("./secretQuestions.component.html")} </template>
    </div>`,
    providers: [SecretQuestionsService]
})

export class SecretQuestionsComponent implements OnInit {
    @Input() userDetails: User;
    @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    secretQuestions: SecretQuestion[];
    questionList1: SecretQuestion[];
    questionList2: SecretQuestion[];
    questionList3: SecretQuestion[];

    userSecretQuestionInfo: UserSecretQuestionInfo;
    errorMessage: string;
    errors: Error[];
    currentDate: Date = new Date();
    isEditMode: boolean;
    isProcessing: boolean;
    hasEditPermission: boolean = false;

    constructor(private pService: NgProgressService,
        private currentUserService: CurrentUserService,
        private cecRouter: Router,
        private cecActivatedRoute: ActivatedRoute,
        private secretQuestionsService: SecretQuestionsService,
        private userHomeService: UserHomeService,
        private staticUserDataService: StaticUserDataService) {
        this.isProcessing = false;
    }

    // region: Event handlers
    ngOnInit() {
        this.errorMessage = "";
        this.errors = [];
        this.isEditMode = false;
        this.userSecretQuestionInfo = new UserSecretQuestionInfo();
        this.secretQuestions = this.staticUserDataService.GetSecretQuestionsList();
        this.getSecretQuestions();

        // Apply security rules
        // Global admins, diocesan admin and organisation admin can edit contact details or logged in user can edit own contact details
        let token = this.currentUserService.token;
        if (token) {
            // Global admins, diocesan admin and organisation admin can edit contact details
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId]) {
                this.hasEditPermission = false;
            } else {
                // Logged in user can edit own contact details
                this.hasEditPermission = true;
            }
        };
    }

    // On secret question change
    onSecretQuestionChange(questionIdName, questionIdValue: number) {
        switch (questionIdName) {
            case "secretQuestion1Id":
                this.userSecretQuestionInfo.secretQuestion1Id = questionIdValue;
                this.questionList2 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion3Id);
                this.questionList3 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion2Id);
                break;
            case "secretQuestion2Id":
                this.userSecretQuestionInfo.secretQuestion2Id = questionIdValue;
                this.questionList1 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion3Id);
                this.questionList3 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion1Id);
                break;
            case "secretQuestion3Id":
                this.userSecretQuestionInfo.secretQuestion3Id = questionIdValue;
                this.questionList1 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion2Id);
                this.questionList2 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.userSecretQuestionInfo.secretQuestion1Id);
                break;
        }
    }

    onSecretQuestionEditSubmit() {
        this.errorMessage = "";
        this.errors = [];
        // Map view to edit model 
        Object.keys(this.userDetails).forEach(key => this.userSecretQuestionInfo[key] = this.userDetails[key]);
        this.questionList1 = this.secretQuestions.filter(s => s.id !== this.userSecretQuestionInfo.secretQuestion2Id && s.id !== this.userSecretQuestionInfo.secretQuestion3Id);
        this.questionList2 = this.secretQuestions.filter(s => s.id !== this.userSecretQuestionInfo.secretQuestion1Id && s.id !== this.userSecretQuestionInfo.secretQuestion3Id);
        this.questionList3 = this.secretQuestions.filter(s => s.id !== this.userSecretQuestionInfo.secretQuestion1Id && s.id !== this.userSecretQuestionInfo.secretQuestion2Id);

        this.isEditMode = true;
    }

    onSecretQuestionInfoSave() {
        this.pService.start();
        this.errorMessage = "";
        this.errors = [];
        this.isProcessing = true;
        this.handleProcessing.emit(true);
        // Update contact info in the DB
        this.secretQuestionsService
            .Update(this.userSecretQuestionInfo)
            .subscribe(
            (response: User) => {
                this.userHomeService.userDetailsUpdateConfirm(response);
                this.isEditMode = false;
                swal(
                    "Update Confirmed!",
                    "Request has been processed successfully",
                    "success"
                );
                let impUserId = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId];
                if (impUserId) {
                    let navigationExtras = {
                        queryParams: { "userId": impUserId, "tabId": USERHOMECONSTANTS.tabIds.myDetailsId }
                    };
                    this.cecRouter.navigate(["/home"], navigationExtras);
                } else {
                    this.cecRouter.navigate(["/home"], { queryParams: { "tabId": USERHOMECONSTANTS.tabIds.myDetailsId } });
                }
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                    let popupMessage = "You do not have permission to update contact details!";
                    if (this.errors) {
                        popupMessage = this.errors[0].message;
                    }
                    swal(
                        paersedErrors.message,
                        popupMessage,
                        "error"
                    );
                }
                this.isEditMode = false;
            })
            .add(t => {
                this.isProcessing = false;
                this.handleProcessing.emit(false);
                this.isEditMode = false;
                this.pService.done();
            });
        this.isEditMode = false;
    }

    onSecretQuestionEditCancel() {
        this.isEditMode = false;
    }

    onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    // endRegion: Event handlers

    // region:  methods/functions

    getSecretQuestions() {
        // Get secret questions list
        this.secretQuestionsService
            .GetSecretQuestions()
            .subscribe(
            (response: SecretQuestion[]) => {
                this.secretQuestions = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    getSecretQuestionName(secretQuestionId: number): string {
        if (!this.secretQuestions) return "";

        let secretQuestion = this.secretQuestions.find(sq => sq.id === secretQuestionId);
        if (!secretQuestion) return "";

        return secretQuestion.name;
    }

    // endRegion:  methods/functions
}