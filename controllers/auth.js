const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const mailer_api_key = process.env.NODEMAILER_KEY;


const mailTransport = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: mailer_api_key
    }
}))

exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error'); 
    let successMessage = req.flash('success');
    errorMessage.length > 0 ? errorMessage = errorMessage[0] : errorMessage = null;
    successMessage.length > 0 ? successMessage = successMessage[0] : successMessage = null;
    res.render('auth/login', {
        pageTitle: 'Online Shop/Login',
        path: '/login',
        isAuthenticated: false,
        errorMessage: errorMessage,
        successMessage: successMessage,
        loginData: {email: '', password: ''}
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let errorMessage = req.flash('error') 
    errorMessage.length > 0 ? errorMessage = errorMessage[0] : errorMessage = null;
    return User.findOne({email: email})
    .then(user => {
        if(!user) {
            req.flash('error', 'Invalid Email and/or Password');
            return res.status(422).render('auth/login', {
                pageTitle: 'Online Shop/Login',
                path: '/login',
                isAuthenticated: false,
                errorMessage: errorMessage,
                successMessage: '',
                loginData: {email: req.body.email, password: req.body.password}
            });
        }
        bcrypt.compare(password, user.password)
        .then(doesMatch => {
            if(!doesMatch) {
                req.flash('error', 'Invalid Email and/or Password');
                return res.status(422).render('auth/login', {
                    pageTitle: 'Online Shop/Login',
                    path: '/login',
                    isAuthenticated: false,
                    errorMessage: errorMessage,
                    successMessage: '',
                    loginData: {email: req.body.email, password: req.body.password}
                });
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            })
        })
        .catch(err => console.log(err));       
    })
    .catch(err => {
        const error = new Error('Error logging in user');
        error.httpStatusCode = 500;
        next(error);
      });  
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getSignup = (req, res, next) => {
    let errorMessage = req.flash('error');
    errorMessage.length > 0 ? errorMessage = errorMessage[0] : errorMessage = null;
    res.render('auth/signup', {
        pageTitle: 'Online Shop/Signup',
        path: '/signup',
        isAuthenticated: false,
        message: errorMessage,
        registrationData: {email: '', password: '', confirmPassword: ''},
        errorArr: []
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Online Shop/Signup',
            path: '/signup',
            isAuthenticated: false,
            message: error.array()[0].msg,
            registrationData: {
                email: email, password: password, confirmPassword: req.body.confirmPassword
            },
            errorArr: validationResult(req).array()
        })
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: {items: []}
        })
        return user.save();
    })
    .then(result => {
        req.flash('success', 'Congrats on your successful signup, please login to continue');
        res.redirect('/login');
        return mailTransport.sendMail({
            to: email,
            from: 'Best Shops <support@bestshop.com>',
            subject: 'Successful Registration',
            html: '<h1>TThank you for registering<h1>'
        })
        .catch(err => {
            const error = new Error('Error creating new user and redirecting to login');
            error.httpStatusCode = 500;
            next(error);
          }); 
    })
}

exports.getReset = (req, res, next) => {
    let errorMessage = req.flash('error');
    errorMessage.length > 0 ? errorMessage = errorMessage[0] : errorMessage = null;
    res.render('auth/reset', {
        pageTitle: 'Online Shop/Reset Password',
        path: '/reset',
        isAuthenticated: false,
        message: errorMessage
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const email = req.body.email;
        const token = buffer.toString('hex')
        User.findOne({email: email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No user with that Email Found, Please check your email and try again');
                return res.redirect('/reset');
            } else {
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();  
            }
            })
            .then(result => {
                res.redirect('/');
                return mailTransport.sendMail({
                    to: email,
                    from: 'Best Online NG <support@bestonline.ng>',
                    subject: 'Password Reset',
                    html: `
                    <P>You requested a password reset</P>
                    <P>Click this <a href="http://localhost:3000/reset/${token}">LINK</a> to set a new password</P>
                    `
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            const error = new Error('Error reseting user password');
            error.httpStatusCode = 500;
            next(error);
          });  
    })
}

exports.newPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        if(user) {
            let errorMessage = req.flash('error');
            errorMessage.length > 0 ? errorMessage = errorMessage[0] : errorMessage = null;
            res.render('auth/new-password', {
                pageTitle: 'Online Shop/New Password',
                path: '/new-password',
                isAuthenticated: false,
                message: errorMessage,
                userId: user._id.toString(),
                resetToken: token
            })   
        } else {
            req.flash('error', 'Request section TimedOut, please resend another request')
             return res.redirect('/reset')
        }
    })
    .catch(err => {
        const error = new Error('Error getting new password update page');
        error.httpStatusCode = 500;
        next(error);
      });  
}

exports.postNewPassword = (req, res, next) => {
    const token = req.body.resetToken;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    let resetUser;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        const error = new Error('Error updating new user password');
        error.httpStatusCode = 500;
        next(error);
      });
 }