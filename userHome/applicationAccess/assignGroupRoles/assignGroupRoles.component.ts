import { Component, Input, Output, EventEmitter, OnInit }
from "@angular/core";
import { Router }                       from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Subscription }                 from "rxjs/Subscription";
import { AccountRole, Error, ApplicationClaim, RoleApplicationClaim }
from "../../../../models";
import { UserAuthenticationService }    from "../../../../services/shared";
import { USERHOMECONSTANTS }            from "../../userHome.constants";
import { UserHomeService }              from "../../userHome.service";
import { ApplicationAccessService }     from "../applicationAccess.service";
import { AssignGroupRolesService }      from "./assignGroupRoles.service";
import * as swal                         from "sweetalert2";

@Component({
    selector: "assign-group-roles",
    template: require("./assignGroupRoles.component.html"),
    providers: [AssignGroupRolesService]
})

export class AssignGroupRolesComponent implements OnInit {
    @Input() applicationClaimListObservable: Observable<ApplicationClaim[]>;
    @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
    applicationClaimsSubscribe: Subscription;
    roleApplicationClaim: RoleApplicationClaim;
    organisationRoleList: AccountRole[];
    messageHeader: string;
    errors: Error[];
    isEditMode: boolean;
    isProcessing: boolean;

    constructor(private userAuthService: UserAuthenticationService,
        private assignGroupRolesService: AssignGroupRolesService,
        private applicationAccessService: ApplicationAccessService,
        private userHomeService: UserHomeService) {
        this.roleApplicationClaim = new RoleApplicationClaim();
        // this.applicationClaimsSubscribe = this.applicationAccessService.applicationClaimsPublishConfirmed$.subscribe(
        //     applicationClaims => {
        //         this.applicationClaimList = applicationClaims;
        //         console.log(this.applicationClaimList);
        //     });
    }

    // region: Event handlers

    ngOnInit() {
        this.messageHeader = "";
        this.errors = [];
        this.isEditMode = false;
        this.isProcessing = false;

        // Get organisation roles
        this.GetOrganisationRoles();
    }

    onAssignGroupRoleSave() {
        this.messageHeader = "";
        this.errors = [];
        this.isProcessing = true;
        if (this.roleApplicationClaim.applicationClaimId === undefined
            || this.roleApplicationClaim.applicationClaimId === ""
            || this.roleApplicationClaim.applicationClaimId === "00000000-0000-0000-0000-000000000000") {
            swal(
                "Unable to Process!",
                "Please make sure that the application has at least one valid security role.",
                "warning"
            );
        } else {
            this.ProcessSubmitRequest(this);
        }

        this.isProcessing = false;
    }

    onHandleProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    // ngOnDestroy() {
    //     this.applicationClaimsSubscribe.unsubscribe();
    // }

    // endRegion: Event handlers

    public GetOrganisationRoles() {
        // Get global roles list list
        this.assignGroupRolesService
            .GetOrganisationRoles()
            .subscribe(
            (response: AccountRole[]) => {
                this.organisationRoleList = response;
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                }
            });
    }
    public ProcessSubmitRequest(assignGroupRolesComponent: AssignGroupRolesComponent) {
        let continueProcessing = false;
        swal({
            title: "Are you sure?",
            text: "You are submitting this bulk security updates.",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        }).then(function () {
            continueProcessing = true;
            assignGroupRolesComponent.SubmitGroupApplicationClaims(assignGroupRolesComponent.roleApplicationClaim);
        }, function (dismiss) {
            continueProcessing = false;
        });
    }

    public SubmitGroupApplicationClaims(roleApplicationClaim: RoleApplicationClaim): boolean {
        this.assignGroupRolesService
            .SubmitGroupApplicationClaims(roleApplicationClaim)
            .subscribe((response: boolean) => {
                if (response === true) {
                    this.messageHeader = "Your request has been processed successfully!";
                    swal(
                        "Done!",
                        "Your request has been completed successfully!",
                        "success"
                    );
                } else {
                    swal(
                        "Failed!",
                        "Failed to process your request! Please try later...",
                        "error"
                    );
                }
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.messageHeader = paersedErrors.message;
                    this.errors = paersedErrors.errors;
                }
                let popupMessage = "You do not have permission to process this request!";
                if (this.errors) {
                    popupMessage = "Failed to process your request! Please try later...";
                }
                swal(
                    paersedErrors.message,
                    popupMessage,
                    "error"
                );

                return false;
            });
        return true;
    }

}