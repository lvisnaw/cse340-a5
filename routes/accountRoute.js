// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route for the "My Account" page
router.get("/", utilities.handleErrors(accountController.buildAccountView))

// Route for the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

module.exports = router
