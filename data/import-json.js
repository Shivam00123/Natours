const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("../models/tourModel");

const DB = `mongodb+srv://shivamrawat06994:${encodeURIComponent(
  "#9911011005@Mongo@#"
)}@cluster0.lge6wvg.mongodb.net/natours`;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("connection established successfully!");
  });

const jsonFile = fs.readFileSync("./tours.json", "utf-8");

const importJSONToDB = async () => {
  try {
    const tours = await Tour.create(JSON.parse(jsonFile));
    console.log({ tours });
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
const deleteDataFromDB = async () => {
  try {
    await Tour.deleteMany();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importJSONToDB();
} else if (process.argv[2] === "--delete") {
  deleteDataFromDB();
}
