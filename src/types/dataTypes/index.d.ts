declare module dataTypes {
  export interface IRepositorySpecs {
    collectionName: string;
    primaryKey: string;
    schemaOptions: any;
  }

  export interface ISchemaOptions {
    [filedName: string]: ISchemaOptionField;
  }

  export interface ISchemaOptionField {
    type: string;
    required: boolean;
    unique?: boolean;
  }

  export interface IDateProxy {
    nameOfTicksField: string;
    nameOfDateField: string;
  }

  export interface IChangeTrackable{
      dateCreatedUTC?: Date;
      dateLastModifiedUTC?: Date;
      lastModifieByUserId?: string;
  }
}
