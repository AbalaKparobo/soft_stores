const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;
  const product = new Product(title, imageUrl, price, description, null, userId);
  product.save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));  
};

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
    .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const id =  req.body.productId;
  const userId = req.user._id;
  const product =new Product(title, imageUrl, price, description, id, userId);
    product.save()
      .then(result => {
        // console.log(result);
        res.redirect('/admin/products');
    })
      .catch(err => {
        console.log(`Update product error \n ${ err}`)
    })
}


exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteById(productId)
    .then(() => {
      res.redirect('/admin/products')
    })
  .catch(err => console.log(err));
  }
