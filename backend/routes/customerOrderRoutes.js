const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  sendEmailInvoiceToCustomer,
  requestRefund,
  createPhonePeOrder,
  handlePhonePeCallback,
  handlePhonePeWebhook,
  getPhonePeStatusApi,
} = require("../controller/customerOrderController");

const { emailVerificationLimit } = require("../lib/email-sender/sender");
const { isAuth, isAuthOptional } = require("../config/auth");

//add a order
router.post("/add", isAuthOptional, addOrder);

// create stripe payment intent
router.post("/create-payment-intent", isAuthOptional, createPaymentIntent);

//add razorpay order
router.post("/add/razorpay", isAuthOptional, addRazorpayOrder);

//add a order by razorpay
router.post("/create/razorpay", isAuthOptional, createOrderByRazorPay);

// PhonePe Payment Routes
router.post("/create-phonepe-payment", isAuthOptional, createPhonePeOrder);
router.all("/phonepe-callback", handlePhonePeCallback);
router.post("/phonepe-webhook", handlePhonePeWebhook);
router.get("/phonepe-status/:transactionId", isAuthOptional, getPhonePeStatusApi);

//get a order by id
router.get("/:id", isAuthOptional, getOrderById);

//get all order by a user
router.get("/", isAuth, getOrderCustomer);

//request refund for an order
router.put("/refund/:id", isAuth, requestRefund);

//#send email invoice to customer
router.post(
  "/customer/invoice",
  isAuth,
  emailVerificationLimit,
  sendEmailInvoiceToCustomer
);

module.exports = router;
