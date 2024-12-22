// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");

const {
  registerController,
  loginController,
  getUserById,
  updateUserFCMToken,
  updateUserBasicInfo,
  updateProfilePicture,
  updateUserSubscription,
  updateUserMobileNumber,
} = require("../controllers/userController");
const {
  createExamCat,
  getAllExamCategoryList,
  getSelectedExamPage,
} = require("../controllers/examController");
const {
  createSubExamCat,
  getSubCategoryOfCategory,
  addYear,
  getYearData,
  getAllYear,
} = require("../controllers/examSubCatController");
const {
  fetchImportantUpdates,
} = require("../controllers/MpscUpdatesController");
const {
  getQuestionPaper,
  createQuestion,
  addSubject,
} = require("../controllers/questionPaperController");
const {
  addUserPost,
  updateVote,
  getApprovedPolls,
} = require("../controllers/userPostController");
const {
  deleteImageFromCloudinary,
} = require("../controllers/cloudinaryController");
const { getApprovedPosts } = require("../controllers/postController");
const bannerController = require("../controllers/bannerController");
const { getAllPlans, getPlanById } = require("../controllers/plansController");
const {
  getCategoriesWithSubcategoriesAndYears,
} = require("../controllers/adminController");
const { appUpdate } = require("../controllers/appUpdateController");
const {
  getConstants,
  createConstant,
  updateConstant,
  deleteConstant,
} = require("../controllers/constantsController");
const privacyPolicyController = require("../controllers/privacyPolicyController");
const deletionController = require("../controllers/deletionController");
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getDonationsByUserEmail,
} = require("../controllers/donationController");

const {
  checkSubscription,
  checkSubscriptionThroughApp,
  updateTestsCompleted,
  checkHistoryViewCount,
  updateHistoryViewed,
} = require("../controllers/subscriptionController");
const {
  getCategoriesWithYear,
} = require("../controllers/ExamDetailWithYearController");

const {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryByUsername,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} = require("../controllers/leaderboardController");

const {
  createExamCategory,
  getExamCategories,
  updateExamCategory,
  deleteExamCategory,
  getAllCatWithYear,
} = require("../controllers/newexamCategoryController");
const {
  createSubExamType,
  getSubExamTypesByCategoryId,
  updateSubExamType,
  deleteSubExamType,
} = require("../controllers/newsubExamTypeController");

const feedbackController = require("../controllers/feedbackController");

// Create a new feedback entry
router.post("/feedback/create", feedbackController.createFeedback);

// Get all feedback entries
router.get("/feedback/", feedbackController.getAllFeedback);

// Get a specific feedback entry by ID
router.get("/feedback/:id", feedbackController.getFeedbackById);

// Update a feedback entry by ID
router.put("/feedback/:id", feedbackController.updateFeedbackById);

// Delete a feedback entry by ID
router.delete("/feedback/:id", feedbackController.deleteFeedbackById);

router.patch("/feedback/:id/reply", feedbackController.replyToFeedback);

router.patch(
  "/feedback/:id/not-interested",
  feedbackController.markNotInterested
);

router.put(
  "/feedback/:feedbackId/interest",
  feedbackController.updateFeedbackInterest
);

router.post("/subcategories/create", createSubExamType);
router.get("/subcategories/:categoryId", getSubExamTypesByCategoryId);
router.put("/subcategories/:id", updateSubExamType);
router.delete("/subcategories/:id", deleteSubExamType);

router.post("/exam-categories/create", createExamCategory);
router.get("/exam-categories/get-all-exam-category", getExamCategories);
router.put("/exam-categories/:id", updateExamCategory);
router.delete("/exam-categories/:id", deleteExamCategory);

// Route to check subscription status
router.get("/subscription/check-subscription/:userId", checkSubscription);
router.get("/subscription/checksub", checkSubscriptionThroughApp);
router.put(
  "/subscription/update-tests-completed-after-expiry-of-plan",
  updateTestsCompleted
);

// Create a leaderboard entry
router.post("/leaderboard/create", createLeaderboardEntry);

// Get all leaderboard entries
router.get("/leaderboard/getall", getAllLeaderboardEntries);

// Get a specific leaderboard entry by username
router.get("/leaderboard/:username", getLeaderboardEntryByUsername);

// Update a leaderboard entry by username
router.put("/leaderboard/:username", updateLeaderboardEntry);

// Delete a leaderboard entry by username
router.delete("/leaderboard/:username", deleteLeaderboardEntry);

router.get("/abc/cat", getCategoriesWithYear);

//update subscription is added in user routes
router.get("/subscription/check-history-count/:userId", checkHistoryViewCount);
router.put("/subscription/update-history", updateHistoryViewed);

// Create a new donation
router.post("/donation/donate", createDonation);

// Get all donations
router.get("/donation/donations", getDonations);

// Get a donation by ID
router.get("/donation/donations/:id", getDonationById);

// Update a donation
router.put("/donation/donations/:id", updateDonation);

// Delete a donation
router.delete("/donation/donations/:id", deleteDonation);

// Get donations by user email
router.get("/donation/donations/user/:email", getDonationsByUserEmail);

// Route to display the account deletion request form
router.get(
  "/deleteaccount/request-deletion",
  deletionController.getRequestDeletionPage
);

// Route to handle form submissions
router.post(
  "/deleteaccount/request-deletion",
  deletionController.handleDeletionRequest
);

router.get("/policy/privacy-policy", privacyPolicyController.getPrivacyPolicy);

// Define routes for CRUD operations
router.get("/variable/constants", getConstants); // Get all constants
router.post("/variable/constants", createConstant); // Create a new constant
router.put("/variable/constants/:key", updateConstant); // Update an existing constant by key
router.delete("/variable/constants/:key", deleteConstant); // Delete a constant by key

//routes
// REGISTER || POST
router.post("/register", registerController);
router.put("/update-basic-info/:userId", updateUserBasicInfo);
router.put("/profile-pic/:userId", updateProfilePicture);

// LOGIN || POST
router.post("/login", loginController);

router.put("/fcm/:userId/update", updateUserFCMToken);

//UPDATE || PUT
//router.put("/update-user", requireSingIn, updateUserController);

//getAll Category
// router.get("/get-all-exam-category", getAllExamCategoryList);

//Add Category
router.post("/add-exam-category", createExamCat);

//get Selected Exam
router.get("/get-exam", getSelectedExamPage);

//Create Sub Category
router.post("/add-sub-exam-category", createSubExamCat);

//Get Sub Category of the Specific Category
router.get("/get-all-sub-category", getSubCategoryOfCategory);

// Add Year of Question Paper
router.post("/add-year", addYear);

//get Year data
router.get("/get-year", getYearData);

router.get("/get-all-year", getAllYear);

router.get("/mpsc", fetchImportantUpdates);

// Question Paper Route
router.get("/get-question-paper", getQuestionPaper);

//Add Question
router.post("/add-question", createQuestion);

//Add Subject
router.post("/add-subject", addSubject);

//add user post
router.post("/add-user-post", addUserPost);

// Route to get approved posts
router.get("/approved-polls", getApprovedPolls);

//Update Vote
router.put("/:pollId", updateVote);

//Delete Image from the Cloudinary
router.delete("/delete-image", deleteImageFromCloudinary);

router.get("/approved-posts", getApprovedPosts);

//Get User Profile by Id
router.get("/banner/get-all", bannerController.getBanners);

router.get("/plans/get-all", getAllPlans);

// Get a single pricing plan by `plan` field
router.get("/plans/:id", getPlanById);

router.put("/update-subscription/:userId", updateUserSubscription);

router.get("/:id", getUserById);

router.put("/:userId/updateMobile", updateUserMobileNumber);

router.post("/app-update", appUpdate);

router.get("/coupons/", couponController.getAllCoupons);

// Create a new coupon
router.post("/coupons/create", couponController.createCoupon);

// Update a coupon by ID
router.put("/coupons/update/:id", couponController.updateCoupon);

// Delete a coupon by ID
router.delete("/coupons/delete/:id", couponController.deleteCoupon);

// Validate a coupon by code (for applying during checkout)
router.post("/coupons/validate", couponController.getCouponByCode);

module.exports = router;
