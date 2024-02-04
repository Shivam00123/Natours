const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("../controllers/handlerFactory");

const filterNotAllowedValues = (obj, ...allowedValues) => {
  const filteredObject = {};

  Object.keys(obj).forEach((el) => {
    if (allowedValues.includes(el)) {
      filteredObject[el] = obj[el];
    }
  });
  return filteredObject;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(
      new ErrorHandler("This route is not valid for password updates!", 400)
    );
  }
  const filteredObjects = filterNotAllowedValues(
    req.body,
    "name",
    "email",
    "photo"
  );
  if (req.file) filteredObjects.photo = req.file.filename;
  if (!Object.keys(filteredObjects).length)
    return next(new ErrorHandler("Please provide some values to update", 400));

  const user = await User.findByIdAndUpdate(req.user._id, filteredObjects, {
    new: true,
    runValidators: true,
  });
  if (!user)
    return next(new ErrorHandler("User not find with the Id provided!", 401));

  res.status(200).json({
    status: "success",
    message: "Fields updated successfully!",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUsers = factory.getAllDocuments(User);

exports.aboutMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getMyDetails = factory.findById(User);

// const multerStorage = multer.diskStorage({ // We use this in order to write the file into disk to use it
//   destination: (req, file, cb) => {        // but now we are using a resize middleware we dont have to keep it in disk we simply put it in memory in order to read it which is more efficient
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     const name = `user-${req.user._id}-${Date.now()}.${ext}`;
//     cb(null, name);
//   },
// });

const multerStorage = multer.memoryStorage(); // it puts file in memory in buffer format

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Please provide image only!", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserImage = upload.single("photo");

exports.reszieUserImage = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`; //why because when we keep the image in memory we loose its details

  sharp(req.file.buffer) // buffer will be provided
    .resize(500, 500) // sqaure
    .toFormat("jpeg")
    .jpeg({ quality: 90 }) //retain 90% quality
    .toFile(`public/img/users/${req.file.filename}`); // destination

  next();
};
