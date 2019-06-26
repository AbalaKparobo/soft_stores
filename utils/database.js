const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const dbUrl = 'mongodb+srv://abalakparobo:pVY4MkBJ0WLYwsa0@cluster0-tpf7s.mongodb.net/shop?retryWrites=true&w=majority';



const mongoConnect = cb => {
    MongoClient.connect( dbUrl )
      .then(client => {
        console.log('Database Connection Completed');
        _db = client.db();
        cb();
      })
      .catch(err => {
        console.log("Database connection issue" + err);
        // throw err;
      });
  };

  const getDb = () => {
    if (_db) {
      return _db;
    }
    throw 'No Database Conection Found!';
  };

exports.mongoConnect = mongoConnect

exports.getDb = getDb;
