const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
    const nav = await utilities.getNav()

    // Log flash messages
    console.log("Flash messages:", req.flash("notice"))

    // req.flash("notice", "This is a flash message")
    res.render("index", {
        title: "Home", 
        nav,
        message: req.flash("notice")
    })    
}

module.exports = baseController