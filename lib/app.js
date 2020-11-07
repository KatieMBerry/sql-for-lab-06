const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cocktails', async (req, res) => {//endpoints live in App.js
  try {
    const data = await client.query(`
        SELECT 
          cocktails.id, 
          cocktails.name, 
          alcohols.type, 
          cocktails.strength,  
          cocktails.hot_drink,
          cocktails.owner_id
        FROM cocktails
        JOIN alcohols
        ON alcohols.id = cocktails.alcohol_id
        ORDER BY  cocktails.id ASC
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }

}); app.get('/alcohols', async (req, res) => {
  try {
    const data = await client.query('SELECT * from alcohols');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/cocktails/:id', async (req, res) => {//endpoint to get a single cocktail; we sent id from FE to BE thru req.params.id (url)
  try {
    const cocktailId = req.params.id;//gives access to req.params.id

    const data = await client.query(`
        SELECT 
        cocktails.id, 
        cocktails.name, 
        alcohols.type, 
        cocktails.strength,  
        cocktails.hot_drink, 
        cocktails.owner_id
      FROM cocktails
      JOIN alcohols
      ON alcohols.id = cocktails.alcohol_id
      WHERE cocktails.id=$1 
      ORDER BY  cocktails.id ASC
      `, [cocktailId]);//what we pulled from

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ message: e.message });
  }
});

//can use req.body (like form data) & send whole object with POST req from FE to BE
//this will add a new row of data to the table
app.post('/cocktails/', async (req, res) => {//endpoint to post a new cocktail to dbase
  try {
    const newName = req.body.name;
    const newStrength = req.body.strength;
    const newAlcoholId = req.body.alcohol_id;
    const newHotDrink = req.body.hot_drink;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
      INSERT INTO cocktails (name, strength, alcohol_id, hot_drink, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      ORDER BY  cocktails.id ASC
      RETURNING * `, //insert into table with corresponding values

      [newName, newStrength, newAlcoholId, newHotDrink, newOwnerId]);//add these to the cocktail array

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/cocktails/:id', async (req, res) => {//new put route to update existing cocktail table data...
  try {
    //get data from POST body/react form
    const newName = req.body.name;
    const newStrength = req.body.strength;
    const newAlcoholId = req.body.alcohol_id;
    const newHotDrink = req.body.hot_drink;
    const newOwnerId = req.body.owner_id;

    //...in the condition that cocktail = :id
    const data = await client.query(`
      UPDATE cocktails
      SET name = $1,
      strength = $2,
      alcohol_id = $3,
      hot_drink = $4,
      owner_id = $5
      WHERE cocktails.id = $6
      ORDER BY  cocktails.id ASC
      RETURNING *;
    `,
      [newName, newStrength, newAlcoholId, newHotDrink, newOwnerId, req.params.id]);//add these to the cocktail array (puts to the front?)

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/cocktails/:id', async (req, res) => {
  try {
    const cocktailId = req.params.id;

    const data = await client.query(`
      DELETE from cocktails
      WHERE cocktails.id=$1
      ORDER BY  cocktails.id ASC
      RETURNING *
    `,
      [cocktailId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
