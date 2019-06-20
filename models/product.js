const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const dest = path.join(__dirname, '..', 'db', 'products.json');
const getProductFromFile = (cb) => {
    fs.readFile(dest, (err, fileContent) => {
    if (err) {
        console.log(err);
        return cb([]);
    }
    cb(JSON.parse(fileContent));
});
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductFromFile(product => {
            if(this.id) {
                const existingProductIndex = product.findIndex( prod => prod.id === this.id);   
                let updatedProducts = [...product];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(dest, JSON.stringify(updatedProducts), err => {
                    console.error(err);
                });
            } else {
                this.id = Math.random().toString();    
                product.push(this);
                fs.writeFile(dest, JSON.stringify(product), err => {
                console.error(err);
            });
            }
        })
    }

    static deleteById(id) {

        getProductFromFile(products => {
            const product = products.find(p => p.id === id);
            const productPrice = product.price;
            const updatedProducts = products.filter( prod => prod.id !== id);   
            fs.writeFile(dest, JSON.stringify(updatedProducts), err => {
                if(!err) {
                    Cart.deleteProduct(id, productPrice);
                }
            }); 
        });
    }
    
    static findById(id, cb) {
        getProductFromFile(allproduct => {
            const product = allproduct.find(p => p.id === id);
            cb(product);
        });
    }

    static fetchAll(cb) {
        getProductFromFile(cb)
    }
}