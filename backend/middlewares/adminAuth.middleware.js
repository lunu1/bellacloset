// import jwt from "jsonwebtoken";
// import debug from "debug";

// const debugging = debug("development:middleware:adminAuth");

// const adminAuth = (req, res, next) => {
//   try {
//     const { token } = req.headers;
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Not Authorized Login Again.",
//       });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); //3
//     if (decoded.id !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//       return res.status(401).json({
//         success: false,
//         message: "Not Authorized Login Again.",
//       });
//     }
//     next();
//   } catch (error) {
//     debugging(error);
//     return res.status(401).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export default adminAuth;



//New code for admin login

import jwt from "jsonwebtoken";
import debug from "debug";
import adminModel from "../models/adminModel.js"; // Make sure this path is correct

const debugging = debug("development:middleware:adminAuth");

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing. Please login again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await adminModel.findById(decoded.id);
    if (!admin || !admin.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Admin only.",
      });
    }

    req.user = decoded; // optionally pass info to route
    next();
  } catch (error) {
    debugging(error);
    return res.status(401).json({
      success: false,
      message: "Invalid token or session expired.",
    });
  }
};

export default adminAuth;
