const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
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
  headers: 'Origin, X-Requested-With, Content-Type, Accept, X-Test-Header',
  optionsSuccessStatus: 204,
};
app.use(cors());

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
  console.log(new Date());
});

app.get('/redirect', (req, res) => {
  //res.setHeader('X-Redirect', 'notes.html');

  res.set('X-Redirect', 'notes.html');
  res.header(
    'Access-Control-Expose-Headers',
    'Content-Type, Location, X-Redirect'
  );
  res.status(200).send('send');
});

app.get('/getData', (req, res) => {
  let searchText = req.query.search || '';
  let requestHeaders = req.headers;
  console.log(new Date());
  var user = req.get('x-requested-username');

  const query = {
    $and: [
      {
        $or: [
          { title: { $regex: '.*' + searchText + '.*' } },
          { content: { $regex: '.*' + searchText + '.*' } },
        ],
      },
      { author: user },
    ],
  };
  const sort = { modifiedDt: -1 };

  currCollection
    .find(query)
    .sort(sort)
    .toArray()
    .then((results) => {
      res.setHeader('content-type', 'application/json');
      //res.setHeader('Access-Control-Allow-Origin', '*');
      //res.setHeader(
      //  'Access-Control-Allow-Headers',
      // 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, X-Test-Header, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
      //);
      res.send(results);
    })
    .catch((error) => console.error(error));
});

app.get('/getData/:id', (req, res) => {
  var user = req.get('x-requested-username');
  var id = req.params.id;
  console.log(id);
  const query = {
    $and: [{ _id: ObjectId(id) }, { author: user }],
  };

  currCollection
    .find(query)
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

app.put('/saveDoc/:id', (req, res) => {
  var user = req.get('x-requested-username');
  var id = req.params.id;
  let data = JSON.parse(req.body.foo);
  console.log('put method: ' + id);
  const filter = {
    $and: [{ _id: ObjectId(id) }, { author: user }],
  };
  const update = {
    $set: { title: data.title, content: data.content, modifiedDt: new Date() },
  };

  currCollection
    .update(filter, update)
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
