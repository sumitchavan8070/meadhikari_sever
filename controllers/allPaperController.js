const AllPaper = require("../models/AllPaper");
const ExamYear = require("../models/newExamYear");
const QuestionPaper = require("../models/newQuestionPaper");
const SubExamType = require("../models/newSubExamType");

// Controller to create a new paper
const createPaper = async (req, res) => {
  try {
    const {
      testId,
      testName,
      totalQuestions,
      passingMarks,
      catID,
      QPYearID,
      questions,
    } = req.body;
    const newPaper = new AllPaper({
      testId,
      testName,
      totalQuestions,
      passingMarks,
      catID,
      QPYearID,
      questions,
    });
    const savedPaper = await newPaper.save();
    res.status(201).json(savedPaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get all papers
const getAllPapers = async (req, res) => {
  try {
    const papers = await AllPaper.find();
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getPaperByCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     const subcatAndYears = await ExamYear.find({ catId: categoryId })
//       .populate("QPYear") // Populate the category details
//       .populate("subCatId"); // Populate the subcategory details

//     console.log(JSON.stringify(categoryId));
//     res.json(subcatAndYears);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getPaperByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch subcategories and years
    const subcatAndYears = await ExamYear.find({ catId: categoryId });
    // console.log("Im here" + subcatAndYears);

    // console.log("1" + subcatAndYears);

    // Initialize an array to store question papers for each combination
    const questionPapers = [];

    // Iterate through each subcategory and year combination
    for (const subcatAndYear of subcatAndYears) {
      const { subCatId, _id: yearId } = subcatAndYear;

      const subCategory = await SubExamType.findById(subCatId);

      // Fetch questions for the current subcategory and year combination
      const questions = await QuestionPaper.find({
        subCatID: subCatId,
        // subCatName: subCategory ? subCategory.subCatName : "Unknown",
        QPYearID: yearId,
      });

      // Push the questions to the questionPapers array
      // questionPapers.push({
      //   catID: categoryId,
      //   subCatId: subCatId,
      //   yearId: yearId,
      //   QPYear: subcatAndYear.QPYear,
      //   subCatName: subCategory ? subCategory.subCatName : "Unknown",
      //   questions: questions,
      // });
      questionPapers.push({
        catID: categoryId,
        subCatId: subCatId,
        yearId: yearId,
        QPYear: subcatAndYear.QPYear,
        subCatName: subCategory ? subCategory.subCatName : "Unknown",
        questions: questions,
        questionPaperName: subCategory
          ? subCategory.questionPaperName
          : "Unknown",
      });
    }

    res.json(questionPapers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getPaperByCategoryForWeb = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch subcategories and years
    const subcatAndYears = await ExamYear.find({ catId: categoryId });

    // Initialize an array to store paper metadata
    const papersMetadata = [];

    // Iterate through each subcategory and year combination
    for (const subcatAndYear of subcatAndYears) {
      const { subCatId, _id: yearId, QPYear } = subcatAndYear;

      const subCategory = await SubExamType.findById(subCatId);

      // Fetch questions for the current subcategory and year combination
      const questions = await QuestionPaper.find({
        subCatID: subCatId,
        QPYearID: yearId,
      });

      // Push paper metadata (without questions) to the array
      papersMetadata.push({
        catID: categoryId,
        subCatId: subCatId,
        yearId: yearId,
        QPYear: QPYear,
        subCatName: subCategory ? subCategory.subCatName : "Unknown",
        questionPaperName: subCategory
          ? subCategory.questionPaperName
          : "Unknown",
        questionsLength: questions.length, // Include the length of the questions array
      });
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );

    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.json(papersMetadata);
  } catch (error) {
    console.error("Error fetching paper metadata:", error);
    res.status(500).json({ error: error.message });
  }
};

const getQuestionsForPaper = async (req, res) => {
  try {
    const { categoryId, subcatId, yearId } = req.params;

    // Fetch questions for the specified paper
    const questions = await QuestionPaper.find({
      catID: categoryId,
      subCatID: subcatId,
      QPYearID: yearId,
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );

    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaper,
  getAllPapers,
  getPaperByCategory,
  getPaperByCategoryForWeb,
  getQuestionsForPaper,
};
