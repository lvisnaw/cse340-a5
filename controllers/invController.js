const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { body, validationResult } = require('express-validator');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  
  // Check if data is empty
  const className = data.length > 0 ? data[0].classification_name : "Unknown Classification";

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    message: data.length === 0 ? "There are currently no vehicles available in this classification." : null // Message if no vehicles found
  });
};

/* ***************************
 * Get individual inventory item details
 * ************************** */
invCont.getInventoryItemDetail = async function (req, res, next) {
  const vehicleId = req.params.id; 
  const vehicleData = await invModel.getVehicleById(vehicleId);
  
  if (vehicleData) {
    let nav = await utilities.getNav();
    const vehicleTitle = `${vehicleData.inv_make} ${vehicleData.inv_model}`;
    
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      vehicle: vehicleData,
    });
  } else {
    res.status(404).render("error", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
      message: "Sorry, the vehicle you're looking for could not be found."
    });
  }
};

/* ***************************
 * Trigger an Intentional Error
 * ************************** */
// invCont.triggerError = async function (req, res, next) {
//   throw new Error("This is an intentional error for testing purposes.");
// };

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    // Get the navigation
    let nav = await utilities.getNav(); 
    const errors = req.flash("errors") || []; // Ensure errors is an array

    // Fetch the classification data from the database model
    const classificationData = await invModel.getClassifications();

    // Generate the classification select list by passing the rows from classificationData
    const classificationSelect = await utilities.buildClassificationSelect(classificationData.rows);

    // Render the view
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, // Pass the generated classification dropdown
      messages: {
        error: req.flash("error"),
        success: req.flash("success"),
      },
      errors,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Get Add Classification View
 * ************************** */
invCont.getAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("notice"),
    errors: null // Initialize errors as null
  })
}

/* ***************************
 *  Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Get navigation bar
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: errors.array() // Pass the validation errors to the view
    });
  }
  
  const { classification_name } = req.body;
  try {
    await invModel.addClassification(classification_name);

    req.flash("success", "Classification added successfully!"); 
    return res.redirect("/inv/");
  } catch (err) {
    console.error(err); 
    req.flash("error", "Failed to add classification. Please try again."); 
    
    let nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: [] // Preserve previous errors, if any
    });
  }
};

/* ***************************
 *  Get Add Inventory View
 * ************************** */
invCont.getAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const errors = req.flash("errors") || []; // Ensure errors is an array

  // Fetch the classification list to populate the select dropdown
  const classificationList = await invModel.getAllClassifications(); // Ensure this method exists in your model

  res.render("./inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    message: req.flash("notice"),
    errors: errors,
    locals: {
      inv_make: req.body.inv_make || '',
      inv_model: req.body.inv_model || '',
      inv_year: req.body.inv_year || '',
      classification_id: req.body.classification_id || ''
    }, // Pass the sticky values
    classificationList // Pass the classification list to the view
  });
};

/* ***************************
 *  Add Inventory Item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const errors = validationResult(req); // Get validation errors

  // Check for validation errors
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Get navigation bar
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      message: req.flash("notice"),
      errors: errors.array(), // This will always return an array
      locals: {
        inv_make: req.body.inv_make || '', // Sticky value
        inv_model: req.body.inv_model || '', // Sticky value
        inv_year: req.body.inv_year || '', // Sticky value
        classification_id: req.body.classification_id || '' // Sticky value
      },
      classificationList: await invModel.getAllClassifications() // Pass classification list on error
    });
  }

  // Validate inv_miles to ensure it's a whole number and greater than or equal to zero
  const invMiles = Number(req.body.inv_miles);
  if (!Number.isInteger(invMiles) || invMiles < 0) {
    req.flash("error", "Miles must be a valid whole number.");
    let nav = await utilities.getNav(); // Get navigation bar for the error case
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      message: req.flash("notice"),
      errors: [{ msg: "Miles must be a valid whole number." }], // Set the error message
      locals: {
        inv_make: req.body.inv_make || '', // Sticky value
        inv_model: req.body.inv_model || '', // Sticky value
        inv_year: req.body.inv_year || '', // Sticky value
        inv_description: req.body.inv_description || '', // Sticky value for the description
        inv_price: req.body.inv_price || '', // Sticky value for the price
        inv_miles: req.body.inv_miles || '', // Sticky value for the miles
        inv_color: req.body.inv_color || '', // Sticky value for the color
        classification_id: req.body.classification_id // Sticky value
      },
      classificationList: await invModel.getAllClassifications() // Pass classification list on error
    });
  }

  // Proceed to insert the inventory item into the database
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    classification_id, 
    inv_image, 
    inv_thumbnail, 
    inv_description, 
    inv_price 
  } = req.body;

  try {
    await invModel.addInventory({
      make: inv_make,
      model: inv_model,
      year: inv_year,
      classification_id,
      image: inv_image || "/images/vehicles/no-image.png", // Default image path
      thumbnail: inv_thumbnail || "/images/vehicles/no-image-tn.png", // Default thumbnail path
      description: inv_description || '', // Add the description here
      price: inv_price || 0, // Add the price here, default to 0 if not provided
      miles: invMiles, // Use the validated miles value
      color: req.body.inv_color || 'Unknown' // Add the color here, default to 'Unknown' if not provided
    }); // Call the model function

    // Set success message after successful insertion
    req.flash("success", "Inventory item added successfully!");

    // Redirect to the management view after adding the inventory item
    return res.redirect("/inv/"); // Redirect to the management view where the new item will be displayed
  } catch (err) {
    console.error(err); // Log the error for debugging
    req.flash("error", "Failed to add inventory item. Please try again."); // Set error message

    // Render the add inventory view again with the error message
    let nav = await utilities.getNav(); // Get navigation bar for the error case
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      message: req.flash("notice"),
      errors: [], // Pass an empty array if there's no error to preserve the state
      locals: {
        inv_make: req.body.inv_make || '', // Sticky value
        inv_model: req.body.inv_model || '', // Sticky value
        inv_year: req.body.inv_year || '', // Sticky value
        inv_description: req.body.inv_description || '', // Sticky value for the description
        inv_price: req.body.inv_price || '', // Sticky value for the price
        inv_miles: req.body.inv_miles || '', // Sticky value for the miles
        inv_color: req.body.inv_color || '', // Sticky value for the color
        classification_id: req.body.classification_id // Sticky value
      },
      classificationList: await invModel.getAllClassifications() // Pass classification list on error
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.getEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    console.log(itemData)

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    console.log('classificationSelect', classificationSelect)
    console.log('type of classificationSelect', typeof classificationSelect)

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    // Render the edit-inventory view
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName, // Dynamic title with Make and Model
      nav,
      classificationSelect,
      errors: null, // No validation errors initially
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (err) {
    next(err) // Handle any errors
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    // Call the model function to update the inventory item
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    // Check if the update was successful
    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      // Handle the case where the update failed
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (err) {
    next(err); // Handle any errors that occur
  }
};

// Export the controller
module.exports = invCont;