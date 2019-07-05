const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/product/:productId', shopController.getProductDetail);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart)

router.post('/delete-cart-item', isAuth, shopController.deleteCartItem);

router.post("/create-order", isAuth, shopController.postOrder)

router.get('/orders', isAuth, shopController.getOrders);

router.get('/order/:orderId', isAuth, shopController.getInvoice);

// // router.get('/checkout', shopController.getCheckout);

module.exports = router;
