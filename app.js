const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb'); 

const db = require('./utils/database');
const mongoConnect = db.mongoConnect;
const app = express();

app.set('view engine', 'ejs');
// app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("5d111586a5ae581d0cd2309f")
    .then(user => {
      req.user = new User(user._id, user.name, user.email, user.cart );
      next();
    })
    .catch(err => {
      console.log(err)
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


mongoConnect(() => {
  // let user;
  // User.findById(null).then(result => {
  //   console.log(result);
  //   user = result;
  // })
  // if (!user) {
  //   const user = new User(null, "kpas", "test@example.com")
  //   user.save()
  // }
  app.listen(3000);
})   
