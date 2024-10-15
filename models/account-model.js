const pool = require("../database/")
const bcrypt = require("bcryptjs")

/* *********************************
 * Register a new account with hashed password
 * ******************************* */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
   try {
       // Hash the password before storing it in the database
       const hashedPassword = await bcrypt.hash(account_password, 10)
       
       const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
       return await pool.query(sql, [account_firstname, account_lastname, account_email, hashedPassword])
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
 * Check login credentials securely
 * ******************************* */
async function checkLoginCredentials(account_email, account_password) {
    try {
        // Retrieve the account with the provided email
        const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_password FROM account WHERE account_email = $1"
        const result = await pool.query(sql, [account_email])

        if (result.rowCount > 0) {
            const dbAccount = result.rows[0]
            // Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(account_password, dbAccount.account_password)

            if (isMatch) {
                // Remove password from returned account data
                const { account_password, ...accountDetails } = dbAccount
                return accountDetails
            } else {
                return null // Invalid password
            }
        } else {
            return null // No account found with that email
        }
    } catch (error) {
        return error.message
    }
}

/* *********************************
 * Return account data using email address
 * ******************************* */
async function getAccountByEmail (account_email) {
    try {
        const result = await pool.query(
            "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    checkLoginCredentials,
    getAccountByEmail
}