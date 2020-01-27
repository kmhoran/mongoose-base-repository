import schemaValueTypes from './schemaValueTypes';
import { omit } from 'lodash';

// extra properties mongoose tacks onto saved objects
export const mongooseExtras = ['_id', '__v', 'id'];

export function validateRepositorySpecs(specs: dataTypes.IRepositorySpecs) {
  if (!specs) throw new Error('Cannot create collection without specifications');
  const { primaryKey, collectionName, schemaOptions } = specs;
  const tagline = `Error while creating ${collectionName} collection:`;
  if (!primaryKey) throw new Error(`${tagline} Cannot create collection without primaryKey`);
  if (!schemaOptions[primaryKey])
    throw new Error(`${tagline} SchemaOptions do not contain primary key '${primaryKey}'`);
  if (!schemaOptions[primaryKey].required) throw new Error(`${tagline} Primary Key '${primaryKey}' must be required`);
  const fieldNames = Object.keys(schemaOptions);
  for (const field of fieldNames)
    if (mongooseExtras.includes(field))
      throw new Error(`${tagline} Cannot use fieldname '${field}'. Reserved by mongoose.`);

  return true;
}

export function handleError(errorMessage: string, args: any = {}) {
  return function errorHandler(error: any, x: any = null) {
    if (error) {
      console.error(errorMessage, {
        ...args,
        error,
      });
    }
  };
}

export function applyDatesToAppModel(inputModel: any, dateProxies: dataTypes.IDateProxy[]) {
  let model = JSON.parse(JSON.stringify(inputModel));
  for (const proxy of dateProxies) {
    if (!model[proxy.nameOfTicksField]) continue;
    const date = new Date();
    date.setTime(model[proxy.nameOfTicksField]);
    model[proxy.nameOfDateField] = date;
    model = omit(model, proxy.nameOfTicksField);
  }
  return model;
}

export function removeDatesFromAppModel(inputModel: any, dateProxies: dataTypes.IDateProxy[]) {
  let model = JSON.parse(JSON.stringify(inputModel));
  for (const proxy of dateProxies) {
    if (!model[proxy.nameOfDateField]) continue;
    const date = new Date(model[proxy.nameOfDateField]);
    model[proxy.nameOfTicksField] = date.getTime();

    model = omit(model, proxy.nameOfDateField);
  }
  return model;
}

export function stripDatesFromSchema(inputOptions: dataTypes.ISchemaOptions) {
  let schemaOptions = JSON.parse(JSON.stringify(inputOptions)) as dataTypes.ISchemaOptions;
  const fieldNames = Object.keys(schemaOptions);

  const dateProxies: dataTypes.IDateProxy[] = [];
  const dateProxyOptions: dataTypes.ISchemaOptions = {};

  for (const field of fieldNames) {
    if (schemaOptions[field].type !== schemaValueTypes.Date) continue;
    const nameOfTicksField = `${field}_toTicks`;
    const newField = JSON.parse(JSON.stringify(schemaOptions[field])) as dataTypes.ISchemaOptionField;
    newField.type = schemaValueTypes.Number;

    dateProxyOptions[nameOfTicksField] = newField;
    dateProxies.push({
      nameOfTicksField,
      nameOfDateField: field,
    });
    schemaOptions = omit(schemaOptions, field);
  }

  schemaOptions = {
    ...schemaOptions,
    ...dateProxyOptions,
  };

  return {
    schemaOptions,
    dateProxies,
  };
}
