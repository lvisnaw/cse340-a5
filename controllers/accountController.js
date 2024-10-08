// Needed resources
const utilities = require("../utilities")

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

module.exports = { buildLogin }