import type from "../data/schemaValueTypes";

export const UserSchema: dataTypes.ISchemaOptions = {
  userId: { type: type.String, required: true, unique: true },
  email: { type: type.String, required: true, unique: true },
  firstName: { type: type.String, required: true },
  lastName: { type: type.String, required: true },
  birthdayUTC: { type: type.Date, required: false },
  dateCreatedUTC: { type: type.Date, required: false }
};
