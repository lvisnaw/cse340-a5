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
  console.log('Entered password:', account_password)

  const accountData = await accountModel.getAccountByEmail(account_email)

  console.log(await bcrypt.compare(account_password, accountData.account_password))
  console.log(accountData.account_password)

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

      // Store account data in session
      req.session.accountData = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type,
        // firstname: accountData.account_firstname, // For convenience in the view
        // lastname: accountData.account_lastname // For convenience in the view
      } // Copy accountData

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
 *  Process Logout
 * *************************************** */
function logout(req, res, next) {
  // Set a flash message before destroying the session
  req.flash("notice", "You have successfully logged out.");
  
  // Clear session data and cookies
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session during logout:', err);
      return next(err); // Handle error during logout
    }
    res.clearCookie("jwt"); // Clear the JWT cookie
    return res.redirect("/"); // Redirect to homepage
  });
}

/* ****************************************
 *  Deliver account management view (buildAccountView)
 * *************************************** */
async function buildAccountView(req, res, next) {
  try {
    let nav = await utilities.getNav();

    // Pass user data to the view
    const userData = req.session.accountData || {};
    console.log(userData);
    
    res.render("account/account", {
      title: "Account Management",
      nav,
      message: "You're logged in",
      errors: null, // Add if you're handling validation errors in this view
      user: userData // Pass the user data to the view
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildAccountUpdateView(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const account_id = req.params.account_id; // Get account ID from route parameters

    // logging for debugging
    console.log("Account ID:", account_id);

    const accountData = await accountModel.getAccountById(account_id); // Fetch account data from DB

    // logging for debugging - use JSON.stringify for better readability
    console.log("Account Data:", JSON.stringify(accountData, null, 2));

    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData, // Send current account data to view for prefilling the form
      errors: null // Add if you're handling validation errors
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}


/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.");
      const updatedAccountData = await accountModel.getAccountById(account_id);
      
      // Store updated data in the session with the same field names
      req.session.accountData = {
        ...req.session.accountData, // Preserve existing session data
        account_firstname: updatedAccountData.account_firstname,
        account_lastname: updatedAccountData.account_lastname,
        account_type: updatedAccountData.account_type,
        account_email: updatedAccountData.account_email
      };

      res.redirect("/account"); // Redirect to the account management view
    } else {
      req.flash("notice", "Failed to update account. Please try again.");
      res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        accountData: req.body, // Sticky data
        errors: null
      });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res, next) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    // Hash the updated password with a cost factor of 10
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update the password in the database
    const passwordUpdateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (passwordUpdateResult) {
      req.flash("notice", "Password updated successfully.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Failed to update password. Please try again.");
      res.status(500).render("account/update", {
        title: "Update Password",
        nav,
        errors: null
      });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin,
  logout, 
  buildAccountView,
  buildAccountUpdateView,
  updateAccount,
  updatePassword 
}