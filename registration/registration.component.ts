// Exact copy except import UserService from shared
import { Component, OnInit, AfterViewChecked, ViewChild, Output, EventEmitter }
from "@angular/core";
import { User, Diocese, Organisation, Error, Gender, SecretQuestion, JobTitle }
from "../../models";
import * as moment                      from "moment";
import { Router }               from "@angular/router";
import { NgForm }               from "@angular/forms";
import {NgbDateStruct, NgbDatepickerConfig }
from "@ng-bootstrap/ng-bootstrap";
import { RegistrationService }  from "./registration.service";
import * as swal                from "sweetalert2";
import {NgProgressService} from "ng2-progressbar";
const _ = require("underscore");

@Component({
  template: require("./registration.component.html"),
  styles: [require("./registration.component.less").toString()],
  providers: [RegistrationService, NgbDatepickerConfig]
})
export class RegistrationComponent implements OnInit, AfterViewChecked {
  @Output() handleProcessing: EventEmitter<any> = new EventEmitter();
  user: User;
  dioceseList: Diocese[];
  organisations: Organisation[];
  genders: Gender[];
  jobTitleList: JobTitle[];
  secretQuestions: SecretQuestion[];
  questionList1: SecretQuestion[];
  questionList2: SecretQuestion[];
  questionList3: SecretQuestion[];
  termsAndConditions: string;
  salutations: string[];
  errorMessage: string;
  errors: Error[];
  currentDate: Date = new Date();
  ngbDateOfBirth: NgbDateStruct;
  isProcessing: boolean;

  registrationForm: NgForm;
  @ViewChild("registrationForm") currentForm: NgForm;

  constructor(private pService: NgProgressService, private registrationService: RegistrationService,
  private _router: Router,
  private config: NgbDatepickerConfig) {
    config.minDate = { year: 1900, month: 2, day: 1 };
    config.maxDate = { year: this.currentDate.getFullYear() - 17, month: 12, day: 31 };
    config.startDate = { year: this.currentDate.getFullYear() - 17, month: 12};
    this.user = new User();
    this.user.organisations = [new Organisation()];
    this.isProcessing = false;
  }

  ngOnInit() {
    this.errorMessage = "";
    this.errors = [];
    //Get salutations from API
    this.salutations = ["Mr", "Mrs", "Ms", "Miss", "Prof", "Sr", "Br", "Fr", "Rev", "Bishop", "Dr"];
    // Get diocese list
    this.registrationService
      .GetDioceseList()
      .subscribe(
      (response: Diocese[]) => {
        this.dioceseList = response;
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
      });
    // Get secret questions
     
    this.registrationService
      .GetSecretQuestions()
      .subscribe(
      (response: SecretQuestion[]) => {
        this.pService.start();
        this.secretQuestions = response;
        this.questionList1 = this.secretQuestions;
        this.questionList2 = this.secretQuestions;
        this.questionList3 = this.secretQuestions;
        this.pService.done();
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
      });
    // Get job titles
    this.GetJobTitles();
    this.genders = [{ code: "F", name: "Female" }, { code: "M", name: "Male" }];
    this.termsAndConditions = "Applications accessed via the CECNSW NETiD site may contain confidential information collected to promote the welfare and development of students enrolled by NSW Catholic schools. This information is only collected to the extent necessary to ensure appropriate service to the individuals involved and to ensure that CECNSW can fulfil its duty of care including its duties in relation to the care and protection of children and young people. All persons accessing applications via the CECNSW NETiD site should be aware of their responsibility for maintaining the confidentiality and privacy of student records and accept that a duty of confidence applies and that information cannot further be disclosed without the information provider's consent. If a disclosure is made which is not permitted under either common law or privacy legislation penalties may apply.";
  }

  ngAfterViewChecked() {
    // Comment this out for the time being
    //this.formChanged();
  }

  private formChanged() {
    if (this.currentForm === this.registrationForm) { return; }
    this.registrationForm = this.currentForm;
    if (this.registrationForm) {
      const form = this.registrationForm.form;
      const firstName = form.get("firstName");
      firstName.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }

  private onValueChanged(data?: any) {
    if (this.user.firstName && this.user.lastName && this.user.dateOfBirth) {
      this.GetUserIdForNewAccount(this.user.firstName, this.user.lastName, this.user.dateOfBirth);
    }
  }

    onDateOfBirthChange(dateOfBirth) {
        this.ngbDateOfBirth = dateOfBirth;
        this.user.dateOfBirth = new Date(this.ngbDateOfBirth.year, this.ngbDateOfBirth.month - 1, this.ngbDateOfBirth.day);
      if (this.user.firstName && this.user.lastName && this.user.dateOfBirth) {
        this.GetUserIdForNewAccount(this.user.firstName, this.user.lastName, this.user.dateOfBirth);
      }
    }

  onSubmit() {
       this.pService.start();
    this.errorMessage = "";
    this.errors = [];
    this.isProcessing = true;
    this.handleProcessing.emit(true);
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = "Input validation failed:";
      this.errors.push({ code: "confirmPassword", message: "Passwords do not match" });
      swal({
        title: "Input validation failed!",
        text: "Password and confirm password do not match.",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Ok"
      });
      this.isProcessing = false;
      return;
    }
    // validate user and  
    this.GetUserIdForNewAccount(this.user.firstName, this.user.lastName, this.user.dateOfBirth);

    // Set job title before submit
    if (this.user.organisations[0].jobTitle === "Other" && this.user.organisations[0].otherJobTitle) {
      this.user.organisations[0].jobTitle = this.user.organisations[0].otherJobTitle;
    }

    let organ = this.organisations.find( o => o.publicId === this.user.organisations[0].extOrganisationId)
    this.user.organisations[0].isDioceseOffice = organ.isDioceseOffice;

    // Register user
    this.registrationService
      .Save(this.user)
      .subscribe(
      (response: User) => this._router.navigate(["/confirmation"]),
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
        swal(
          "Failed to create new account!",
          "Please see the error(s) list at the bottom of the page.",
          "error"
        );
      })
      .add(t => {
        this.isProcessing = false;
        this.handleProcessing.emit(false);
      });

        this.pService.done();
  }

  onInputBlur(inputValue) {
    if (this.user.firstName && this.user.lastName && this.user.dateOfBirth) {
      this.GetUserIdForNewAccount(this.user.firstName, this.user.lastName, this.user.dateOfBirth);
    }
  }

  onDateInputBlur(inputValue) {
    alert(inputValue);
  }

  public onHandleProcessing(isProcessing) {
    this.isProcessing = isProcessing;
  }

  onJobTitleChange(jobTitle) {
    this.user.organisations[0].jobTitle = jobTitle;
    // Reset other job title
    if (jobTitle !== "Other") {
      this.user.organisations[0].otherJobTitle = "";
    }
  }

  // endRegion: Event handlers

  public GetJobTitles() {
    // Get global roles list list
    this.registrationService
      .GetJobTitles()
      .subscribe(
      (response: JobTitle[]) => {
        this.jobTitleList = _.sortBy(response, "name");
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
        }
      });
  }
  // On salutation change
  public GenderOnSalutationChange(salutation) {
    this.user.salutationCode = salutation;
    switch (this.user.salutationCode) {
      case "Mr":
      case "Fr":
      case "Br":
      case "Rev":
      case "Bishop":
        this.user.gender = "M";
        break;
      case "Mrs":
      case "Miss":
      case "Ms":
      case "Sr":
        this.user.gender = "F";
        break;
      default:
        this.user.gender = "";
    }
  }

  // On cancel registration
  public CancelRegistration() {
    this._router.navigate(["/home"]);
  }

  // /** Display a message briefly, then remove it. */
  displayMessage(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = "", 1500);
  }

  public GetOrganisationList(diocesePublicId) {
    this.registrationService
      .GetOrganisationsByDiocese(diocesePublicId)
      .subscribe(
      (response: Organisation[]) => {
        this.organisations = response;
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
      });
  }

  public GetOrganisationListByDioceseId(dioceseId) {
    this.registrationService
      .GetOrganisationsByDioceseId(dioceseId)
      .subscribe(
      (response: Organisation[]) => {
        this.organisations = response;
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
      });
  }

  // On salutation change
  public UpdateQuestionList(questionIdName, questionIdValue: number) {
    switch (questionIdName) {
      case "secretQuestion1Id":
        this.user.secretQuestion1Id = questionIdValue;
        this.questionList2 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion3Id);
        this.questionList3 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion2Id);
        break;
      case "secretQuestion2Id":
        this.user.secretQuestion2Id = questionIdValue;
        this.questionList1 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion3Id);
        this.questionList3 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion1Id);
        break;
      case "secretQuestion3Id":
        this.user.secretQuestion3Id = questionIdValue;
        this.questionList1 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion2Id);
        this.questionList2 = this.secretQuestions.filter(s => s.id != questionIdValue && s.id != this.user.secretQuestion1Id);
        break;
    }
  }

  public GetUserIdForNewAccount(firstName: string, lastName: string, dateOfBirth: Date) {
    //let moment = dateOfBirth;
    this.registrationService
      .GetUserIdForNewAccount(firstName, lastName, moment(dateOfBirth).format("YYYY-MM-DD"))
      .subscribe(
      (response: string) => {
        this.errorMessage = "";
        this.errors = [];
        this.user.userId = response;
      },
      (error) => {
        let paersedErrors = JSON.parse(error._body);
        if (paersedErrors) {
          this.errorMessage = paersedErrors.message;
          this.errors = paersedErrors.errors;
        }
        swal(
          "Input validation failed!",
          "Account with same name and date of birth already exists!",
          "error"
        );
      });
  }
}