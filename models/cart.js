const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'db', 'cart.json');

module.exports = class Cart {
    static addProduct(id, prodPrice) {
    fs.readFile(filePath, (err, fileContent) => {
        let cart = {products: [], totalPrice: 0}
        
        if(!err) {
            cart = JSON.parse(fileContent);
        }
        const existingProdindex = cart.products.findIndex(p => p.id === id);
        const existingProd = cart.products[existingProdindex];
        console.log(existingProd);
        let updatedProd;
        if(existingProd) {
            updatedProd = {...existingProd};
            updatedProd.qty += 1;
            cart.products = [...cart.products];
            cart.products[existingProdindex] = updatedProd;
        } else {
            updatedProd = {id: id, qty: 1};
            cart.products = [...cart.products, updatedProd];
        }
        cart.totalPrice += +prodPrice;
        fs.writeFile(filePath, JSON.stringify(cart), err => {
            console.log(err);
        })
    });
    }

    
    static deleteProduct(id, price) {
        fs.readFile(filePath, (err, fileContent) => {
            if(err) {
                return
            }
            const cart = JSON.parse(fileContent);
            const spreadCart = {...cart};
            const product = spreadCart.products.find(p => p.id === id);
            if(!product) {
                return
            }
            const qty = product.qty;
            let updatedCart = {};
            updatedCart.products = spreadCart.products.filter(p => p.id !== id);
            updatedCart.totalPrice = spreadCart.totalPrice - (price * qty); 
            fs.writeFile(filePath, JSON.stringify( updatedCart), err => {
                console.log(err);
            })
        });
    }

    static getAllCart(cb) {
        fs.readFile(filePath, (err, fileContent) => {
            let cart;
            if(err){
                cart = null;
            } else {
                cart = JSON.parse(fileContent);
            }
            cb(cart);
        });
    }
}