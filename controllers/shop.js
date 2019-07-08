const fs = require('fs');
const path = require('path');
const PDFDoc = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/orders')

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalPage, totalItems;
  Product.find()
    .countDocuments()
    .then(totalprods => {
      totalItems = totalprods;
      totalPage = Math.ceil(totalprods / ITEMS_PER_PAGE);
       return Product.find() 
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
    })
  .then((productsArr) => {
    res.render('shop/index', {
      prods: productsArr,
      pageTitle: 'Shop',
      path: '/',currentPage: page,
      hasPrev: page > 1,
      hasNext: (page * ITEMS_PER_PAGE) < totalItems,
      nextPage: page + 1,
      prevPage: page - 1,
      totalProducts: totalItems,
      lastPage: totalPage
    });
  })
  .catch(err => {
    const error = new Error('Error getting home page');
    error.httpStatusCode = 500;
    next(error);
  });
}

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalPage, totalItems;
  Product.find()
    .countDocuments()
    .then(totalprods => {
      totalItems = totalprods;
      totalPage = Math.ceil(totalprods / ITEMS_PER_PAGE);
       return Product.find() 
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
    })  
    .then((productsArr) => {
      res.render('shop/product-list', {
        prods: productsArr,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasPrev: page > 1,
        hasNext: (page * ITEMS_PER_PAGE) < totalItems,
        nextPage: page + 1,
        prevPage: page - 1,
        totalProducts: totalItems,
        lastPage: totalPage
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
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Error deleting items from cart');
      error.httpStatusCode = 500;
      next(error);
    });
}


exports.getCheckout = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    let total = 0;
    const products = user.cart.items; 
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    })
    res.render('shop/checkout', {
      path: '/checkoutt',
      pageTitle: 'Checkout',
      products: products,
      totalSum: total
    });
  })
  .catch(err => {
  const error = new Error('Error getting cart page');
  error.httpStatusCode = 500;
  next(error);
});
};

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
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized User, Access Denied'));
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    const pdfdoc = new PDFDoc();
    pdfdoc.pipe(fs.createWriteStream(invoicePath));
    pdfdoc.pipe(res);
    pdfdoc.fontSize(20).text('Invoice', {underline: true});
    pdfdoc.text('  ');
    let totalPrice = 0;
    order.items.forEach(prod => {
      pdfdoc.fontSize(14).text(`${prod.product.title} - price per unit: ${prod.product.price} - qty: prod.quantity | total(per product): ${prod.product.price*prod.quantity}`)
      totalPrice += (prod.product.price*prod.quantity);
    pdfdoc.text('  ')
    })
    pdfdoc.text('---------');
    pdfdoc.text(`Total = ${totalPrice}`);

    pdfdoc.end()

    // fs.readFile(invoicePath, (err, data) => {
    //   if(err){
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    //   return res.send(data);
    // })
    // const streamFile = fs.createReadStream(invoicePath);
    // return streamFile.pipe(res);
  })
  .catch(err => next(new Error('No Order Found!')));
}
