const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
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
 * Middleware for checking JWT and account type
 * **************************/
validate.checkAccountType = (requiredTypes) => {
    return async (req, res, next) => { // Mark this function as async
        const token = req.cookies.jwt; // Assuming you are using cookies for JWT
        if (!token) {
            req.flash("notice", "You must be logged in to access this page.");
            const nav = await utilities.getNav(); // Now you can use await here
            return res.status(401).render("account/login", {
                title: "Login",
                nav,
                errors: null,
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => { // Mark this function as async
            if (err) {
                req.flash("notice", "Invalid token. Please log in again.");
                const nav = await utilities.getNav(); // Use await here
                return res.status(403).render("account/login", {
                    title: "Login",
                    nav,
                    errors: null,
                });
            }

            // Check if account type is valid
            if (!requiredTypes.includes(decoded.account_type)) {
                req.flash("notice", "Access denied. You do not have permission to view this page.");
                const nav = await utilities.getNav(); // Use await here
                return res.status(403).render("account/login", {
                    title: "Login",
                    nav,
                    errors: null,
                });
            }

            // If everything is good, attach user data to the request and proceed
            req.accountData = decoded;
            next();
        });
    };
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

validate.updateAccountRules = () => {
    return [
        // First Name is required
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("First Name is required"),

        // Last Name is required
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Last Name is required"),

        // Valid email is required and cannot already exist if it's changed
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("Valid Email is required")
            .custom(async (account_email, { req }) => {
                console.log('Incoming account_id:', req.body.account_id);
                const account = await accountModel.getAccountById(req.body.account_id);
                console.log('Account fetched:', account);
                if (account_email !== account.account_email) {
                    const emailExists = await accountModel.checkExistingEmail(account_email);
                    if (emailExists) {
                        throw new Error("Email is already in use.");
                    }
                }
            }),
    ]
}

validate.updatePasswordRules = () => {
    return [
        // Password must be strong (same rules as registration)
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
            .withMessage("Password does not meet strength requirements"),
    ]
}

validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        return res.render("account/update", {
            title: "Update Account Information",
            nav,
            errors: errors.array(),
            accountData: req.body // Retain the submitted data for sticky values
        });
    }
    next();
}
validate.checkPasswordData = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        return res.render("account/update", {
            title: "Update Password",
            nav,
            errors: errors.array(),
            accountData: req.body // Retain the submitted data for sticky values, if needed
        });
    }
    
    next(); // If no validation errors, proceed to the next middleware/controller function
};

module.exports = validate