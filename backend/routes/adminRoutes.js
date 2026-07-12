const express = require("express");
const router = express.Router();
const { isAuth, isAdmin, isSuperAdmin } = require("../config/auth");
const {
  registerAdmin,
  loginAdmin,
  forgetPassword,
  resetPassword,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updatedStatus,
  updateFcmToken,
} = require("../controller/adminController");
const { passwordVerificationLimit } = require("../lib/email-sender/sender");

//register a staff (only super admin can register a new admin/staff)
router.post("/register", isAuth, isSuperAdmin, registerAdmin);

//login a admin
router.post("/login", loginAdmin);

//forget-password
router.put("/forget-password", passwordVerificationLimit, forgetPassword);

//reset-password
router.put("/reset-password", resetPassword);

//add a staff
router.post("/add", isAuth, isSuperAdmin, addStaff);

//get all staff
router.get("/", isAuth, isSuperAdmin, getAllStaff);

//get a staff
router.post("/:id", isAuth, isSuperAdmin, getStaffById);

//update a staff
router.put("/:id", isAuth, isSuperAdmin, updateStaff);

//update staf status
router.put("/update-status/:id", isAuth, isSuperAdmin, updatedStatus);

//delete a staff
router.delete("/:id", isAuth, isSuperAdmin, deleteStaff);

// update fcm token
router.put("/update-fcm-token/:id", isAuth, isAdmin, updateFcmToken);

module.exports = router;
