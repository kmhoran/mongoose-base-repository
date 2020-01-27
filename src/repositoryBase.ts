import mongoose, { Schema, Model, Document } from 'mongoose';
import {
  mongooseExtras,
  validateRepositorySpecs,
  handleError,
  applyDatesToAppModel,
  removeDatesFromAppModel,
  stripDatesFromSchema,
} from './utilities';

import { omit } from 'lodash';

type TDoc<T> = Document & T;

class RepositoryBase<T> {
  private model: Model<TDoc<T>, any>;
  private schemaOptions: any;
  private dateProxies: dataTypes.IDateProxy[];

  protected modelPk: string;
  constructor(specs: dataTypes.IRepositorySpecs) {
    validateRepositorySpecs(specs);
    const { schemaOptions, dateProxies } = stripDatesFromSchema(specs.schemaOptions);
    this.dateProxies = dateProxies;
    this.schemaOptions = schemaOptions;

    const schema: Schema = new Schema({ ...this.schemaOptions }, { autoIndex: false });
    this.model = mongoose.model<TDoc<T>>(specs.collectionName, schema);
    this.modelPk = specs.primaryKey;
  }

  private toT(tdoc: TDoc<T> | null): T | null {
    if (!tdoc) return null;
    let model = tdoc.toJSON();
    model = applyDatesToAppModel(model, this.dateProxies);
    return omit(model, mongooseExtras) as T;
  }

  protected checkIsNew(model: any) {
    return !model[this.modelPk];
  }

  public async getSingle(id: string | null = null): Promise<T | null> {
    if (!id) return null;
    const instance = await this.model.findById(id, () => handleError('An error while getting single doc', { id }));
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
          handleError('caught error while creating', {
            toSave,
          })(err);
          resolve(null);
        });
    });
  }

  private async updateDoc(id: string, update: T): Promise<T | null> {
    return new Promise(async resolve => {
      const promise = this.model.findByIdAndUpdate(id, { ...update }, err => {
        if (err) {
          handleError('caught error while updating', { id, update })(err);
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
      handleError('caught error while deleting', { id })(err);
      return;
    }
  }
}

export default RepositoryBase;
