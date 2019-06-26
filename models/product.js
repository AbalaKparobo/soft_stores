const mongodb =require('mongodb');
const getDb = require("../utils/database").getDb;

class Product {
    constructor(title, imageUrl, price, description, id, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this._id = id ? new mongodb.ObjectId(id) : null ; 
        this.userId = new mongodb.ObjectId(userId);
    }

    save() {
        const db = getDb();
        let dbOps;
        if(this._id){
          dbOps = db.collection('products').updateOne({_id: this._id}, {$set: this})
        }else{
        dbOps = db.collection('products').insertOne(this)
        }
        return dbOps
          .then(result => {
            // console.log(result);
            res.redirect('/admin/products');
          })
          .catch(err => {console.log(err)
          });
    }

    static findAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
          .then(products => {
              return products
          })
          .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products')
          .find({_id: new mongodb.ObjectId(productId)}).next()
          .then(product => {
            // console.log(product);
            return product;
          })
          .catch(err => console.log(err));
    }

    static deleteById(id) {
      const db =getDb();
      return db.collection('products').deleteOne({_id: new mongodb.ObjectId(id)})
        .then(result => {
          console.log(`Deleted one item \n ${result}`)
        })
    }
}

module.exports = Product;
