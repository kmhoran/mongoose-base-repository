import mongoose, {Schema, Document} from 'mongoose';
import { departmentTypes } from "./departmentTypes";



export interface IDepartmentSchema extends Document, departmentTypes.IDepartment{}

export const DepartmentSchema: Schema = new Schema({
    departmentId: {type: String, required: true, unique: true},
    name: { type: String, required: true, unique: true},
    managerId: {type: String, required: true},
    buildingName: { type: String, required: true}
}, {autoIndex: false});

export const userModel = mongoose.model<IDepartmentSchema>('Department', DepartmentSchema);
