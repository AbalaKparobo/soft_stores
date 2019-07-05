const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

// exports.postAddProduct = (req, res, next) => {
//   const title = req.body.title;
//   const image = req.file;
//   const price = req.body.price;
//   const description = req.body.description;
//   if (!image) {
//     return res.status(422).render('admin/edit-product', {
//       pageTitle: 'Add Product',
//       path: '/admin/add-product',
//       editing: false,
//       hasError: true,
//       product: {
//         title: title,
//         price: price,
//         description: description
//       },
//       errorMessage: 'Attached file is not an image.',
//       validationErrors: []
//     });
//   }
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     console.log(errors.array());
//     return res.status(422).render('admin/edit-product', {
//       pageTitle: 'Add Product',
//       path: '/admin/add-product',
//       editing: false,
//       hasError: true,
//       product: {
//         title: title,
//         imageUrl: imageUrl,
//         price: price,
//         description: description
//       },
//       errorMessage: errors.array()[0].msg,
//       validationErrors: errors.array()
//     });
//   }

//   const imageUrl = image.path;

//   const product = new Product({
//     // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
//     title: title,
//     price: price,
//     description: description,
//     imageUrl: imageUrl,
//     userId: req.user
//   });
//   product
//     .save()
//     .then(result => {
//       // console.log(result);
//       console.log('Created Product');
//       res.redirect('/admin/products');
//     })
//     .catch(err => {
//       // return res.status(500).render('admin/edit-product', {
//       //   pageTitle: 'Add Product',
//       //   path: '/admin/add-product',
//       //   editing: false,
//       //   hasError: true,
//       //   product: {
//       //     title: title,
//       //     imageUrl: imageUrl,
//       //     price: price,
//       //     description: description
//       //   },
//       //   errorMessage: 'Database operation failed, please try again.',
//       //   validationErrors: []
//       // });
//       // res.redirect('/500');
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image) {
    return res.send("deal with this error and next(error) here!")
  }
  const product = new Product({
      title: title,
      imageUrl: image.path,
      price: price,
      description: description,
      userId: req.user
    });
  return product.save()
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      // console.log(err);
      const error = new Error('Error creating new product');
      error.httpStatusCode = 500;
      next(error);
    });  
};

exports.getProducts = (req, res, next) => {
  const userId = req.user._id;
  Product.find({userId: userId})
    .then(products => {
      // console.log(products);
      res.render('admin/product-list', {
        prods: products,
        pageTitle: 'Online Shop/Admin Products',
        path: '/admin/products'
      });
    })
     .catch(err => {
       console.log(err);
      const error = new Error('Error getting products from the database');
      error.httpStatusCode = 500;
      next(error);
    });
  }
  

exports.getEditProduct = (req, res, next) => {
  const editing = req.query.edit;
  if(!editing){
    return req.redirect('/admin/products')
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then(product => {
      res.render('admin/edit-product', {
        editing: editing,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        product : product
      });  
    })
    .catch(err => {
      const error = new Error('Error getting edit product page');
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const id =  req.body.productId;

  Product.findById(id)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if(image) {
        product.imageUrl = image.path;
      }
      return product.save()
        .then(result => {
          console.log(`Updated product in DB ${result}`);
          res.redirect('/admin/products');
        })
    })
    .catch(err => {
      const error = new Error('Error editing product');
      error.httpStatusCode = 500;
      next(error);
    });  
}


exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({_id: productId, userId: req.user._id})
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error('Error deleting product');
      error.httpStatusCode = 500;
      next(error);
    });  
  }
