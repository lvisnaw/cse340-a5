// Needed resources
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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
    next(error)  // Pass error to error handling middleware
  }
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
    console.log(req.body)

    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword;
    try {
        // Hash the password with a cost factor of 10
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

/* ****************************************
 * Process Login
 * *************************************** */
async function loginAccount(req, res) {
  const { account_email, account_password } = req.body
  let nav = await utilities.getNav()

  // Assuming you have a function to check the user's credentials
  const loginResult = await accountModel.checkLoginCredentials(
      account_email,
      account_password
  )

  if (loginResult) {
      req.flash("notice", `Welcome back ${loginResult.account_firstname}`)
      res.status(200).redirect("/") // or render the account page
  } else {
      req.flash("notice", "Login failed. Please check your credentials.")
      res.status(401).render("account/login", {
          title: "Login",
          nav,
          account_email // Stick the email to the form
      })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }