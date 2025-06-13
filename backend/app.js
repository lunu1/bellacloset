// Import required modules
import express from "express";
import cors from "cors";
import "dotenv/config";
import debug from "debug";
import connectDB from "./config/mongodb-connection.config.js";
import cookieParser from 'cookie-parser';


import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import bannerRouter from "./routes/bannerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ProductRouter from "./routes/productRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

// Connect to MongoDB database
connectDB();

// App Config
const app = express();
const PORT = process.env.PORT || 4000;
const debugging = debug("development:app");

//cors
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'https://your-production-site.com',
  'https://your-admin-site.com'
];

// Middlewares
// app.use(cors());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints
app.use('/api/auth',authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", ProductRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/category", categoryRoutes);
app.use("/api/admin", adminRouter);


app.get("/", (req, res) => {
  res.send("API Working");
});

// Start the server and listen on process.env.port PORT
app.listen(PORT, () => {
  debugging("Server started on PORT: " + PORT);
});
