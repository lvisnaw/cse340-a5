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
        res.render("reviews/edit-review", {
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
        await reviewModel.deleteReview(review_id);
        req.flash("success", "Review deleted successfully.");
        res.redirect("/account");
    } catch (error) {
        req.flash("error", "Failed to delete review.");
        res.redirect("/account");
    }
}

module.exports = {
    addReview,
    getEditReviewView,
    updateReview,
    deleteReview
};