const mongoose = require("mongoose");
const app = require("./app");

process.on("uncaughtException", () => {
  console.log("uncaught Exception Error");
  process.exit(1);
});

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = `mongodb+srv://shivamrawat06994:${encodeURIComponent(
  "#9911011005@Mongo@#"
)}@cluster0.lge6wvg.mongodb.net/natours`;

mongoose.connect(DB).then((_conn) => {
  console.log("connection established successfully!");
});

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`server started at port ${port}`);
});

process.on("unhandledRejection", () => {
  console.log("unhandled Rejection");
  server.close(() => {
    process.exit(1);
  });
});
