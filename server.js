/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const accountRoute = require("./routes/accountRoute")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require("./database/")

// console.log("Session Secret:", process.env.SESSION_SECRET)
/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "sessionid",
}))



// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)

// Account route
app.use("/account", accountRoute)


// ** New Route for Triggering Intentional Error **
app.get("/trigger-error", (req, res, next) => {
  // Trigger an intentional error
  throw new Error("This is an intentional error for testing purposes.");
});

// 404 Page
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 * *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message;
  if (err.status == 404) { 
      message = err.message; 
  } else { 
      message = 'Oh no! There was a crash. Maybe try a different route?'; 
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
