import express from "express";
import userRouter from "./routes/userRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/AppError.js";

const app = express();
app.use(express.json());

app.use("/api/v1/users", userRouter);


app.use("/{*any}", function (req, res, next) {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
