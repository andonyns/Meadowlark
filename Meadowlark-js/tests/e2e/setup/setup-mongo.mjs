// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

async function createServer() {
  // This will create an new instance of "MongoMemoryServer" and automatically start it
  mongod = await MongoMemoryServer.create();

  const uri = mongod.getUri();

  process.env.MONGO_URL = uri;
}

async function endServer() {
  await mongod.stop();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
await createServer();
