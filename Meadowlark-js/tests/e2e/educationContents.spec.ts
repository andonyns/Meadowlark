import { test, expect } from '@playwright/test';

let token: string;

test.beforeAll(async ({ request }) => {
  const clientId = "meadowlark_key_1";
  const clientSecret = "meadowlark_secret_1";

  const getToken = await request.post('/local/api/oauth/token', {
    headers: {
     "Accept": "application/x-www-form-urlencoded"
    },
    data: {
      "grant_type": "client_credentials",
      "client_id": clientId,
      "client_secret": clientSecret
    }
  });

  const jsonResponse = await getToken.json();
  token = jsonResponse.access_token;

});

test('should create education content', async ({ request }) => {

  const contentClass = await request.post(`/local/v3.3b/ed-fi/contentClassDescriptors`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: {
      "codeValue": "Presentation",
      "shortDescription": "Presentation",
      "description": "Presentation",
      "namespace": "uri://ed-fi.org/ContentClassDescriptor"
    }
  });
  expect(contentClass.ok()).toBeTruthy();

  let location = contentClass.headers().location;

  if(!location) {
    throw "Location not found";
  }

  const locatorByDescriptor = await request.get(location, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  expect(locatorByDescriptor.ok()).toBeTruthy();

  let responseJson = await locatorByDescriptor.json();
  const contentClassDescriptor = responseJson["namespace"]+"#"+responseJson["description"];

  const educationContent = await request.post('/local/v3.3b/ed-fi/educationContents', {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: {
      "contentIdentifier": `1fae${Math.floor(Math.random() * 100)}`,
      "namespace": "43210",
      "shortDescription": "ShortDesc",
      "contentClassDescriptor": contentClassDescriptor,
      "learningResourceMetadataURI": "uri://ed-fi.org/fake-uri"
    }
  });

  expect(educationContent.statusText()).toEqual("Created");

  let educationContentLocation = contentClass.headers().location;

  if(!educationContentLocation) {
    throw "Location not found";
  }

  const educationContentByLocation = await request.get(location, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  expect(educationContentByLocation.ok()).toBeTruthy();

  // const deleteDescriptorLocation = await request.delete(location, {
  //   headers: {
  //     "Authorization": `Bearer ${token}`
  //   }
  // });

  // // expect(deleteDescriptorLocation.statusText()).toEqual("No Content");

  // const deleteEducationContentByLocation = await request.delete(educationContentLocation, {
  //   headers: {
  //     "Authorization": `Bearer ${token}`
  //   }
  // });

  // expect(deleteEducationContentByLocation.statusText()).toEqual("No Content");

});
