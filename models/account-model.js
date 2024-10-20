const pool = require("../database/")

/* *********************************
 * Register a new account with hashed password
 * ******************************* */
async function registerAccount(account_firstname, account_lastname, account_email, hashedPassword) {
   try {
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

/* *********************************
 * Get account by ID
 * ******************************* */
async function getAccountById(account_id) {
    try {
        const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1";
        const result = await pool.query(sql, [account_id]);

        if (result.rowCount > 0) {
            return result.rows[0]; // Return the account details if found
        } else {
            return null; // Return null if no account is found with the given ID
        }
    } catch (error) {
        console.error("Error in getAccountById:", error);
        throw new Error("Database query failed");
    }
}

/* *********************************
 * Update account information
 * ******************************* */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
    try {
        const sql = `
            UPDATE account
            SET account_firstname = $1, account_lastname = $2, account_email = $3
            WHERE account_id = $4
            RETURNING *;
        `;
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
        return result.rowCount; // Returns the number of affected rows
    } catch (error) {
        return error.message;
    }
}

/* *********************************
 * Update account password
 * ******************************* */
async function updatePassword(account_id, hashedPassword) {
    try {
        const sql = `
            UPDATE account
            SET account_password = $1
            WHERE account_id = $2
            RETURNING *;
        `;
        const result = await pool.query(sql, [hashedPassword, account_id]);
        return result.rowCount; // Returns the number of affected rows
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    checkLoginCredentials,
    getAccountByEmail,
    updateAccount,
    getAccountById,
    updatePassword
}