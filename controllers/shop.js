const Product = require('../models/product');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');

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
  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-details', {
              pageTitle: `Online Shop/product/${product.dataValues.title}`,
              product: product,
              path: '/product/details'
            })
  })
  .catch(err => {console.log(err)});
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then( cart => {
      cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Cart',
            products: products
          });
        })
        .catch(err => console.log(err));
    })
    .catch( err => console.log(err));
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQty = 1
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: productId}})
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }
      if(product){
        let oldQty = product.cartItem.quantity;
        newQty = oldQty + 1
           return fetchedCart.addProduct(product, { through: {quantity: newQty} });
      }
      return Product.findByPk(productId)
      .then(product => {
        return fetchedCart.addProduct(product, { through: {quantity: newQty} });
      })
      .catch(err => console.log(err))
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
}

exports.deleteCartItem = (req, res, next) => {
  const productId = req.body.id;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where: {id: productId}})
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err));
}

exports.postOrder = (req,res, next) => {
  req.user.getCart()
  .then(cart => {
    return cart.getProducts()
  })
  .then(products => {
    return req.user.createOrder()
      .then(order => {
        return order.addProducts(products.map(product => {
          console.log(product.cartItem);
          console.log("***************");
          console.log(product.orderItem);
          console.log(product.orderItems);
        product.orderItem = {quantity: product.cartItem.quantity};
        return product;
      })
      )
    })
      .catch(err => console.log(err));
  })
  .then(result => {
    res.redirect('/order')
  })
  .catch(err => console.log(err));
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
