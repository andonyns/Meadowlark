const request = require('supertest');

let token: string;


describe('should create education content', function () {

  beforeAll(async function () {
    const clientId = "meadowlark_key_1";
    const clientSecret = "meadowlark_secret_1";

    const response = await request("http://localhost:3000")
      .post('/local/api/oauth/token')
      .send({
        "grant_type": "client_credentials",
        "client_id": clientId,
        "client_secret": clientSecret
      });

    token = response.body.access_token;

  });

  it('should create ', async function () {
    const response = await request("http://localhost:3000")
      .post(`/local/v3.3b/ed-fi/contentClassDescriptors`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        "codeValue": "Presentation",
        "shortDescription": "Presentation",
        "description": "Presentation",
        "namespace": "uri://ed-fi.org/ContentClassDescriptor"
      })
      .expect(200);

    const location = response.headers[ 'location' ];

    if (!location) {
      throw "Location not found";
    }

    const locatorByDescriptor = await request("http://localhost:3000")
      .get(location)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const contentClassDescriptor = locatorByDescriptor.body.namespace + "#" + locatorByDescriptor.body.description;

    const educationContent = await request("http://localhost:3000")
      .post('/local/v3.3b/ed-fi/educationContents')
      .set("Authorization", `Bearer ${token}`)
      .send({
        "contentIdentifier": `1fae${Math.floor(Math.random() * 100)}`,
        "namespace": "43210",
        "shortDescription": "ShortDesc",
        "contentClassDescriptor": contentClassDescriptor,
        "learningResourceMetadataURI": "uri://ed-fi.org/fake-uri"
      })
      .expect(201);

    const educationContentLocation = educationContent.headers[ 'location' ];

    if (!educationContentLocation) {
      throw "Location not found";
    }

    request("http://localhost:3000").get(location).set("Authorization", `Bearer ${token}`).expect(200);

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
  })

});
