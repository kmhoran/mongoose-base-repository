declare module departmentTypes {
  interface IDepartment {
    departmentId: string;
    name: string;
    managerId: string;
    buildingName: string;
  }

  interface IDepartmentCreate {
    name: string;
    managerId: string;
    buildingName: string;
  }
}
