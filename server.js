require('dotenv').config();
require('./lib/client').connect();

const app = require('./lib/app');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Helloooooo World!')
})

// app.get('/cocktails', (req, res) => {//listening for a GET request on /cocktails url => a defined end-point or route
//   console.log('hello');
//   const cocktails = [
//     {
//       name: 'gin-and-juicey'
//     },
//     {
//       name: 'jack-and-coke'
//     },
//     {
//       name: 'dirty-martini'
//     }
//   ];

//   res.json(cocktails);//responds with some json
// });

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});
