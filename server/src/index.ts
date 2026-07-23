import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import { initPassport } from "./config/passport";
import authRouter from "./routes/auth";
import profileRouter from "./routes/profile";
import attributesRouter from "./routes/attributes";
import positionsRouter from "./routes/positions";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initPassport();
app.use(passport.initialize());

//routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attributes", attributesRouter);
app.use("/api/positions", positionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
