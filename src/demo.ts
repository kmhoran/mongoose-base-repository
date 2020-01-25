import dbConnect from "./data/dbConnect";
import userRepo from "./userRepo";
import departmanentRepo from "./departmentRepo";
import config from "./config";

async function run() {
  await dbConnect(config.mongo.connectinString, config.mongo.database);

  const user: userTypes.IUserCreate = {
    email: "user@e.com",
    firstName: "some",
    lastName: "user",
    birthdayUTC: new Date()
  };
  console.log("\n% service % => pre-save-user: ", user);
  const saved = await userRepo.save(user);
  console.log("\n% service % => saved user: ", saved);

  const savedId = saved?.userId;
  const found = await userRepo.getSingle(savedId);
  console.log("\n% service % => found user: ", found);

  const toUpdate = JSON.parse(JSON.stringify(found || {}));
  toUpdate.lastName = "one";
  toUpdate.birthdayUTC = new Date("1980-09-09T08:00:00Z");
  const updated = await userRepo.save(toUpdate);
  console.log("\n% service % => updated user: ", updated);

  const dept:  departmentTypes.IDepartmentCreate = {
    name: "Tech",
    managerId: updated?.userId || "",
    buildingName: "HQ"
  };
  const newDept = await departmanentRepo.save(dept);
  console.log("\n% service % => new department:", newDept);

  const all = await userRepo.getAll();
  const allDept = await departmanentRepo.getAll();
  console.log("\n% service % => all users:", all);

  for (let i = 0; i < all.length; i++) {
    await userRepo.delete(all[i].userId);
  }
  for (let i = 0; i < allDept.length; i++) {
    await departmanentRepo.delete(allDept[i].departmentId);
  }
}

run();
