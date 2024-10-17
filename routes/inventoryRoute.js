// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require('express-validator'); // Import express-validator for validation

// Route to build inventory by classification view
router.get(
    "/type/:classificationId", 
    utilities.handleErrors(invController.buildByClassificationId)
);
  
// Route to get individual inventory item
router.get(
    "/detail/:id", 
    utilities.handleErrors(invController.getInventoryItemDetail)
);

// Route to get get inventory items by classification
router.get(
    "/getInventory/:classification_id", 
    utilities.handleErrors(invController.getInventoryJSON)
);

// Route to trigger an intentional error
router.get("/trigger-error", (req, res) => {
    throw new Error("This is an intentional error for testing purposes."); 
}); 

// Route to display the management view
router.get(
    "/",
    utilities.handleErrors(invController.buildManagementView)
);

// Route to display the add classification form
router.get(
    "/add-classification", 
    utilities.handleErrors(invController.getAddClassificationView)
);

// ** New POST Route to Add Classification **
router.post('/add-classification', [
    body('classification_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Classification name cannot be empty.')
        .matches(/^[^\\s!@#$%^&*()_+={}|:;,.<>?`~]+$/)
        .withMessage('Classification name cannot contain spaces or special characters.')
], utilities.handleErrors(invController.addClassification));

// Route to display the add inventory form
router.get(
    "/add-inventory", 
    utilities.handleErrors(invController.getAddInventoryView)
);

// ** New POST Route to Add Inventory Item **
router.post('/add-inventory', [
    body('inv_make').trim().notEmpty().withMessage('Make cannot be empty.'),
    body('inv_model').trim().notEmpty().withMessage('Model cannot be empty.'),
    body('inv_year').isInt({ min: 1886 }).withMessage('Year must be a valid integer greater than 1886.'),
    body('classification_id').notEmpty().withMessage('You must select a classification.'),
    // Add other fields as necessary
], utilities.handleErrors(invController.addInventory)); // Ensure this method exists in the controller

module.exports = router;
