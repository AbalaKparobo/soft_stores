const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        product: {type: Object, required: true},
        quantity: {type: Number, required: true}
    }],
    user: {
        userId: {type: mongoose.Schema.ObjectId,ref: 'User', required: true},
        email: {type: String, required: true}
    }
    // total: {type: Number, required: true}
})

module.exports = mongoose.model('Order', orderSchema);