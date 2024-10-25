const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");

/* ***************************
 * Add a new review
 * ************************** */
async function addReview(req, res, next) {
    const { review_text } = req.body;
    const inv_id = req.params.id;
    const account_id = req.session.accountData.account_id;

    try {
        await reviewModel.addReview(review_text, inv_id, account_id);
        req.flash("success", "Review added successfully.");
        res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
        req.flash("error", "Failed to add review.");
        res.redirect(`/inv/detail/${inv_id}`);
    }
}

/* ***************************
 * Get review edit view
 * ************************** */
async function getEditReviewView(req, res, next) {
    const review_id = req.params.review_id;
    const review = await reviewModel.getReviewById(review_id);

    if (review && review.account_id === req.session.accountData.account_id) {
        let nav = await utilities.getNav();
        res.render("review/edit-review", {
            title: "Edit Review",
            nav,
            review
        });
    } else {
        req.flash("error", "You cannot edit this review.");
        res.redirect("/account");
    }
}

/* ***************************
 * Update a review
 * ************************** */
async function updateReview(req, res, next) {
    const review_id = req.params.review_id;
    const { review_text } = req.body;

    try {
        await reviewModel.updateReview(review_id, review_text);
        req.flash("success", "Review updated successfully.");
        res.redirect("/account");
    } catch (error) {
        req.flash("error", "Failed to update review.");
        res.redirect(`/review/edit/${review_id}`);
    }
}

/* ***************************
 * Delete a review
 * ************************** */
async function deleteReview(req, res, next) {
    const review_id = req.params.review_id;

    try {
        // Log the review ID and user data for debugging
        console.log("Attempting to delete review with ID:", review_id);
        console.log("User Data:", req.session.accountData);

        // Fetch the review to verify ownership
        const review = await reviewModel.getReviewById(review_id);

        // Log the review data fetched from the database
        console.log("Review Data:", review);

        // Check if the review belongs to the logged-in user or if the user is an admin
        if (
            review && 
            (review.account_id === req.session.accountData.account_id || 
            req.session.accountData.account_type.toLowerCase() === "admin")
        ) {
            const result = await reviewModel.deleteReview(review_id);
            console.log("Delete operation result:", result);

            // Check if the deletion affected any rows
            if (result > 0) {
                console.log("Review successfully deleted.");
                req.flash("success", "Review deleted successfully.");
            } else {
                console.log("Review deletion failed, no rows affected.");
                req.flash("error", "Review deletion failed.");
            }
        } else {
            console.log("User does not have permission to delete this review.");
            req.flash("error", "You cannot delete this review.");
        }

        // Redirect back to the account page
        res.redirect("/account");
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Failed to delete review.");
        res.redirect("/account");
    }
}

/* ***************************
 * Get user reviews for account admin view
 * ************************** */
async function getUserReviews(req, res, next) {
    try {
        // Retrieve the logged-in user's account ID
        const account_id = req.session.accountData.account_id;

        // Fetch reviews written by the logged-in user
        const reviews = await reviewModel.getReviewsByAccountId(account_id);

        // Get the navigation
        let nav = await utilities.getNav();

        // Render the account admin view with reviews
        res.render("account/admin", {
            title: "Account Management",
            nav,
            reviews, // Pass the user's reviews to the view
            accountData: req.session.accountData, // Include account data for personalization
        });
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        req.flash("error", "There was an error retrieving your reviews.");
        res.redirect("/account");
    }
}

module.exports = {
    addReview,
    getEditReviewView,
    updateReview,
    deleteReview,
    getUserReviews
};