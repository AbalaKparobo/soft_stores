const path = require('path');

const mongo = require('mongodb'); 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');


const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const { port, DB_URI } = require('./config')


const app = express();

const store = new mongoDBStore({
  uri: DB_URI,
  collection: 'session'
});

const csrfProtection = csrf();

const fileStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
});



const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg'
    ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.set('view engine', 'ejs');
// app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({ storage: fileStorageConfig, fileFilter: fileFilter }).single('image')
);

app.use(session({
  secret:'another day another secret', 
  resave: false, 
  saveUninitialized: false, 
  store: store
}));

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {return next()}
      req.user = user;
      next();
    })
    .catch(err => {
      // throw err;
      next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', { 
    pageTitle: 'Error!',
    path: '/500'
    // isAuthenticated: req.session.isLoggedIn
  });
})


mongoose.connect(DB_URI,  { useNewUrlParser: true })
 .then(() => {
  console.log('Database Connection Completed');
    return app.listen(3000);
  })
  .then(result => {
    console.log(`App is live`)
  })
  .catch(err => {
    console.log("Database connection issue" + err);
  });
