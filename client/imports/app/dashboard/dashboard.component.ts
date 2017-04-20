import { Component, OnInit, NgZone } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Router } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import { upload } from '../../../../both/methods/images.methods';
import { showAlert } from "../shared/show-alert";
import { validateEmail, validatePassword, validatePhoneNum, validateFirstName } from "../../validators/common";
import template from "./dashboard.html";

@Component({
  selector: "dashboard",
  template
})
@InjectUser('user')
export class DashboardComponent extends MeteorComponent implements OnInit, AfterViewInit {
  accountForm: FormGroup;
  userId: string;
  oldEmailAddress: string;
  error: string;
  user: User;
  isUploading: boolean = false;
  isUploaded: boolean = false;
  imageId: string;
  image: Image;
  searchString: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
    if (! Meteor.userId()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    if (!! Meteor.userId()) {
      this.userId = Meteor.userId();
      this.accountForm = this.formBuilder.group({
        email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), CValidators.email])],
        firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        middleName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
      });
      let self = this;
      let callback = (user) => {
        //console.log("user:", user);
        self.accountForm.controls['firstName'].setValue(user.profile.firstName);
        self.accountForm.controls['middleName'].setValue(user.profile.middleName);
        self.accountForm.controls['lastName'].setValue(user.profile.lastName);
        self.accountForm.controls['email'].setValue(user.emails[0].address);
        self.accountForm.controls['phoneNum'].setValue(user.profile.contact);
        self.oldEmailAddress = user.emails[0].address;
      };
      this.fetchUser(callback);
    }
  }

  // find logged-in user data as not available page-load on client
  private fetchUser(callback) {
    //console.log("call users.findOne()")
    this.call("users.findOne", (err, res) => {
        if (err) {
            return;
        }
        //console.log("users.findOne():", res);
        callback(res);
    });
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        var phones = [{ "mask": "(###) ###-####"}];
            $('#phoneNum').inputmask({
                mask: phones,
                greedy: false,
                definitions: { '#': { validator: "[0-9]", cardinality: 1}} });
      })
    })
  }
  //update user from dashboard
  update() {
    let fullName = this.accountForm.value.firstName;
    if(this.accountForm.value.middleName) {
      fullName  = fullName + " " + this.accountForm.value.middleName;
    }
    fullName = fullName + " " + this.accountForm.value.lastName;
    let userData = {
      "profile.firstName": this.accountForm.value.firstName,
      "profile.middleName": this.accountForm.value.middleName,
      "profile.lastName": this.accountForm.value.lastName,
      "profile.contact": this.accountForm.value.phoneNum,
      "profile.fullName": fullName
    };
    let emailAddress = {
      oldAddress: this.oldEmailAddress,
      newAddress: this.accountForm.value.email
    };

    this.error = null;
    this.call("users.update", userData, emailAddress, (err, res) => {
      this.zone.run(() => {
        if(err) {
            this.error = err;
        } else {
          this.oldEmailAddress = emailAddress.newAddress;
          showAlert("Your profile has been updated successfully.", "success");
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }

  onFileSelect(event) {
        var files = event.srcElement.files;
        this.startUpload(files[0]);
    }


    private startUpload(file: File): void {
        // check for previous upload
        if (this.isUploading === true) {
            console.log("aleady uploading...");
            return;
        }

        // start uploading
        this.isUploaded = false;
        //console.log('file uploading...');
        this.isUploading = true;

        upload(file)
        .then((res) => {
            this.isUploading = false;
            this.isUploaded = true;
            this.image = res;
            this.imageId = res._id;
            let userData = {
                "profile.image":{
                  id: this.imageId,
                  url: this.image.url,
                  name: this.image.name
                }
            };
            this.call("users.update", userData, (err, res) => {
                if (err) {
                    console.log("Error while updating user picture");
                    return;
                }
                $("#inputFile").val("");
                this.user.profile.image.url = this.image.url;
                showAlert("Profile picture updated successfully.", "success");
            });
        })
        .catch((error) => {
            this.isUploading = false;
            console.log('Error in file upload:', error);
            showAlert(error.reason, "danger");
        });
    }
}
