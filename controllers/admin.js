const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description, description
  }).then(result => {
    res.redirect('/admin/products')
  }).catch(err => console.log(err));  
};

exports.getEditProduct = (req, res, next) => {
  const editing = req.query.edit;
  if(!editing){
    return req.redirect('/admin/products')
  }
  Product.findOne({WHERE: {id: req.params.productId}})
    .then(product => {
      res.render('admin/edit-product', {
        editMode: editing,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        product : product
      });  
    })
    .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findByPk(id)
    .then(product => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save()
      })
      .then(result => {
        res.redirect('/admin/products')
      })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
    res.render('admin/product-list', {
      prods: products,
      pageTitle: 'Online Shop/Admin Products',
      path: '/admin/products'
    });
  })
   .catch(err => console.log(err));
}

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.id;
  Product.findByPk(productId)
    .then(product => {
      return product.destroy()
      })
      .then(result => {
        console.log(result);
        res.redirect('/admin/products')
      })
    .catch(err => console.log(err));
  }
