const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Get individula inventory item details
 * ************************** */
invCont.getInventoryItemDetail = async function (req, res, next) {
  const vehicleId = req.params.id // Get vehicle ID from the URL
  const vehicleData = await invModel.getVehicleById(vehicleId) // Fetch the vehicle details from the model
  
  if (vehicleData) { // Check if vehicle data was returned
    let nav = await utilities.getNav() // Get the navigation HTML
    const vehicleTitle = `${vehicleData.inv_make} ${vehicleData.inv_model}` // Title of the detail page
    
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      vehicle: vehicleData, // Pass vehicle data directly to the template
    })
  } else {
    // Handle the case where no vehicle data was found
    res.status(404).render("error", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
      message: "Sorry, the vehicle you're looking for could not be found."
    })
  }
}

/* ***************************
 * Trigger an Intentional Error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  // Throwing an error to trigger the middleware
  throw new Error("This is an intentional error for testing purposes.");
};

module.exports = invCont