import mongoose, { Schema, Model, Document } from "mongoose";
import schemaValueType from "./schemaValueTypes";

import { omit } from "lodash";

type TDoc<T> = Document & T;

// extra properties mongoose tacks onto saved objects
const mongooseExtras = ["_id", "__v", "id"];

class RepositoryBase<T> {
  private model: Model<TDoc<T>, any>;
  private schemaOptions: any;
  private dateProxies: dataTypes.IDateProxy[];

  protected modelPk: string;
  constructor(specs: dataTypes.IRepositorySpecs) {
    validateRepositorySpecs(specs);
    const {schemaOptions, dateProxies} = stripDatesFromSchema(specs.schemaOptions);
    this.dateProxies = dateProxies;
    this.schemaOptions = schemaOptions;

    const schema: Schema = new Schema(
      { ...this.schemaOptions },
      { autoIndex: false }
    );
    this.model = mongoose.model<TDoc<T>>(specs.collectionName, schema);
    this.modelPk = specs.primaryKey;
  }

  private toT(tdoc: TDoc<T> | null): T | null {
    if (!tdoc) return null;
    let model = tdoc.toJSON();
    model = applyDatesToAppModel(model, this.dateProxies);
    return omit(model, mongooseExtras) as T;
  }

  protected checkIsNew(model: any){
      return !model[this.modelPk]
  }

  public async getSingle(id: string | null = null): Promise<T | null> {
    if (!id) return null;
    const instance = await this.model.findById(id, () =>
      handleError("An error while getting single doc", { id })
    );
    return this.toT(instance);
  }

  protected async getMultiple(filters: any): Promise<T[]> {
    const instances = (await this.model.find(filters)) as TDoc<T>[];
    return instances.map(i => this.toT(i) as T);
  }

  public async save(toSave: any): Promise<T | null> {
    const saveModel = removeDatesFromAppModel(toSave, this.dateProxies);
    const pk = saveModel[this.modelPk];
    if (pk) return await this.updateDoc(pk, saveModel);
    else {
      const newDoc: any = new this.model(saveModel);
      newDoc[this.modelPk] = newDoc._id;
      return await this.createDoc(newDoc);
    }
  }

  private async createDoc(toSave: TDoc<T>): Promise<T | null> {
    return new Promise(resolve => {
      toSave
        .save()
        .then(doc => resolve(this.toT(doc)))
        .catch(err => {
          handleError("caught error while creating", {
            toSave
          })(err);
          resolve(null);
        });
    });
  }

  private async updateDoc(id: string, update: T): Promise<T | null> {
    return new Promise(async resolve => {
      const promise = this.model.findByIdAndUpdate(id, { ...update }, err => {
        if (err) {
          handleError("caught error while updating", { id, update })(err);
          resolve(null);
        } else {
          promise.then((doc: TDoc<T>) => {
            resolve(this.toT(doc));
          });
        }
      });
    });
  }

  public async delete(id: string) {
    try {
      const _id = mongoose.Types.ObjectId(id);
      return new Promise(resolve => {
        this.model.findByIdAndDelete({ _id }).then(() => resolve());
      });
    } catch (err) {
      handleError("caught error while deleting", { id })(err);
      return;
    }
  }
}

function validateRepositorySpecs(specs: dataTypes.IRepositorySpecs) {
  if (!specs) throw "Cannot create collection without specifications";
  const { primaryKey, collectionName, schemaOptions } = specs;
  const tagline = `Error while creating ${collectionName} collection:`;
  if (!primaryKey)
    throw `${tagline} Cannot create collection without primaryKey`;
  if (!schemaOptions[primaryKey])
    throw `${tagline} SchemaOptions do not contain primary key '${primaryKey}'`;
  if (!schemaOptions[primaryKey].required)
    throw `${tagline} Primary Key '${primaryKey}' must be required`;
  const fieldNames = Object.keys(schemaOptions);
  for (let field of fieldNames)
    if (mongooseExtras.includes(field))
      throw `${tagline} Cannot use fieldname '${field}'. Reserved by mongoose.`;

  return true;
}

function handleError(errorMessage: string, args: any = {}) {
  return function errorHandler(error: any, x: any = null) {
    if (error) {
      console.error(errorMessage, {
        ...args,
        error
      });
    }
  };
}

function applyDatesToAppModel(
  inputModel: any,
  dateProxies: dataTypes.IDateProxy[]
) {
  let model = JSON.parse(JSON.stringify(inputModel));
  for (let proxy of dateProxies) {
    if (!model[proxy.nameOfTicksField]) continue;
    const date = new Date();
    date.setTime(model[proxy.nameOfTicksField]);
    model[proxy.nameOfDateField] = date;
    model = omit(model, proxy.nameOfTicksField);
  }
  return model;
}

function removeDatesFromAppModel(
  inputModel: any,
  dateProxies: dataTypes.IDateProxy[]
) {
  let model = JSON.parse(JSON.stringify(inputModel));
  for (let proxy of dateProxies) {
    if (!model[proxy.nameOfDateField]) continue;
    const date = new Date(model[proxy.nameOfDateField]);
    model[proxy.nameOfTicksField] = date.getTime();

    model = omit(model, proxy.nameOfDateField);
  }
  return model;
}

function stripDatesFromSchema(inputOptions: dataTypes.ISchemaOptions) {
  let schemaOptions = JSON.parse(
    JSON.stringify(inputOptions)
  ) as dataTypes.ISchemaOptions;
  const fieldNames = Object.keys(schemaOptions);

  const dateProxies: dataTypes.IDateProxy[] = [];
  const dateProxyOptions: dataTypes.ISchemaOptions = {};

  for (let field of fieldNames) {
    if (schemaOptions[field].type !== schemaValueType.Date) continue;
    const nameOfTicksField = `${field}_toTicks`;
    const newField = JSON.parse(
      JSON.stringify(schemaOptions[field])
    ) as dataTypes.ISchemaOptionField;
    newField.type = schemaValueType.Number;

    dateProxyOptions[nameOfTicksField] = newField;
    dateProxies.push({
      nameOfTicksField,
      nameOfDateField: field
    });
    schemaOptions = omit(schemaOptions, field);
  }

  schemaOptions = {
    ...schemaOptions,
    ...dateProxyOptions
  };

  return {
    schemaOptions,
    dateProxies
  };
}

export default RepositoryBase;
