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

// import jwt from "jsonwebtoken";
// import debug from "debug";
// import adminModel from "../models/adminModel.js"; // Make sure this path is correct

// const debugging = debug("development:middleware:adminAuth");

// const adminAuth = async (req, res, next) => {
//   try {
//     // const { token } = req.headers;

//   // ✅ Get token from cookies, not headers
//     const token =  req.cookies.admin_token;

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Token missing. Please login again.",
//       });
//     }

//     // const decoded = jwt.verify(token, process.env.JWT_SECRET || "moretogo");
//  const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const admin = await adminModel.findById(decoded.id);
//     if (!admin || (admin.role !== 'admin' && !admin.isAdmin)) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized access. Admin only.",
//       });
//     }
//     req.admin = admin;   // hydrate for controllers
//     // req.user = decoded; // optionally pass info to route
//     next();
//   } catch (error) {
//     debugging(error);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token or session expired.",
//     });
//   }
// };

// export default adminAuth;



// middlewares/adminAuth.js
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

function getAdminToken(req) {
  // Authorization: Bearer <jwt>
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t && t !== "null" && t !== "undefined") return t;
  }
  // Cookie fallback
  if (req.cookies?.admin_token) return req.cookies.admin_token;
  return null;
}

export default async function adminAuth(req, res, next) {
  try {
    const token = getAdminToken(req);
    if (!token) return res.status(401).json({ success:false, message:"Token missing. Please login again." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await adminModel.findById(decoded.id).select("_id role isAdmin email");
    const role = String(admin?.role || "").toLowerCase();
    if (!admin || (role !== "admin" && !admin.isAdmin)) {
      return res.status(401).json({ success:false, message:"Unauthorized access. Admin only." });
    }

    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message: e.name === "TokenExpiredError" ? "Session expired. Please login again." : "Invalid token." });
  }
}


