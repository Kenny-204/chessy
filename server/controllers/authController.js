import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { promisify } from "util";

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function sendCookie(name, value, res) {
  return res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

export const protect = catchAsync(async function (req, res, next) {
  const token = req.cookies.jwt;

  if (!token)
    return new AppError("You are not logged in. Login to gain access", 401);

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = User.findById(decoded.id);

  if (!currentUser) return new AppError("There is no user for this token", 401);
  if (currentUser.changedPasswordAfter)
    return new AppError(
      "This user changed password recently. Login again",
      403
    );
  req.user = currentUser;

  next();
});

export const signup = catchAsync(async function (req, res, next) {
  const { email, username, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    email,
    username,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  sendCookie("jwt", token, res);

  res.status(201).json({ status: "success", data: newUser });
});

export const login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(`Please provide email and password`, 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return new AppError(`Invalid email or password`, 401);

  const token = signToken(user._id);

  sendCookie("jwt", token, res);

  res.status(200).json({ status: "success" });
});
