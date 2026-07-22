import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import { initPassport } from "./config/passport";
import authRouter from "./routes/auth";
import profileRouter from "./routes/profile";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initPassport();
app.use(passport.initialize());

//routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
