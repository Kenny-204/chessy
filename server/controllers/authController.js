import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export const signup = catchAsync(async function (req, res, next) {
  const { email, username, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    email,
    username,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  res.status(201).json({ status: "success", data: newUser });
});
