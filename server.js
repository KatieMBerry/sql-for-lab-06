require('dotenv').config();
require('./lib/client').connect();

const app = require('./lib/app');
const client = require('./lib/client');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Helloooooo World!');
});


app.get('/cocktails', async (req, res) => {
  try {
    const data = await client.query('SELECT * from cocktails');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});
