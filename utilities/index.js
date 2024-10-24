const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    // console.log(data) /* Used for testing purposes. */
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li class="inv-image">'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

/* **************************************
* Build the vehicle detail HTML
* ************************************ */
Util.buildDetailView = async function(vehicle) {
  let detailView = `
  <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
          <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p>Year: ${vehicle.inv_year}</p>
          <p>Miles: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
          <p>Color: ${vehicle.inv_color}</p>
          <p>Description: ${vehicle.inv_description}</p>
      </div>
  </div>
  `;
  return detailView;
}

/* **************************************
 * Build the classification select dropdown
 * ************************************ */
Util.buildClassificationSelect = async function(data, selectedClassificationId) {
  let selectList = '<select name="classificationList" id="classificationList" class="invSelection" required>';
  selectList += '<option value="">Select Classification</option>'; // Optional default option
  
  data.forEach(classification => {
      selectList += `<option value="${classification.classification_id}"`;
      // Mark the option as selected if it matches the selectedClassificationId
      if (classification.classification_id === selectedClassificationId) {
          selectList += ' selected';
      }
      selectList += `>${classification.classification_name}</option>`;
  });
  
  selectList += '</select>';
  return selectList;
};


/* **************************************
 * Build the classifications list
 * ************************************ */
/* Added this to test if the function works
 * It throws Error at: "/inv/": Cannot read properties of undefined (reading 'forEach')
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
 * Get the classification list from the database and build the select dropdown
 * added this to test if the function works for edit inventory
 * ************************************ */
Util.getClassificationList = async function () {
  const data = await invModel.getClassifications(); // Fetch the classifications
  return await Util.buildClassificationSelect(data.rows); // Reuse the buildClassificationSelect function
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
// NEW ERROR HANDLER
// Util.handleErrors = (fn) => (req, res, next) => {
//   // Wrap the function in a promise to catch any errors
//   Promise.resolve(fn(req, res, next)).catch((err) => {
//       // Log the error for debugging
//       console.error(err);

//       // Send a generic error response or customize it based on the error
//       res.status(err.status || 500).send({
//           error: err.message || 'Something went wrong!',
//       });
//   });
// };

/* ***********************
 * Middleware to check token validity
 *************************/
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt, 
      process.env.ACCESS_TOKEN_SECRET, 
      (err, accountData) => {
        if (err) {
          // Log the error for better understanding of why verification failed
          console.error("JWT verification error:", err);

          req.flash("notice", "Please log in.");
          res.clearCookie("jwt");
          res.locals.loggedin = false; // added in attempt to fix site crash
          return res.redirect("/account/login");
        }

        // Log the decoded account data to verify its contents
        console.log("Decoded JWT Data:", accountData);

        // Set account data and logged-in status
        res.locals.accountData = accountData;
        res.locals.loggedin = true;

        // Proceed to the next middleware or route
        next();
      }
    );
  } else {
    // If no JWT cookie is present, proceed without setting account data
    next();
  }
}

/* ****************************************
 * Check login data and return errors or continue to login
 * **************************/
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Middleware to Check Account Type
 * Only allows access if the account type matches one of the required roles
 * **************************/
Util.checkAccountType = (requiredTypes) => {
  return (req, res, next) => {
    const accountData = req.session.accountData; // Get user data from session

    // Log account data and required types for debugging
    console.log('Account Data in checkAccountType:', accountData);
    console.log('Required Types:', requiredTypes);

    // Check if accountData exists and matches required account types
    if (
      accountData &&
      Array.isArray(requiredTypes) &&
      requiredTypes.map(type => type.toLowerCase()).includes(accountData.account_type.toLowerCase())
    ) {
      console.log('User has access, proceeding...');
      next(); // User has the correct role, proceed to the next middleware or route handler
    } else {
      console.log('User does not have permission, redirecting...');
      req.flash('notice', 'You do not have permission to access this page.');
      res.redirect('/account/login'); // Redirect to the login page if unauthorized
    }
  };
};


module.exports = Util
