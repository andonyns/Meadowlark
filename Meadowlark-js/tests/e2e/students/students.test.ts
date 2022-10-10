// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import {accessToken, baseURLRequest} from "../SharedFunctions";

describe('Students', () => {
  it('should fail with invalid country descriptor', () => {
    baseURLRequest
      .post('/v3.3b/ed-fi/students')
      .auth(accessToken, {type: 'bearer'})
      .send({
        "studentUniqueId": "s0zf6d1123d3e",
        "firstName": "Hello",
        "lastSurname": "World",
        "birthDate": "2001-01-01",
        "birthCountryDescriptor": "uri://ed-fi.org/CountryDescriptor#AD3"
      })
      .expect(400)
      .then(response => {
        expect(response.body.message).toContain('Resource CountryDescriptor is missing identity')
      });


  });

});
