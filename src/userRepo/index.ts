import repositoryBase from "../data/repositoryBase";
import { userModel, IUserSchema } from "./userSchema";
import { userTypes } from "./userTypes";

class UserRepo extends repositoryBase<userTypes.IUser, IUserSchema> {
  private static exists: boolean = false;
  private static instance: UserRepo;
  constructor() {
    super({ model: userModel, primaryKey: "userId" });
    if (UserRepo.exists) return UserRepo.instance;
    UserRepo.exists = true;
    UserRepo.instance = this;
  }

  public async getAll() {
    return await this.getMultiple({});
  }

  public save(toSave: userTypes.IUser | userTypes.IUserCreate) {
    return super.save(toSave);
  }
}

export default new UserRepo();
