const pool = require("../database/");

/* *********************************
 * Get all classifications data
 * ******************************* */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* *********************************
 * Get all classifications for inventory
 * ******************************* */
async function getAllClassifications() {
    try {
        const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
        return data.rows; // Return all classifications as an array
    } catch (error) {
        console.error("getAllClassifications error: " + error);
        throw error; // Rethrow the error to handle it in the controller
    }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
            JOIN public.classification AS c 
            ON i.classification_id = c.classification_id 
            WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error: " + error);
        throw error; // Rethrow error for handling
    }
}

/* ***************************
 *  Get vehicle item by ID
 * ************************** */
async function getVehicleById(vehicleId) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE inv_id = $1`,
            [vehicleId]
        );
        return data.rows[0]; // Return the first row (since inv_id is unique)
    } catch (error) {
        console.error("getVehicleById error: " + error);
        throw error; // Rethrow error for handling
    }
}

/* ***************************
 *  Add a new classification to the database
 * ************************** */
async function addClassification(classification_name) {
    try {
        // Insert the new classification into the database
        const result = await pool.query(
            `INSERT INTO public.classification (classification_name) 
            VALUES ($1) RETURNING classification_id`, // Assuming classification_id is auto-incremented
            [classification_name]
        );
        return result.rows[0]; // Return the newly inserted classification
    } catch (error) {
        console.error("addClassification error: " + error);
        throw error; // Rethrow the error to handle it in the controller
    }
}

/* ***************************
 *  Add a new inventory item to the database
 * ************************** */
async function addInventory({ 
      make, 
      model, 
      year, 
      classification_id, 
      image, thumbnail, 
      description, 
      price, 
      miles, 
      color 
    }) {
  try {
    // Insert the new inventory item into the database, including the miles and color
    const result = await pool.query(
      `INSERT INTO public.inventory (inv_make, inv_model, inv_year, classification_id, inv_image, inv_thumbnail, inv_description, inv_price, inv_miles, inv_color) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING inv_id`, // Add inv_miles and inv_color to the query
      [make, model, year, classification_id, image, thumbnail, description, price, miles, color] // Include miles and color in the values
    );
    return result.rows[0]; // Return the newly inserted inventory item
  } catch (error) {
    console.error("addInventory error: " + error);
    throw error; // Rethrow the error to handle it in the controller
  }
}

/* ***************************
 *  Update an inventory item to the database
 * ************************** */
async function updateInventory({ 
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
  }) {
  try {
    const sql = 
    "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    
    // Update the inventory item into the database
    const data = await pool.query(sql, [
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
      inv_id
    ]);

    return data.rows[0]; // Return the newly updated inventory item
  } catch (error) {
    console.error("updateInventory error: " + error);
    throw error; // Rethrow the error to handle it in the controller
  }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getVehicleById,
    addClassification,
    addInventory,
    updateInventory,
    getAllClassifications // Ensure this function is exported
}