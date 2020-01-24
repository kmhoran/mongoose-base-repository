import dbConnect from "./data/dbConnect";
import { userTypes } from "./userRepo/userTypes";
import { departmentTypes } from "./departmentRepo/departmentTypes.d";
import userRepo from "./userRepo";
import departmanentRepo from "./departmentRepo";
import config from "./config";

async function run() {
  await dbConnect(config.mongo.connectinString, config.mongo.database);

  const user: userTypes.IUserCreate = {
    email: "user@e.com",
    firstName: "some",
    lastName: "user"
  };

  const saved = await userRepo.save(user);
  console.log("% service % => saved user: ", saved);

  const savedId = saved?.userId;
  const found = await userRepo.getSingle(savedId);
  console.log("% service % => found user: ", found);

  const toUpdate = JSON.parse(JSON.stringify(found || {}));
  toUpdate.lastName = "one";
  const updated = await userRepo.save(toUpdate);
  console.log("% service % => updated user: ", updated);

  const dept: departmentTypes.IDepartmentCreate = {
    name: "Tech",
    managerId: updated?.userId || "",
    buildingName: "HQ"
  };
  const newDept = await departmanentRepo.save(dept);
  console.log("% service % => new department:", newDept);

  const all = await userRepo.getAll();
  const allDept = await departmanentRepo.getAll();
  console.log("% service % => all users:", all);

  for (let i = 0; i < all.length; i++) {
    await userRepo.delete(all[i].userId);
  }
  for (let i = 0; i < allDept.length; i++) {
    await departmanentRepo.delete(allDept[i].departmentId);
  }
}

run();
