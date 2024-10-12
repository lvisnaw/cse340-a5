const pool = require("../database/")

/* *********************************
 * Register a new account
 * ******************************* */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
   try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
   } catch (error) {
    return error.message
   } 
}

/* *********************************
 * Check for existing email
 * ******************************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* *********************************
 * Check login credentials
 * ******************************* */
async function checkLoginCredentials(account_email, account_password) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1 AND account_password = $2"
        const result = await pool.query(sql, [account_email, account_password])
        
        // If a user is found, return the user data; otherwise return null
        return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
        return error.message
    }
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    checkLoginCredentials
};