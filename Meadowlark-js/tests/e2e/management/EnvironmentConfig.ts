// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import path from 'path';

import { DockerComposeEnvironment, StartedDockerComposeEnvironment } from 'testcontainers';

let environment: StartedDockerComposeEnvironment;
export function getEnvironment(): StartedDockerComposeEnvironment {
  return environment;
}

export async function configure(_config: any) {
  const composeFilePath = path.resolve(__dirname, '../automation-setup/');
  const composeFile = 'docker-compose.yml';
  environment = await new DockerComposeEnvironment(composeFilePath, composeFile).up();
}
