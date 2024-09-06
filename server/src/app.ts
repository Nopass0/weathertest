import express from "express";
import dotenv from "dotenv";
import authRoutes from "@/routes/authRoutes";
import weatherRoutes from "@/routes/weatherRoutes";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
