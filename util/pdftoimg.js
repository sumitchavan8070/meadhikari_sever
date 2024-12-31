// const { fromPath } = require("pdf2pic");
// const fs = require("fs-extra");
// const path = require("path");

// // Path to your PDF file
// const pdfPath =
//   "/home/sumit/Project/App/server/QuestionPaperPdf/Combine new 2023.pdf";

// // Output directory for images
// const outputDir = "/home/sumit/Project/App/server/pic/";

// const converter = fromPath(pdfPath, {
//   density: 300, // DPI for high-quality images
//   saveFilename: "image_", // Base name for output files
//   savePath: outputDir, // Output directory for images
//   format: "jpg", // Image format ('jpg', 'png', or 'webp')
//   width: 2480, // Width for A4 size at 300 DPI
//   height: 3508, // Height for A4 size at 300 DPI
//   suffix: "", // Suffix for output image files
// });

// converter
//   .bulk(-1) // Convert all pages. You can specify a single page number here.
//   .then((results) => {
//     results.forEach((result, index) => {
//       const oldPath = result.path;
//       const newPath = path.join(outputDir, `image_${index + 1}.jpg`);
//       fs.move(oldPath, newPath)
//         .then(() => console.log("Image moved:", newPath))
//         .catch((error) => console.error("Error moving image:", error));
//     });
//     console.log("Images converted successfully:", results);
//   })
//   .catch((error) => {
//     console.error("Error converting PDF to images:", error);
//   });

const { fromPath } = require("pdf2pic");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp"); // For image processing

// Path to your PDF file
const pdfPath =
  "/home/sumit/Project/App/meadhikari_sever/QuestionPaperPdf/testmpsc2011psi.pdf";

// Temporary directory for storing images
const tempDir = "/home/sumit/Project/App/meadhikari_sever/pic";

// Ensure the temporary directory exists
fs.ensureDirSync(tempDir);

// PDF to image conversion settings
const pdf2pic = fromPath(pdfPath, {
  density: 600, // High DPI for better quality
  saveFilename: "page",
  savePath: tempDir,
  format: "jpg",
  width: 4960, // Ultra-high resolution
  height: 7016, // Ultra-high resolution
});

// Function to enhance the image for OCR
async function enhanceImage(imagePath) {
  try {
    // Read and process the image
    const buffer = fs.readFileSync(imagePath);
    const preprocessedBuffer = await sharp(buffer)
      .grayscale() // Convert to grayscale
      .blur(1) // Apply slight Gaussian blur to reduce noise
      .normalize() // Normalize brightness and contrast
      .threshold(128, { greyscale: true }) // Apply adaptive thresholding
      .modulate({ contrast: 2.5 }) // Increase contrast
      .sharpen() // Sharpen text edges
      .toBuffer();

    // Overwrite the original image with the enhanced version
    fs.writeFileSync(imagePath, preprocessedBuffer);
    console.log("Enhanced image saved:", imagePath);

    return imagePath;
  } catch (error) {
    console.error("Error enhancing image:", imagePath, error);
    throw error;
  }
}

// Convert PDF to images and enhance each image
async function processPDF() {
  try {
    console.log("Converting PDF to images...");

    // Convert all pages of the PDF to images
    const results = await pdf2pic.bulk(-1); // Convert all pages
    console.log(`PDF converted to ${results.length} images.`);

    // Enhance each converted image
    for (let result of results) {
      const imagePath = result.path;
      console.log("Processing image:", imagePath);

      try {
        // Enhance the image for OCR
        await enhanceImage(imagePath);
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
      }
    }

    console.log("All images processed and enhanced successfully.");
  } catch (error) {
    console.error("Error during PDF processing:", error);
  }
}

// Start the process
processPDF();
