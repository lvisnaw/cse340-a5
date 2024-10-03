const { Pool } = require("pg")
require("dotenv").config()
/* ***********************
 * Connection Pool
 * SSL Object needed for local test of app
 * But will cause problems in production enviroment
 * IF - else will make a determination which to use
 * ********************* */
let pool // changed to lower case pool becasue vscode was showing error in the code.
if (process.env.NODE_ENV == "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })

// Added for troubleshooting queries
// during development
module.exports = {
    async query(text, params) {
        try {
            const res = await pool.query(text, params)
            console.log("executed query", { text })
            return res
        } catch (error) {
            console.error("error in quer", { test })
            throw error
        }
    },
}
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    module.exports = pool
}