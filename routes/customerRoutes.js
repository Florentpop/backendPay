const express = require("express");
const router = express.Router();
const {
  getCustomers,
  sendSMS,
  createGroup,
  getGroups,
  addToGroup,
  getCustomerPayments,
} = require("../controllers/customerController");

router.get("/", getCustomers);
router.post("/send-sms", sendSMS);
router.post("/groups", createGroup);
router.get("/groups", getGroups);
router.post("/groups/add", addToGroup);
router.get("/payments/:phone", getCustomerPayments);


module.exports = router;
