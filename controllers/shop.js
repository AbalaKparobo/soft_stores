const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then((productsArr) => {
    res.render('shop/index', {
      prods: productsArr,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((productsArr) => {
      res.render('shop/product-list', {
        prods: productsArr,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getProductDetail = (req, res, next) => {
  let productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-details', {
              pageTitle: `Online Shop/product/${product.title}`,
              product: product,
              path: '/product/details'
            })
  })
  .catch(err => {console.log(err)});
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Cart',
        products: products
      });
    })
    .catch( err => console.log(err));
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
    .catch(err => console.log(err));
}

exports.deleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  console.log(productId)
  req.user.deleteCartItem(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err));
}

exports.postOrder = (req,res, next) => {
  req.user.addOrder()
  .then(result => {
    res.redirect('/orders')
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    }
  ).catch(err => console.log(err));
};

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//       path: '/checkout',
//       pageTitle: 'Checkout'
//     })
// };
