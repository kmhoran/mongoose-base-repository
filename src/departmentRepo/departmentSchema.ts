export const DepartmentSchema: any = {
  departmentId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  managerId: { type: String, required: true },
  buildingName: { type: String, required: true }
};
