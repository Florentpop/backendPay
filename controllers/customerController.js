const Payment = require("../models/Payment");
const CustomerGroup = require("../models/CustomerGroup");
const axios = require("axios");

// 📱 Get all customers (optionally filtered by group)
exports.getCustomers = async (req, res) => {
  try {
    const { group } = req.query; // optional: ?group=groupId

    // ✅ Base customer data from payments
    const allCustomers = await Payment.aggregate([
      { $match: { phone: { $ne: null } } },
      {
        $group: {
          _id: "$phone",
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          lastPayment: { $max: "$createdAt" },
          packages: { $addToSet: "$packageName" },
        },
      },
      { $sort: { lastPayment: -1 } },
    ]);

    // ✅ Default "All Customers" group
    if (!group || group === "all") {
      return res.status(200).json({
        success: true,
        group: "All Customers",
        data: allCustomers,
      });
    }

    // ✅ Filter by specific group
    const grp = await CustomerGroup.findById(group);
    if (!grp)
      return res.status(404).json({ message: "Group not found", success: false });

    const filtered = allCustomers.filter((c) => grp.members.includes(c._id));

    return res.status(200).json({
      success: true,
      group: grp.name,
      data: filtered,
    });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📤 Send SMS to selected customers
exports.sendSMS = async (req, res) => {
  try {
    const { message, recipients } = req.body;

    if (!recipients?.length)
      return res.status(400).json({ message: "No recipients provided" });

    const formatted = recipients.map((num) =>
      num.startsWith("+") ? num : `+233${num.replace(/^0/, "")}`
    );

    const smsResponse = await axios.post(
      "https://sms.arkesel.com/api/v2/sms/send",
      {
        sender: "Flosel Wifi",
        message,
        recipients: formatted,
      },
      {
        headers: {
          "api-key": process.env.ARKESEL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "SMS sent successfully",
      response: smsResponse.data,
    });
  } catch (error) {
    console.error("❌ SMS error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to send SMS", error });
  }
};

// 🧩 Create a group
exports.createGroup = async (req, res) => {
  try {
    const group = new CustomerGroup(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
};

// 🧩 Get all groups (with dynamic "All Customers")
exports.getGroups = async (req, res) => {
  try {
    const groups = await CustomerGroup.find().sort({ name: 1 });

    // ✅ Dynamically generate "All Customers" members from Payment collection
    const allPhones = await Payment.distinct("phone", { phone: { $ne: null } });

    const allGroup = {
      _id: "all",
      name: "All Customers",
      description: "Default group containing all customers",
      members: allPhones,
      dynamic: true,
    };

    res.status(200).json([allGroup, ...groups]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error });
  }
};

// 🧩 Add customers to a group
exports.addToGroup = async (req, res) => {
  try {
    const { groupId, phones } = req.body;
    if (groupId === "all")
      return res.status(400).json({ message: "Cannot modify default group" });

    const group = await CustomerGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members.push(...phones.filter((p) => !group.members.includes(p)));
    await group.save();

    res.status(200).json({ message: "Customers added to group", group });
  } catch (error) {
    res.status(500).json({ message: "Error adding to group", error });
  }
};
