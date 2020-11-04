require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all cocktails', async () => {

      const expectation = [
        {
          id: 1,
          name: 'gin_and_juicey',
          strength: 7,
          alcohol_type: 'gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 2,
          name: 'dirty_martini',
          strength: 9,
          alcohol_type: 'gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 3,
          name: 'gin_fizz',
          strength: 8,
          alcohol_type: 'gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 4,
          name: 'mulled_gin_punch',
          strength: 8,
          alcohol_type: 'gin',
          hot_drink: true,
          owner_id: 1
        },
        {
          id: 5,
          name: 'jack_and_coke',
          strength: 6,
          alcohol_type: 'whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 6,
          name: 'whiskey_ginger',
          strength: 6,
          alcohol_type: 'whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 7,
          name: 'whiskey_sour',
          strength: 8,
          alcohol_type: 'whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 8,
          name: 'hot_toddy',
          strength: 7,
          alcohol_type: 'whiskey',
          hot_drink: true,
          owner_id: 1
        },
        {
          id: 9,
          name: 'aperol_spritz',
          strength: 6,
          alcohol_type: 'aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 10,
          name: 'fernet_and_coke',
          strength: 8,
          alcohol_type: 'aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 11,
          name: 'hugo',
          strength: 6,
          alcohol_type: 'aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 12,
          name: 'hot_vermouth_tea',
          strength: 5,
          alcohol_type: 'aperitivo',
          hot_drink: true,
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/cocktails')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns a single cocktail', async () => {
      const expectation = {
        id: 3,
        name: 'gin_fizz',
        strength: 8,
        alcohol_type: 'gin',
        hot_drink: false,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/cocktails/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a cocktail to the database and returns it', async () => {
      const expectation = {
        id: 13,
        name: 'negroni',
        strength: 9,
        alcohol_type: 'aperitivo',
        hot_drink: false,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/cocktails')
        .send({
          name: 'negroni',
          strength: 9,
          alcohol_type: 'aperitivo',
          hot_drink: false,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allCocktails = await fakeRequest(app)
        .get('/cocktails')//returns data
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allCocktails.body.length).toEqual(13);//use .length since endpoint adds a new row to see the data has been added to the array
    });

    test('updates a cocktail with id 1 to the database and returns it', async () => {

      const updatedCocktail = {
        id: 1,
        name: 'gin_and_juicey',
        strength: 8,
        alcohol_type: 'gin',
        hot_drink: false,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put('/cocktails/1')
        .send(updatedCocktail)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(updatedCocktail);
    });

    test.only('deletes a cocktail with id 1 from the database and returns the new array', async () => {

      const expectation = {
        id: 2,
        name: 'dirty_martini',
        strength: 9,
        alcohol_type: 'gin',
        hot_drink: false,
        owner_id: 1
      };

      const deletedCocktail = await fakeRequest(app)
        .delete('/cocktails/2')
        .expect('Content-Type', /json/)
        .expect(200);

      const allCocktails = await fakeRequest(app)
        .get('/cocktails')//returns data
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deletedCocktail.body).toEqual(expectation);
      expect(allCocktails.body.length).toEqual(11);
    });
  });
});
