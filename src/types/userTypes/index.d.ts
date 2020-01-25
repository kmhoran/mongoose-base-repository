declare module userTypes {
  export interface IUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    birthdayUTC?: Date;
    dateCreatedUTC?: Date;
  }

  export interface IUserCreate {
    email: string;
    firstName: string;
    lastName: string;
    birthdayUTC?: Date;
    dateCreatedUTC?: Date;
  }
}
