const express = require("express");
const multer = require("multer");

const {
  getPoll,
  isPostApproved,
  deletePoll,
} = require("../controllers/adminPollControllter");
const {
  registerController,
  loginController,
  getUserById,
} = require("../controllers/userController");
const {
  createExamCategory,
  getExamCategories,
  deleteExamCategory,
  updateExamCategory,
  getAllSubCategories,
  findSubCategoriesByCategoryId,
  removeSubcategory,
  updateSubcategory,
  addSubcategory,
  getYearsBySubcategoryId,
  addYear,
  updateYear,
  removeYear,
  getAllSubcatYear,
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createTopic,
  getAllTopics,
  getTopicsBySubjectId,
  updateTopic,
  deleteTopic,
  getCategoriesWithSubcategories,
  getCategoriesWithSubcategoriesAndYears,
  createExamEntry,
  removeYearWithPaper,
  removeSubcategoryWithYearsAndPapers,
  getCategoriesWithSubcategoriesAndYearsAndQuestionPaper,
  getAllUsers,
} = require("../controllers/adminController");
const questionPaperController = require("../controllers/newQuestionPaperController");
const {
  getSubCategoryOfCategory,
} = require("../controllers/examSubCatController");
const { processPdf } = require("../controllers/pdfController");
const {
  appUpdate,
  getAppUpdates,
  createAppUpdate,
  updateAppUpdate,
  deleteAppUpdate,
} = require("../controllers/appUpdateController");
const bannerController = require("../controllers/bannerController");
const plansController = require("../controllers/plansController");
const couponController = require("../controllers/couponController");
const {
  enableFreePlanForStudent,
  disablePlanForStudent,
  enableFreePlanForMultipleStudents,
  disablePlanForMultipleStudents,
  getGlobalFreePlanStatus,
  updateGlobalFreePlan,
  updateExpiryDate,
} = require("../controllers/studentController");
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getDonationsByUserEmail,
} = require("../controllers/donationController");

const {
  createSubExamType,
  getSubExamTypesByCategoryId,
  updateSubExamType,
  deleteSubExamType,
} = require("../controllers/newsubExamTypeController");
const feedbackController = require("../controllers/feedbackController");

const {
  createPaper,
  getAllPapers,
  getPaperByCategory,
} = require("../controllers/allPaperController");

const router = express.Router();

// Create a new paper
router.post("/papers/", createPaper);

// Get all papers
router.get("/papers/", getAllPapers);

router.get("/papers/:categoryId", getPaperByCategory);

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

// Routes
router.put("/enable-free-plan/:studentId", enableFreePlanForStudent);
router.put("/disable-plan/:studentId", disablePlanForStudent);
router.put("/enable-free-plan", enableFreePlanForMultipleStudents); // Bulk operation
router.put("/disable-plan", disablePlanForMultipleStudents); // Bulk operation

router.get("/global-free-plan-status", getGlobalFreePlanStatus);
router.put("/update-global-free-plan", updateGlobalFreePlan);

router.put("/update-expiry-date", updateExpiryDate);

router.get("/coupons/", couponController.getAllCoupons);

// Create a new coupon
router.post("/coupons/create", couponController.createCoupon);

// Update a coupon by ID
router.put("/coupons/update/:id", couponController.updateCoupon);

// Delete a coupon by ID
router.delete("/coupons/delete/:id", couponController.deleteCoupon);

// Validate a coupon by code (for applying during checkout)
router.post("/coupons/validate", couponController.getCouponByCode);

//Register
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

router.get("/getUser/:id", getUserById);

//Get All Polls
router.get("/polls", getPoll);

// Reject or Approve Poll
router.get("/polls/:postId", isPostApproved);
router.put("/polls/:postId", isPostApproved);

router.delete("/polls/:id", deletePoll);

//Question Paper Controller

router.post("/create-exam-entry", createExamEntry);

//Category
router.post("/create-cat", createExamCategory);
router.get("/getall-cat", getExamCategories);
router.delete("/delete-cat/:categoryId", deleteExamCategory);
router.put("/update-cat/:categoryId", updateExamCategory);

//Sub cat
router.get("/get-all-subcategories", getAllSubCategories);
router.get("/find-subcategories/:categoryId", findSubCategoriesByCategoryId);
// Route to remove an existing subcategory
router.delete(
  "/remove-subcategory/:categoryId/:subcategoryId",
  removeSubcategory
);

router.delete("/delete-year-with-paper/:yearId", removeYearWithPaper);
router.delete(
  "/delete-subcategory-with-paper",
  removeSubcategoryWithYearsAndPapers
);

// Route to update an existing subcategory
router.put("/update-subcategory/:categoryId/:subcategoryId", updateSubcategory);
// Route to add a new subcategory
router.post("/add-subcategory/:categoryId", addSubcategory);

//Year
router.get("/find-years/:categoryId/:subcategoryId", getYearsBySubcategoryId);
router.post("/add-year/:categoryId/:subcategoryId", addYear);
router.put("/update-year/:yearId", updateYear);
router.delete("/delete-year/:yearId", removeYear);

router.get("/getall-subcat-year", getAllSubcatYear);

router.post("/add-subject", createSubject);
router.get("/get-all-subjects", getAllSubjects);
router.get("/subjects/:id", getSubjectById);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// Topics routes
router.post("/add-topic", createTopic);
router.get("/get-all-topics", getAllTopics);
router.get("/get-topics/:subjectId", getTopicsBySubjectId);
router.put("/topics/:id", updateTopic);
router.delete("/delete-topic/:id", deleteTopic);

router.post("/create-question", questionPaperController.createQuestionPaper);

router.get("/categories-with-subcategories", getCategoriesWithSubcategories);
router.get(
  "/categories-with-subcategories-and-years",
  getCategoriesWithSubcategoriesAndYears
);

router.get(
  "/categories-with-subcategories-and-years-and-paper",
  getCategoriesWithSubcategoriesAndYearsAndQuestionPaper
);

router.get("/get-all-students", getAllUsers);

const upload = multer({ dest: "uploads/" });

router.post("/upload-pdf", upload.single("pdf"), processPdf);

// for app update
router.post("/app-update", appUpdate);

//below routes added for app update
router.get("/app-updates/get", getAppUpdates);
router.post("/app-update/create", createAppUpdate);
router.put("/app-update/:id", updateAppUpdate);
router.delete("/app-update/:id", deleteAppUpdate);

// Create a new banner
router.post(
  "/banner/upload-banner",
  upload.single("coverImage"),
  bannerController.createBanner
);

// Get all banners
router.get("/banner/", bannerController.getBanners);

// Delete a banner by ID
router.delete("/banner/:id", bannerController.deleteBanner);
router.put("/banner/:id", bannerController.updateBanner);

// Get all pricing plans
router.get("/plans/get-all", plansController.getAllPlans);

// Get a single pricing plan by `plan` field
router.get("/plans/:plan", plansController.getPlanById);

// Create a new pricing plan
router.post("/plans/", plansController.createPlan);

// Update an existing pricing plan
router.put("/plans/:plan", plansController.updatePlan);

// Delete a pricing plan
router.delete("/plans/:plan", plansController.deletePlan);

module.exports = router;
