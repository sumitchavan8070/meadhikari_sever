const { Server } = require("socket.io");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const server = http.createServer(app);
const chatSocket = require("./Socket/chatSocket");

const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cron = require("node-cron");
const userModel = require("./models/userModel");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//dotenv
dotenv.config();

//database connection
connectDB();

//Rest Object

//middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

//routes
// defalut route

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MeAdhikari.",
  });
});

chatSocket(io);

//custome route
app.use("/api/v1/auth", require("./routes/examplefirstRoute"));
app.use("/api/v1/admin", require("./routes/examplesecoundRoute"));

app.use("/api/v1/auth/posts", require("./routes/postRoutes"));
app.use("/api/v1/admin/posts", require("./routes/postRoutes"));

app.use("/api/v1/auth/years", require("./routes/examYearRoutes")); // Done , for frontend
app.use(
  "/api/v1/auth/question-papers",
  require("./routes/questionPaperRoutes")
);
app.use(
  "/api/v1/admin/question-papers",
  require("./routes/questionPaperRoutes")
);

app.use("/api/v1/auth/subjects", require("./routes/subjectRoutes")); // Include subject routes

app.use("/api/v1/auth/groups", require("./routes/groupRoutes"));

app.use("/api/v1/auth/customtest", require("./routes/customTestRoutes"));

//port
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is Running ${PORT}`.bgGreen.white);
});
