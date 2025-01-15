const express = require("express");
const router = express.Router();
const {
  createPaper,
  getAllPapers,
  getPaperByCategory,
  getQuestionsForPaper,
  getPaperByCategoryForWeb,
} = require("../controllers/allPaperController");

// Create a new paper
router.post("/", createPaper);

// Get all papers
router.get("/", getAllPapers);

router.get("/:categoryId", getPaperByCategory);
router.get("/:categoryId/:subcatId/:yearId", getQuestionsForPaper);
router.get("/web/:categoryId", getPaperByCategoryForWeb);

module.exports = router;
