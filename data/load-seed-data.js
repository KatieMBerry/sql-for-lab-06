const client = require('../lib/client');
// import our seed data:
const cocktails = require('./cocktails.js');
const alcohols = require('./alcohols.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      alcohols.map(alcohol => {
        return client.query(`
                      INSERT INTO alcohols (type)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [alcohol.type]);
      })
    );

    await Promise.all(
      cocktails.map(cocktail => {
        return client.query(`
                    INSERT INTO cocktails (name, strength, alcohol_id, hot_drink, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
          [cocktail.name, cocktail.strength, cocktail.alcohol_id, cocktail.hot_drink, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }
}
