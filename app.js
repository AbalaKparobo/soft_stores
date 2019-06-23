const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./utils/database');
const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');
const Product = require('./models/product');
const CartItem = require('./models/cart-item');
const OrderItem = require('./models/order-item');
const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
// app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {console.log(err)})
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });
User.hasOne(Order);
Order.belongsTo(User);
Product.belongsToMany(Order, {through: OrderItem});
Order.belongsToMany(Product, {through: OrderItem});


sequelize
  // .sync({force: true})
  .sync()
  .then(result => {
    User.findByPk(1)
  })
  .then(user => {
    // if(!user) {
    //   return User.create({
    //     username: 'kpas',
    //     email: 'test@example.com'
    //   });
    // }
    return user
  }).then(user => {
    app.listen(3000);
    // return user.createCart();
  })
  // .then(result => {
  // })
  .catch(err => console.log(err));
