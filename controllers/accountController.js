// Needed resources
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error) // Pass error to error handling middleware
  }
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  console.log(req.body);

  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // Hash the password with a cost factor of 10
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      account_firstname, // Sticky data
      account_lastname,  // Sticky data
      account_email,     // Sticky data
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname, // Sticky data
      account_lastname,  // Sticky data
      account_email,     // Sticky data
      errors: null,
    });
  }
}

/* ****************************************
 *  Process Login Request
 * *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // Logging for debugging
  console.log('Attempting login for:', account_email)
  console.log('Entered password:', account_password ? 'Provided' : 'Not provided')

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email, // Sticky email
    })
    return
  }

  try {
    // Compare entered password with the hashed password in the database
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password; // Remove password from session data
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

      // Set JWT cookie with security options based on environment
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Login failed. Please check your credentials.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        account_email, // Sticky email
      })
    }
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    return next(new Error('Access Forbidden'))
  }
}

/* ****************************************
 *  Deliver account management view (buildAccountView)
 * *************************************** */
async function buildAccountView(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/account", {
      title: "Account Management",
      nav,
      message: "You're logged in",
      errors: null, // Add if you're handling validation errors in this view
    })
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountView }