const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

/* ******************************
 * Inventory Data Validation Rules
 * ***************************** */
validate.inventoryRules = () => {
    return [
        // inv_make is required and must be a string
        body("inv_make")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Make is required."),

        // inv_model is required and must be a string
        body("inv_model")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Model is required."),

        // inv_year is required and must be a valid year
        body("inv_year")
            .trim()
            .isInt({ min: 1886, max: new Date().getFullYear() })
            .withMessage("Enter a valid year."),

        // inv_price is required and must be a number
        body("inv_price")
            .trim()
            .isFloat({ min: 0 })
            .withMessage("Price must be a valid number."),

        // inv_miles is required and must be a number
        body("inv_miles")
            .trim()
            .isInt({ min: 0 })
            .withMessage("Miles must be a valid number."),

        // inv_color is required and must be a string
        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Color is required."),
    ]
}

/* ******************************
 * Check inventory data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/addInventory", {
            errors,
            title: "Add Inventory",
            nav,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

/* ******************************
 * Check inventory data and return errors or continue to edit inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit Inventory",
            nav,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    console.log("Validation successful for inventory ID: ", inv_id); // Log when validation passes
    next()
}

/* ******************************
 * Classification Data Validation Rule
 * ***************************** */
validate.classificationRule = () => {
    return [
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Classification name is required.")
    ]
}

/* ******************************
 * Check classification data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/addClassification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

module.exports = validate
