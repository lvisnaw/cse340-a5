const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model");
const validate = {}

/************************
 * Login Data Validation Rules
 * **************************/
validate.loginRules = () => {
    return [
        // Email is required and must be a valid email
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter a valid email address."), // on error this message is sent

        // Password is required but no need to check strength here, just required
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Please enter your password.") // on error this message is sent
    ]
}

/************************
 * Check login data and return errors or continue to login
 * **************************/
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email
        })
        return
    }
    next()
}

/************************
 * Registration Data Validation Rules
 * **************************/
validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("First Name is required"), // on error this message is sent

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Last Name is required"), // on error this message is sent

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("Valid Email is required")// on error this message is sent
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email is already in use. Please login or use a different email address.")
                }
            }),

        // password is required and must be at least 12 characters long
        body("account_password")
            .trim()
            .escape()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements"), // on error this message is sent
        ]
}

/************************
 * Check data and return errors or continue to registration
 * **************************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email }  = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate