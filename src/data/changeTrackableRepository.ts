import RepositoryBase from "./repositoryBase";

const changeTrackableFields = ['dateCreatedUTC', 'dateLastModifiedUTC', 'lastModifieByUserId']

class ChangeTrackableRepository<
  T extends dataTypes.IChangeTrackable
> extends RepositoryBase<T> {
  constructor(specs: dataTypes.IRepositorySpecs) {
    validateChangeTrackableSpecs(specs)
    super(specs);
  }
  public async save(
    toSave: dataTypes.IChangeTrackable,
    updatingUserId: string = ""
  ) {
    if (!updatingUserId.length) throw "must include updating user";

    const now = new Date();
    if (this.checkIsNew(toSave)) {
      toSave.dateCreatedUTC = now;
    }
    toSave.dateLastModifiedUTC = now;
    toSave.lastModifieByUserId = updatingUserId;
    return await super.save(toSave);
  }
}

function validateChangeTrackableSpecs(specs: dataTypes.IRepositorySpecs){
    const {schemaOptions, collectionName} = specs
    const schemaFields = Object.keys(schemaOptions);
    for(let requredField of changeTrackableFields){
        if(!schemaFields.includes(requredField)) throw `Error while creating ChangeTrackable collection ${collectionName}.
        Required field '${requredField}' was not found on schemaOptions.`
    }
    return true;
}

export default ChangeTrackableRepository;
