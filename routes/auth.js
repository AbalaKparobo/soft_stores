const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/signup', authController.getSignup);

router.post('/signup', check('email').isEmail().withMessage('Please enter a valid email address')
.custom((value, {req}) => {
    return User.findOne({email: value})
    .then(userData => {
        if(userData) {
            return Promise.reject('User with the Same Email already exist');
        }
    })
}).normalizeEmail(), 
check('password', 'Please use only numbers and/or texts of at least 6 characters long for password')
   .isLength({min: 6}).isAlphanumeric().trim(), 
body('confirmPassword').custom((value, {req}) => {
    if(value !== req.body.password){
        throw new Error('Password must match!');
    }
    return true;
}).trim(), 
authController.postSignup);

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.newPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;