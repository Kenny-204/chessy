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
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  } else
    res.status(500).json({ status: "fail", message: "something went wrong" });
}

export default (err, req, res, next) => {
  // if it's in dev environment call sendErrorDev (sendErrorDev shows error in detail)
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, res);
  }
  next();
};
