const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
}

exports.getProductDetail = (req, res, next) => {
  let productId = req.params.productId;
  Product.findById(productId, prod => {
    res.render('shop/product-details', {
      pageTitle: prod.title,
      product: prod,
      path: '/product/details'
    });
  });
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
}

exports.getCart = (req, res, next) => {
  Cart.getAllCart(cart => {
    Product.fetchAll(products => {
      const availableProducts = [];
      for(product of products) {
        const cartData = cart.products.find(cartItem => cartItem.id === product.id);
        if(cartData) { 
          availableProducts.push({product: product, qty: cartData.qty});
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Cart',
        products: availableProducts
      });
    });
  });
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, product  => {
    Cart.addProduct(productId, product.price)
    res.redirect('/cart')
  });
}

exports.deleteCartItem = (req, res, next) => {
  const id = req.body.id;
  Product.findById(id, product => {
    Cart.deleteProduct(id, product.price);
    res.redirect('/cart')
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
