declare module userTypes {
  export interface IUser extends dataTypes.IChangeTrackable {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    birthdayUTC?: Date;
  }

  export interface IUserCreate extends dataTypes.IChangeTrackable {
    email: string;
    firstName: string;
    lastName: string;
    birthdayUTC?: Date;
  }
}
