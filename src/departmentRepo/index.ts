import repositoryBase from "../data/repositoryBase";
import config from "./config";

class DepartmentRepo extends repositoryBase<departmentTypes.IDepartment> {
  private static exists: boolean = false;
  private static instance: DepartmentRepo;

  constructor() {
    super(config);
    if (DepartmentRepo.exists) return DepartmentRepo.instance;
    DepartmentRepo.exists = true;
    DepartmentRepo.instance = this;
  }

  public save(
    toSave: departmentTypes.IDepartment | departmentTypes.IDepartmentCreate
  ) {
    return super.save(toSave);
  }

  public async getAll() {
    return await this.getMultiple({});
  }
}

export default new DepartmentRepo();
