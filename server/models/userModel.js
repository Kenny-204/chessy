import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    unique: true,
    type: String,
    validate: {
      validator: (val) => validator.isEmail(val),
      message: "Please provide a valid email",
    },
    required: [true, "Please provide your email"],
  },
  username: {
    unique: true,
    type: String,
    minLength: [3, "username should be at least three characters"],
    required: [true, "Please provide your username"],
  },
  password: {
    type: String,
    minLength: [4, "Password should be at least four characters"],
    required: [true, "Please provide your password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords are not the same",
    },
    required: [true, "Please confirm your passoword"],
  },
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (issuedAt) {
  if (this.passwordChangedAt) {
    const dateInSeconds = new Date(this.passwordChangedAt).getTime() / 1000;
    return dateInSeconds > issuedAt;
  }
  return false;
};

const User = mongoose.model("users", userSchema);

export default User;
