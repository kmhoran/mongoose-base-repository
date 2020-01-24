export namespace userTypes {
    interface IUser{
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
    }

    interface IUserCreate {
        email: string;
        firstName: string;
        lastName: string;
    }
}
