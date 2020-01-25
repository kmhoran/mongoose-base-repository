import type from "../data/schemaValueTypes";

export const DepartmentSchema: any = {
  departmentId: { type: type.String, required: true, unique: true },
  name: { type: type.String, required: true, unique: true },
  managerId: { type: type.String, required: true },
  buildingName: { type: type.String, required: true }
};
