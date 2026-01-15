import AppError from "../utils/AppError.js";

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err: err,
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else
    res.status(500).json({ status: "fail", message: "something went wrong" });
}

function handleValidationError(err) {
  const errors = Object.values(err.errors).map((err) => err);
  const message = `Invalid Input. ${errors.join(". ")}`;

  return new AppError(message, 400);
}

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  // if it's in dev environment call sendErrorDev (sendErrorDev shows error in detail)
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;
    if (error.name === "ValidationError") error = handleValidationError(error);
    sendErrorProd(error, res);
  }
  next();
};
