import mongoose, {Schema, Document} from 'mongoose';
import { userTypes } from "./userTypes";



export interface IUserSchema extends Document, userTypes.IUser{}

export const UserSchema: Schema = new Schema({
    userId: {type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: { type: String, required: true}
}, {autoIndex: false});

export const userModel = mongoose.model<IUserSchema>('User', UserSchema);
