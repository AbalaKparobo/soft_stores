const mongodb =require('mongodb');
const getDb = require("../utils/database").getDb;

class User {
    constructor(id, name, email, cart){
        this._id = id;
        this.name = name;
        this.email = email;
        this.cart = cart;
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users').find({_id: new mongodb.ObjectId(userId)}).next()
          .then(user => {
            return user;
          })
          .catch(err => console.log(err));
    }
    
    save(){
        const db = getDb();
        db.collection('users').insertOne(this)
          .then(result => {
            return result;
          })
          .catch(err => console.log(err));
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => {
            return item.productId
        })
        return db.collection('products').find({_id: {$in: productIds}}).toArray()
          .then(products => {
              return products.map(prod => {
                  return {
                      ...prod, 
                      quantity: this.cart.items.find(item => {
                      return item.productId.toString() == prod._id.toString()
                  }).quantity
                }
              })
          }).then(products => {
            return products;
        }).catch(err => console.log(err))
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        })
        let newQty = 1;
        const updatedCartItems = [...this.cart.items];
        if(cartProductIndex >= 0){
            newQty = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQty; 
        } else {
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: 1 })
        }
        const updatedCart ={ items: updatedCartItems};
        const db = getDb();
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: updatedCart}})
    }
    deleteCartItem(id) {
        const updatedcart = this.cart.items.filter(item => {
            return item.productId.toString() !== id.toString();
        })
        const db = getDb();
        return db.collection("users").updateOne(
            {_id: new mongodb.ObjectId(this._id)},
            {$set: {cart:{items: updatedcart}}});
    }

    
    addOrder() {
        const db = getDb();
        return this.getCart()
        .then(products => {
            const order = {
                items: products,
                user: {
                  _id: this._id,
                  name: this.name,
                  email: this.email
                }
            }
            return db.collection('orders').insertOne(order)
        })
        .then(result => {
            this.cart.items = [];
            return db.collection("users").updateOne(
                {_id: new mongodb.ObjectId(this._id)},
                {$set: {cart:{items: []}}});
        })
        .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders').find({
            'user._id': new mongodb.ObjectId(this._id)
        }).toArray();
    }
}


module.exports = User;