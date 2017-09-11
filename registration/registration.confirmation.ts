// Exact copy except import UserService from shared
import { Component, OnInit }      from "@angular/core";

@Component({
  template: require("./registration.confirmation.html"),
  styles: [require("./registration.component.less").toString()]
})
export class RegistrationConfirmation {
  message: string;

  constructor() {
    // TODO: Move into DB later on
    this.message = "Thank you for your registration. Your account is pending until it has been accepted by your Principal (or their delegate) or your Diocesan administrator.";
  }
}

