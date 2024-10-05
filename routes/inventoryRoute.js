// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

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

// Route to trigger an internitional error
router.get("/trigger-error", (req, res) => {
    throw new Error("This is an intentional error for testing purposes."); 
});  

module.exports = router;