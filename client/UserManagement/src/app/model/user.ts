export interface IUser {
    _id: string,
    FirstName: string,
    LastName: string,
    Email: string,
    Gender: string,
    DOB: string,
    City: string,
    State: string,
    Zip: string,
    Country: string
}

export class User {
    
      constructor(
        public _id: string,
        public FirstName: string,
        public LastName: string,
        public Email: string,
        public Gender: string,
        public DOB: string,
        public City: string,
        public State: string,
        public Zip: string,
        public Country: string,
      ) {  }
    
    }