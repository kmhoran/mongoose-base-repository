import mongoose, { Model, Document } from "mongoose";
import { omit } from "lodash";

interface IRepositorySpecs<TDoc extends Document> {
  model: Model<TDoc, any>;
  primaryKey: string;
}

class RepositoryBase<T, TDoc extends Document> {
  private model: Model<TDoc, any>;
  private static readonly mongooseExtras = ["_id", "__v"];

  private modelPk: string;
  constructor(specs: IRepositorySpecs<TDoc>) {
    this.model = specs.model;
    this.modelPk = specs.primaryKey;
  }

  private toT(tdoc: TDoc | null): T | null {
    if (!tdoc) return null;
    return omit(tdoc.toJSON(), RepositoryBase.mongooseExtras) as T;
  }

  public async getSingle(id: string | null = null): Promise<T | null> {
    if (!id) return null;
    const instance = await this.model.findById(id, () =>
      handleError("An error while getting single doc", { id })
    );
    return this.toT(instance);
  }

  protected async getMultiple(filters: any): Promise<T[]> {
    const instances = (await this.model.find(filters)) as TDoc[];
    return instances.map(i => this.toT(i) as T);
  }

  public async save(toSave: any): Promise<T | null> {
    const pk = toSave[this.modelPk];
    if (pk) return await this.updateDoc(pk, toSave);
    else {
      const newDoc: any = new this.model(toSave);
      newDoc[this.modelPk] = newDoc._id;
      return await this.createDoc(newDoc);
    }
  }

  private async createDoc(toSave: TDoc): Promise<T | null> {
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
          promise.then((doc: TDoc) => {
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

export default RepositoryBase;
