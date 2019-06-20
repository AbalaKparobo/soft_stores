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
  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect('/admin/products');
}

exports.getEditProduct = (req, res, next) => {
  const editing = req.query.edit;
  if(!editing){
    return req.redirect('/admin/products')
  }
  Product.findById(req.params.productId, product => {
    res.render('admin/edit-product', {
      editMode: editing,
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      product : product
    });  
  });
}

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(id, title, imageUrl, description, price);
  product.save();
  res.redirect('/admin/products')
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/product-list', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
}

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.id;
  Product.deleteById(productId);
    res.redirect('/admin/products');
}
