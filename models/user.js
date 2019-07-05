const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {type: String},
    resetTokenExpiration: {type: Date},
    cart: {
        items: [{
            productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true}
        }]
    }
})

userSchema.methods.addToCart = function(product) {
    const cartItemIndex = this.cart.items.findIndex(cartItem => {
        return cartItem.productId.toString() === product._id.toString()
    })
    let newQty = 1;
    let updatedCartItem = [...this.cart.items]
    if(cartItemIndex >= 0) {
        const oldQty = updatedCartItem[cartItemIndex].quantity;
        updatedCartItem[cartItemIndex].quantity = oldQty + newQty;
    } else {
        updatedCartItem.push({
            productId:  product._id,
            quantity: newQty
        })
    }
    this.cart = {items: updatedCartItem}
    return this.save()
}

userSchema.methods.deleteCartItem = function(prodId) {
    const updatedCart = this.cart.items.filter(item => {
        return prodId.toString() !== item.productId.toString();
    });
    this.cart.items = updatedCart
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('user', userSchema);