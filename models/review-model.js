const pool = require("../database/");

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const sql = `INSERT INTO public.review (review_text, inv_id, account_id) 
                     VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(sql, [review_text, inv_id, account_id]);
        return result.rows[0]; // Return the newly created review
    } catch (error) {
        console.error("addReview error: " + error);
        throw error;
    }
}

/* ***************************
 *  Get reviews for a specific inventory item
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
    try {
        const sql = `SELECT r.review_id, r.review_text, r.review_date, a.account_id, a.account_firstname, a.account_lastname 
                     FROM public.review AS r
                     JOIN public.account AS a ON r.account_id = a.account_id
                     WHERE r.inv_id = $1
                     ORDER BY r.review_date DESC`;
        const result = await pool.query(sql, [inv_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByInventoryId error: " + error);
        throw error;
    }
}

/* ***************************
 *  Get a review by ID
 * ************************** */
async function getReviewById(review_id) {
    try {
        const sql = `SELECT * FROM public.review WHERE review_id = $1`;
        const result = await pool.query(sql, [review_id]);
        return result.rows[0];
    } catch (error) {
        console.error("getReviewById error: " + error);
        throw error;
    }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text) {
    try {
        const sql = `UPDATE public.review SET review_text = $1, review_date = NOW() WHERE review_id = $2 RETURNING *`;
        const result = await pool.query(sql, [review_text, review_id]);
        return result.rows[0];
    } catch (error) {
        console.error("updateReview error: " + error);
        throw error;
    }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
    try {
        console.log("Deleting review with ID:", review_id);
        const sql = `DELETE FROM public.review WHERE review_id = $1 RETURNING *`;
        const result = await pool.query(sql, [review_id]);
        console.log("Delete SQL result:", result);
        return result.rowCount;
    } catch (error) {
        console.error("deleteReview error: " + error);
        throw error;
    }
}

/* ***************************
 *  Get reviews by a specific account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `SELECT r.review_id, r.review_text, r.review_date, i.inv_make, i.inv_model 
                     FROM public.review AS r
                     JOIN public.inventory AS i ON r.inv_id = i.inv_id
                     WHERE r.account_id = $1
                     ORDER BY r.review_date DESC`;
        const result = await pool.query(sql, [account_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByAccountId error: " + error);
        throw error;
    }
}

/* ***************************
 *  Get all reviews by clients (for admin view)
 * ************************** */
async function getAllClientReviews() {
    try {
        const sql = `
            SELECT r.review_id, r.review_text, r.review_date, r.inv_id, a.account_firstname, a.account_lastname, a.account_type, i.inv_make, i.inv_model
            FROM public.review AS r
            JOIN public.account AS a ON r.account_id = a.account_id
            JOIN public.inventory AS i ON r.inv_id = i.inv_id
            WHERE a.account_type = 'Client'
            ORDER BY r.review_date DESC;
        `;
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        console.error("getAllClientReviews error: " + error);
        throw error;
    }
}


module.exports = {
    addReview,
    getReviewsByInventoryId,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByAccountId,
    getAllClientReviews
};