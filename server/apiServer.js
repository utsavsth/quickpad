const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const uri =
  'mongodb+srv://admin:admin@cluster0.x7lvb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const app = express();
let corsOptions = {
  origin: '*',
  method: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
//app.use(cors);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;
const database = 'cqu_assignment3';
const docs = 'quickpad';

// Global for general use
let currCollection;

client.connect((err) => {
  currCollection = client.db(database).collection(docs);
  // perform actions on the collection object
  console.log('Database up!');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/getData', cors(corsOptions), (req, res) => {
  currCollection
    .find()
    .toArray()
    .then((results) => {
      res.setHeader('content-type', 'application/json');
      res.send(results);
    })
    .catch((error) => console.error(error));
});

app.post('/saveDoc', cors(corsOptions), (req, res) => {
  let data = JSON.parse(req.body.foo);

  console.log(`request body: ${JSON.stringify(data)}`);
  currCollection
    .insertOne(data)
    .then((result) => {
      res.setHeader('content-type', 'application/json');
      res.send(result);
    })
    .catch((error) => {
      console.error(error);
      res.send(error);
    });
});

app.post('/saveDocs', cors(corsOptions), (req, res) => {
  console.log(`request body: ${JSON.stringify(req.body.foo)}`);
  let data = JSON.parse(req.body.foo);
  currCollection
    .insertMany(data)
    .then((result) => {
      res.setHeader('content-type', 'application/json');
      res.send(result);
    })
    .catch((error) => {
      console.error(error);
      res.setHeader('content-type', 'application/json');
      res.send(error);
    });
});

app.delete('/deleteAllDocs', cors(corsOptions), (req, res) => {
  currCollection
    .deleteMany({})
    .then((result) => {
      res.setHeader('content-type', 'application/json');
      res.send(result);
    })
    .catch((error) => {
      console.error(error);
      res.setHeader('content-type', 'application/json');
      res.send(error);
    });
});

async function run(docs) {
  try {
    await client.connect();
    const db = client.db(database);
    let currCollection = db.collection(docs);

    const query = { name: 'Ribeira Charming Duplex' };
    const cursor = currCollection.find();
    const data = await cursor.toArray();
    console.log(data);
    return data;
  } finally {
    //await client.close();
  }
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
