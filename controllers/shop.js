const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/orders')

exports.getIndex = (req, res, next) => {
  Product.find()
  .then((productsArr) => {
    res.render('shop/index', {
      prods: productsArr,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => {
    const error = new Error('Error getting home page');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((productsArr) => {
      res.render('shop/product-list', {
        prods: productsArr,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error('Error getting products page');
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.getProductDetail = (req, res, next) => {
  let productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-details', {
              pageTitle: `Online Shop/${product.title}`,
              product: product,
              path: '/product/details'
            })
  })
  .catch(err => {
    const error = new Error('Error getting product details page');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items; 
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Cart',
        products: products
      });
    })
    .catch(err => {
    const error = new Error('Error getting cart page');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
    res.redirect('/cart');
    })
    .catch(err => {
    const error = new Error('Error adding items to cart');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.deleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteCartItem(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error('Error deleting items from cart');
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.postOrder = (req,res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    let orderTotal = 0;
    const order = new Order({
      user:{
        userId: req.user._id,
        email: req.user.email
    },
    items: user.cart.items.map(i => {
      return {
          quantity: i.quantity,
          product: {
            title: i.productId.title,
            productId: i.productId._id,
            price: i.productId.price
          }
        }
      })
    })
    return order.save()
  })
  .then(result => {
    return req.user.clearCart()
  })
  .then(result => {
    res.redirect('/orders')
  })
  .catch(err => {
    const error = new Error('Error creating new order');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    }
  )
  .catch(err => {
    const error = new Error('Error getting orders page');
    error.httpStatusCode = 500;
    next(error);
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoice', invoiceName);
  Order.findById(orderId)
  .then(order => {
    if(!order) {
      return next(new Error('Order is Empty!'));
    }
    // console.log('we got here first');
    if(order.user._id.toString() === req.user._id.tostring()) {
    console.log('we got here first');
      fs.readFile(invoicePath, (err, data) => {
        if(err){
          return next(err);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        return res.send(data);
      })
    }
    console.log("wrong unauthorized user, access denied")
    return next(new Error('Unauthorized User, Access Denied'));
    // console.log('we got here');

  })
  .catch(err => next(new Error('No Order Found!')));
}

// // exports.getCheckout = (req, res, next) => {
// //     res.render('shop/checkout', {
// //       path: '/checkout',
// //       pageTitle: 'Checkout'
// //     })
// // };
