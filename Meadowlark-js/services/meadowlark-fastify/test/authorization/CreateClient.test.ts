// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import type { FastifyInstance, InjectOptions } from 'fastify';
import * as AuthorizationServer from '@edfi/meadowlark-authz-server';
import { buildService } from '../../src/Service';

jest.setTimeout(40000);

const createClientRequest: InjectOptions = {
  method: 'POST',
  url: '/local/oauth/client',
  headers: { authorization: 'bearer 1234', 'content-type': 'application/json' },
  payload: `{
    "clientName": "Hometown SIS",
    "roles": [
      "vendor",
      "assessment"
    ]
  }`,
};

describe('given a POST to create a new client', () => {
  let mockUpsert: any;
  let service: FastifyInstance;

  beforeAll(async () => {
    mockUpsert = jest.spyOn(AuthorizationServer, 'createClient');
    service = buildService();
    await service.ready();

    // Act
    await service.inject(createClientRequest);
  });

  afterAll(async () => {
    await service.close();
    mockUpsert.mockRestore();
  });

  it('should send the expected AuthorizationRequest to Authorization Server', async () => {
    expect(mockUpsert.mock.calls).toHaveLength(1);
    const mock = mockUpsert.mock.calls[0][0];

    expect(mock.body).toMatchInlineSnapshot(`
      "{
          "clientName": "Hometown SIS",
          "roles": [
            "vendor",
            "assessment"
          ]
        }"
    `);
    expect(mock.headers.authorization).toBe('bearer 1234');
    expect(mock.path).toBe('/oauth/client');
    expect(mock.queryParameters).toEqual({});
  });
});