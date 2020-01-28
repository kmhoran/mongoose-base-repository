# Mongoose Repository Base

Extensible repository interface for MongoDB powered by Mongoose. 

[![Build Status](https://travis-ci.org/kmhoran/mongoose-base-repository.svg?branch=master)](https://travis-ci.org/kmhoran/mongoose-base-repository)
[![npm version](https://badge.fury.io/js/mongoose-base-repo.svg)](https://badge.fury.io/js/mongoose-base-repo)

## Installation

First install [Node.js](https://nodejs.org/en/), and [MongoDB](https://www.mongodb.com/)

``` sh
$ npm i mongoose-base-repo
```

or

``` sh
$ yarn add mongoose-base-repo
```

## Usage

### DB Connect

First off we will need to establish a connection with the MongoDB server. Use `dbConnect` to create that connection.

``` ts
import { dbConnect } from "mongoose-base-repo";

await dbConnect('mongodb://localhost:27017', 'myDatabaseName');

```

DbConect can only connect to a single database. If the connection is lost, the base repository will automatically attempt to re-esablish the connection. 

See [Mongoose](https://github.com/Automattic/mongoose/blob/master/README.md#connecting-to-mongodb) for more information on Connection considerations.

### Repository Base

Creating a repository is as simple as extending the `RepositoryBase<T>` class where `T` is the interface of the app-level model. Here we export an *EventRepo* as a singleton:

``` ts
import { RepositoryBase } from "mongoose-base-repo";
import eventRepoConfig from "./config";

// app-level model returned by Get and Save methods
interface IEvent {
  eventId: string;
  eventName: string;
  eventDate: Date;
}

class EventRepo extends RepositoryBase<IEvent> {
  private static exists: boolean = false;
  private static instance: EventRepo;

  constructor() {
    super(eventRepoConfig);
    if (EventRepo.exists) return EventRepo.instance;
    EventRepo.exists = true;
    EventRepo.instance = this;
  }
}

export default new EventRepo();
```
The RepositoryBase constuctor requires a config object that specifies collection meta data and Schema details.

``` ts
import { schemaValueTypes as type } from "mongoose-base-repo";

const schemaOptions = {
  eventId: { type: type.String, required: true },
  eventName: { type: type.String, required: true },
  eventDate: { type: type.Date, required: true }
};

// required config object
const config = {
  collectionName: "Events",
  primaryKey: "eventId",
  schemaOptions
};

export default config;
```

The config defines three fields:

Field | Description
--- | ---
**collectionName** | The name of the collection that will live in MongoDB
**primaryKey** | The field that will be set to the auto-generated `_id` value
**schemaOptions** | A JSON object used to build the schema. Here `type` is the only necessary value. The primaryKey is expected to be set to `required: true`
