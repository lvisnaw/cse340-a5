// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Route for the "My Account" page
router.get("/", utilities.handleErrors(accountController.buildAccountView))

// Route for the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for the register page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

module.exports = router
