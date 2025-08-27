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
import productRoutes from "./routes/productRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import varitantRoute from "./routes/variant.routes.js";  
import uploadRoutes from './routes/uploadRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import notifyRoutes from "./routes/notifyRoutes.js";

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
  'http://localhost:5175', // ✅ ADD THIS LINE
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




// app.use(
//   cors({
//     origin: "http://localhost:5175", // 👈 your frontend
//     credentials: true,               // ✅ allow cookies
//   })
// );


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints
app.use('/api/auth',authRouter);
app.use("/api/user", userRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/category", categoryRoutes);
app.use("/api/admin", adminRouter);
app.use('/api/coupon', couponRouter)
app.use("/api/wishlist", wishlistRouter);
app.use("/api/products", productRoutes);
app.use("/api/variants", varitantRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/admin/orders", adminOrderRoutes)
app.use("/api/notify", notifyRoutes);


app.get("/", (req, res) => {
  res.send("API Working");
});

// Start the server and listen on process.env.port PORT
app.listen(PORT, () => {
  debugging("Server started on PORT: " + PORT);
});
