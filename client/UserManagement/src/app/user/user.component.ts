import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalComponent  } from "ng2-bs3-modal";
import { IUser, User } from "../model/user";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Dbop } from "../shared/dbop.enum";
import { UserService } from "../service/user.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent  implements OnInit  {
      @ViewChild('modal') modal: BsModalComponent;
      users: IUser[];
      user: IUser;
      msg: string;
      indLoading: boolean = false;
      userFrm: FormGroup;
      dbops: Dbop;
      modalTitle: string;
      modalBtnTitle: string;
      model: User;
      genders = ['Male', 'Female'];
      countries = ['France', 'Swizerland'];
      states = ['Meurthe et Moselle', 'Paris']

      constructor(private fb: FormBuilder, private _userService: UserService) { }
  
      ngOnInit(): void {

          //this.model = new User('','','','','','','','','','');

          this.userFrm = this.fb.group({
            _id:  [''],
            FirstName:  ['',Validators.required],
            LastName:  [''],
            Email:  [''],
            Gender:  ['',Validators.required],
            DOB:  [''],
            City:  [''],
            State:  [''],
            Zip:  ['',Validators.required],
            Country: ['']
          });
          this.LoadUsers();
          
      }
  
      LoadUsers(): void {
        this.indLoading = true;
        this._userService.get()
            .subscribe(users => { this.users = users; this.indLoading = false; },
            error => this.msg = <any>error);
    }

    addUser() {
        this.dbops = Dbop.create;
        this.SetControlsState(true);
        this.modalTitle = "Add New User";
        this.modalBtnTitle = "Add";
        this.userFrm.reset();
        this.modal.open();
    }

    editUser(id: string) {
        this.dbops = Dbop.update;
        this.SetControlsState(true);
        this.modalTitle = "Edit User";
        this.modalBtnTitle = "Update";
        this.user = this.users.filter(x => x._id == id)[0];
        this.userFrm.setValue(this.user);
        this.modal.open();
    }

    deleteUser(id: string) {
        this.dbops = Dbop.delete;
        this.SetControlsState(false);
        this.modalTitle = "Confirm to Delete?";
        this.modalBtnTitle = "Delete";
        this.user = this.users.filter(x => x._id == id)[0];
        this.userFrm.setValue(this.user);
        this.modal.open();
    }

    onSubmit(formData: any) {
        this.msg = "";
   
        switch (this.dbops) {
            case Dbop.create:
                this._userService.post(formData.value).subscribe(
                    data => {
                      if (data._id != "") //Success
                        {
                            this.msg = "Data successfully added.";
                            this.LoadUsers();
                        }
                        else
                        {
                            this.msg = "There is some issue in saving records, please contact to system administrator!"
                        }
                        
                        this.modal.dismiss();
                    },
                    error => {
                      this.msg = error;
                    }
                );
                break;
            case Dbop.update:
                this._userService.put(formData.value._id, formData._value).subscribe(
                    data => {
                      if (data._id != "") //Success
                        {
                            this.msg = "Data successfully updated.";
                            this.LoadUsers();
                        }
                        else {
                            this.msg = "There is some issue in saving records, please contact to system administrator!"
                        }

                        this.modal.dismiss();
                    },
                    error => {
                        this.msg = error;
                    }
                );
                break;
            case Dbop.delete:
                this._userService.delete(formData.value._id).subscribe(
                    data => {
                      if (data._id != "") //Success
                        {
                            this.msg = "Data successfully deleted.";
                            this.LoadUsers();
                        }
                        else {
                            this.msg = "There is some issue in saving records, please contact to system administrator!"
                        }

                        this.modal.dismiss();
                    },
                    error => {
                        this.msg = error;
                    }
                );
                break;

        }
    }

    SetControlsState(isEnable: boolean)
    {
        isEnable ? this.userFrm.enable() : this.userFrm.disable();
    } 
}