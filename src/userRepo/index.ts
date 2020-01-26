import ChangeTrackableRepository from "../data/changeTrackableRepository";
import config from "./config";

class UserRepo extends ChangeTrackableRepository<userTypes.IUser> {
  private static exists: boolean = false;
  private static instance: UserRepo;

  constructor() {
    super(config);
    if (UserRepo.exists) return UserRepo.instance;
    UserRepo.exists = true;
    UserRepo.instance = this;
  }

  public async getAll() {
    return await this.getMultiple({});
  }

  public save(toSave: userTypes.IUser | userTypes.IUserCreate, updatingUser: string) {
    return super.save(toSave, updatingUser);
  }
}

export default new UserRepo();
