// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require('express-validator'); // Import express-validator for validation
const validate = require("../utilities/inventory-validation");

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

// Route to display the management view
// ** New Role-Based Access Middleware Added **
router.get(
    "/",
    utilities.checkLogin, // Ensure the user is logged in
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.buildManagementView)
);

// Route to display the management view
// I was hoping this code would have worked for delivering the management view after login, but it didn't
// router.get(
//     "/management",
//     utilities.checkLogin, // Ensure the user is logged in
//     utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
//     utilities.handleErrors(invController.buildManagementView)
// );

// Route to display the add classification form
// ** New Role-Based Access Middleware Added **
router.get(
    "/add-classification", 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.getAddClassificationView)
);

// ** New POST Route to Add Classification **
router.post('/add-classification', 
    [
        body('classification_name')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Classification name cannot be empty.')
            .matches(/^[^\\s!@#$%^&*()_+={}|:;,.<>?`~]+$/)
            .withMessage('Classification name cannot contain spaces or special characters.')
    ], 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.addClassification)
);

// Route to display the add inventory form
// ** New Role-Based Access Middleware Added **
router.get(
    "/add-inventory",
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    validate.inventoryRules(), // Added to test validation
    utilities.handleErrors(invController.getAddInventoryView)
);

// New POST Route to Add Inventory Item
router.post('/add-inventory', 
    [
        body('inv_make').trim().notEmpty().withMessage('Make cannot be empty.'),
        body('inv_model').trim().notEmpty().withMessage('Model cannot be empty.'),
        body('inv_year').isInt({ min: 1886 }).withMessage('Year must be a valid integer greater than 1886.'),
        body('classification_id').notEmpty().withMessage('You must select a classification.'),
    ],
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.addInventory)
);

// Route to get the edit inventory view
// ** New Role-Based Access Middleware Added **
router.get(
    "/edit/:inv_id", 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.getEditInventoryView)
);

// Updated POST route to edit inventory
router.post('/edit/:inv_id', 
    [
        body('inv_make').trim().notEmpty().withMessage('Make cannot be empty.'),
        body('inv_model').trim().notEmpty().withMessage('Model cannot be empty.'),
        body('inv_year').isInt({ min: 1886 }).withMessage('Year must be a valid integer greater than 1886.'),
        body('classification_id').notEmpty().withMessage('You must select a classification.'),
    ],
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.getEditInventoryView)
);

// New post route to update inventory
// ** New Role-Based Access Middleware Added **
router.post(
    '/update/', 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.updateInventory)
);

// GET route for delete confirmation
// ** New Role-Based Access Middleware Added **
router.get(
    '/delete/:inv_id', 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.getDeleteInventoryView)
);

// POST route for deleting an inventory item
// ** New Role-Based Access Middleware Added **
router.post(
    '/delete/', 
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.deleteInventoryItem)
);

// POST route for deleting an inventory item
// ** New Role-Based Access Middleware Added **
router.post(
    '/delete/:inv_id',
    utilities.checkLogin,
    utilities.checkAccountType(['employee', 'admin']), // Restrict to employee and admin roles
    utilities.handleErrors(invController.deleteInventoryItem)
);

// Route to trigger an intentional error
// router.get("/trigger-error", (req, res) => {
//     throw new Error("This is an intentional error for testing purposes."); 
// }); 

module.exports = router;