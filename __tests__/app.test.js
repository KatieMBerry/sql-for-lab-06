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
          name: 'Gin and Juicey',
          strength: 7,
          type: 'Gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 2,
          name: 'Dirty Martini',
          strength: 9,
          type: 'Gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 3,
          name: 'Gin Fizz',
          strength: 8,
          type: 'Gin',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 4,
          name: 'Mulled Gin Punch',
          strength: 8,
          type: 'Gin',
          hot_drink: true,
          owner_id: 1
        },
        {
          id: 5,
          name: 'Jack and Coke',
          strength: 6,
          type: 'Whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 6,
          name: 'Whiskey Ginger',
          strength: 6,
          type: 'Whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 7,
          name: 'Whiskey Sour',
          strength: 8,
          type: 'Whiskey',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 8,
          name: 'Hot Toddy',
          strength: 7,
          type: 'Whiskey',
          hot_drink: true,
          owner_id: 1
        },
        {
          id: 9,
          name: 'Aperol Spritz',
          strength: 6,
          type: 'Aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 10,
          name: 'Fernet and Coke',
          strength: 8,
          type: 'Aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 11,
          name: 'Hugo',
          strength: 6,
          type: 'Aperitivo',
          hot_drink: false,
          owner_id: 1
        },
        {
          id: 12,
          name: 'Hot Vermouth Tea',
          strength: 5,
          type: 'Aperitivo',
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
        name: 'Gin Fizz',
        strength: 8,
        type: 'Gin',
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
        name: 'Negroni',
        strength: 9,
        alcohol_id: 3,
        hot_drink: false,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/cocktails')
        .send({
          name: 'Negroni',
          strength: 9,
          alcohol_id: 3,
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
        name: 'Gin and Juicey',
        strength: 8,
        alcohol_id: 1,
        hot_drink: false,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put('/cocktails/1')
        .send(updatedCocktail)
        .expect('Content-Type', /json/)
        .expect(200);
      await fakeRequest(app)
        .get('/cocktails/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(updatedCocktail);
    });

    test.only('deletes a cocktail with id 1 from the database and returns the deleted item', async () => {

      const expectation = {
        id: 2,
        name: 'Dirty Martini',
        strength: 9,
        alcohol_id: 1,
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
