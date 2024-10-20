// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const validate = require("../utilities/account-validation")

// Route for the "My Account" page
router.get(
    "/", 
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountView)
)

// Route for the account management view
router.get(
    "/account", // Adjust the path as needed
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountView) // New function in your controller
)

// Route for the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for the register page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
    "/register", 
    validate.registrationRules(),
    validate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt with validation
router.post(
    "/login",
    validate.loginRules(),
    validate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin) // Using the controller-based function
)

// Route to deliver the account update view
router.get(
    "/update/:account_id",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountUpdateView)
)

/* ****************************************
 *  Process Account Update
 * *************************************** */
// Route to handle account update submissions
router.post(
    "/update",
    validate.updateAccountRules(),  // Make sure this returns an array of middleware
    validate.checkUpdateData, // Ensure this is defined and returns a valid function
    utilities.handleErrors(accountController.updateAccount)
)

// Route to handle password update submissions
router.post(
    "/update-password",
    validate.updatePasswordRules(), // Validation middleware for passwords
    validate.checkPasswordData,     // Check for errors
    utilities.handleErrors(accountController.updatePassword) // New function for password update
)

// Route for logging out
router.get("/logout", utilities.handleErrors(accountController.logout))

module.exports = router;