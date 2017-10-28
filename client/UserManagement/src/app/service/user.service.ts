import { Injectable } from '@angular/core';
import { IUser } from "../model/user";
import { Observable } from "rxjs/Observable";
import { Http, Response, Headers, RequestOptions} from '@angular/http';
import { AuthHttp } from "angular2-jwt";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserService {
  users: IUser[];
  constructor(private _http: AuthHttp) { }
  get(): Observable<any> {
       let url="/api/users";
      return this._http.get(url)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  post(model: any): Observable<any> {
    let url="/api/user";
      let body = JSON.stringify(model);
      console.log(body);
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this._http.post(url, body, options)
          .map((response: Response) => <any>response.json())
          .catch(this.handleError);
  }

  put(id: string, model: IUser): Observable<any> {
      let url="/api/user/"+id;
      delete model._id;
      let body = JSON.stringify(model);
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      //options.params.set('id',id.toString());
      return this._http.put(url, body, options)
          .map((response: Response) => <any>response.json())
          .catch(this.handleError);
  }

  delete(id: string): Observable<any> {
    let url="/api/user/"+id;
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      //options.params.set('id',id);
      return this._http.delete(url,options)
          .map((response: Response) => <any>response.json())
          .catch(this.handleError);
  }

  private handleError(error: Response) {
      console.error(error);
      return Observable.throw(error.json().error || 'Server error');
  }

}