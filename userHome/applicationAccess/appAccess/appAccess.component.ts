import { Component, OnInit, Input, Output, EventEmitter}                                                from "@angular/core";
import { Router }                                                                                       from "@angular/router";
import { NgForm }                                                                                       from "@angular/forms";
import * as moment                                                                                      from "moment";
import { Observable }                                                                                   from "rxjs/Observable";
import { Token, ApplicationStatus, Application, ApplicationClaimStatus, ApplicationClaim }              from "../../../../models";
import { AppAcessService }                                                                              from "./appAccess.service";
import { USERHOMECONSTANTS }                                                                            from "../../userHome.constants";
const _ = require("underscore");
import * as swal                                                                                        from "sweetalert2";

@Component({
    selector: "appAccess-component",
    template: require("./appAccess.component.html"),
    styles: [require("./appAccess.component.less").toString()],
    providers: [AppAcessService]
})

export class AppAccessComponent implements OnInit {
    @Input() application: Application;
    @Input() applicationStatuses: Observable<ApplicationStatus[]>;
    @Input() applicationClaimStatuses: Observable<ApplicationClaimStatus[]>;
    @Output() refresh: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    errors: Error[];
    claims: ApplicationClaim[];
    isProcessing: boolean;
    appAccessForm: NgForm;
    formInvalid: boolean;

    constructor(private cecRouter: Router, private appAcessService: AppAcessService) {
    }

    // region : event handlers

    public ngOnInit(): void {

        this.errorMessage = "";
        this.errors = [];
        this.application = new Application();
        this.claims = this.application.claims;
        this.formInvalid = false;
    }

    public onHandleProcessing(isProcessing: boolean): void {
        this.isProcessing = isProcessing;
    }

    public onSecurityRoleAddClick(): void {
        let claim = new ApplicationClaim();
        claim.statusCode = "InActive";
        claim.applicationClaimId = "00000000-0000-0000-0000-000000000000";
        claim.isDefault = false;
        let clms = new Array<ApplicationClaim>();

        if (this.application.claims) {
            clms = this.application.claims;
        }

        claim.isDefault = (!clms.find(i => i.isDefault));

        clms.push(claim);

        this.application.claims = clms;

        this.formInvalid = !this.application.claims.find(i => i.isDefault);
    }

        public onIsDefualtChange(index) {

        let clms = this.application.claims;
        let count = 0;

        clms.forEach(i => {
            if (count !== index) {
                i.isDefault = false;
            }
            count++;
        });

        this.application.claims = clms;
        this.formInvalid = (this.application.claims.find(i => i.isDefault) !== undefined);
    }
    public onSecurityRoleRemoveClick(claim: ApplicationClaim): void {

        let clms = _.without(this.application.claims, claim);

        if (clms && clms.length > 0 && !clms.find(i => { i.isDefault; })) {
            clms[0].isDefault = true;
        }
        this.application.claims = clms;
    }

    onBlur(val) {

        this.ValidateSecuirtyRole();

        this.formInvalid = !this.application.claims.find(i => i.isDefault);
    }

    public ValidateSecuirtyRole() {
        let claims = [];

        this.application.claims.forEach(i => {
            if (i.name && i.name.trim() !== "") {
                let name = i.name;
                let claim = {
                    name: name.toLowerCase()
                };
                claims.push(claim);
            }
        });

        let duplicates = _.chain(claims).groupBy("name").filter(function (v) { return v.length > 1; }).uniq().value();

        if (duplicates.length !== 0) {
            swal({
                title: "Are you sure?",
                text: "The security role name must be unique!",
                type: "warning",
                showCancelButton: false,
                confirmButtonText: "Okay"
            });
            this.formInvalid = true;
        }
        else {
            this.formInvalid = false;
        }
    }

    public onSubmit(): void {

        this.onconfirm(this);
    }

    onconfirm(appAccessComponent: AppAccessComponent): void {
        this.errorMessage = "";
        this.errors = [];
        let save = true;

        swal({
            title: "Are you sure?",
            text: "You are adjusting application security settings!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
        }).then(function () {
            appAccessComponent.save();
        }, function (dismiss) { });
    }

    public save(): void {
        this.isProcessing = true;
        if (!this.application.id) {
            this.appAcessService
                .Add(this.application)
                .subscribe(
                (response: Application) => {
                    swal(
                        "Done!",
                        "Your request has been completed successfully!",
                        "success");
                    this.refresh.emit();
                },
                (error) => {
                    swal(
                        "Failed!",
                        "Failed to process your request! Please try later...",
                        "error"
                    );
                });
        }
        else {

            this.appAcessService
                .Update(this.application)
                .subscribe(
                (response: Application) => {
                    swal(
                        "Done!",
                        "Your request has been completed successfully!",
                        "success");
                    this.refresh.emit();
                },
                (error) => {
                    swal(
                        "Failed!",
                        "Failed to process your request! Please try later...",
                        "error"
                    );
                });
        }

    }
}