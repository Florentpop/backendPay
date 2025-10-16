const Package = require("../models/Package");
const Voucher = require("../models/Voucher");
const Payment = require("../models/Payment");

// 📊 Dashboard Summary Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Basic counts
    const totalPackages = await Package.countDocuments();
    const totalVouchers = await Voucher.countDocuments();

    // 2️⃣ Date Ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 3️⃣ Payments this month & previous month
    const [thisMonthPayments, prevMonthPayments] = await Promise.all([
      Payment.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalThisMonth = thisMonthPayments[0]?.total || 0;
    const totalPrevMonth = prevMonthPayments[0]?.total || 0;

    // 🧮 Payment change (%)
    const paymentChange =
      totalPrevMonth > 0
        ? ((totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100
        : 0;

    // 4️⃣ Customers — distinct phone numbers
    const totalCustomers = await Payment.distinct("phone", { phone: { $ne: null } });
    const activeThisMonth = await Payment.distinct("phone", {
      phone: { $ne: null },
      createdAt: { $gte: startOfThisMonth },
    });
    const activePrevMonth = await Payment.distinct("phone", {
      phone: { $ne: null },
      createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    });

    // 🧮 Active customer change (%)
    const activeChange =
      activePrevMonth.length > 0
        ? ((activeThisMonth.length - activePrevMonth.length) / activePrevMonth.length) * 100
        : 0;

    // 5️⃣ Sales summary (all-time)
    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalSales = totalPayments.length ? totalPayments[0].totalAmount : 0;

    // 6️⃣ Response
    res.status(200).json({
      success: true,
      data: {
        packages: totalPackages,
        vouchers: totalVouchers,
        payments: {
          totalThisMonth,
          totalPrevMonth,
          totalSales,
          change: Number(paymentChange.toFixed(2)),
          increased: totalThisMonth >= totalPrevMonth,
        },
        customers: {
          total: totalCustomers.length,
          activeThisMonth: activeThisMonth.length,
          change: Number(activeChange.toFixed(2)),
          increased: activeThisMonth.length >= activePrevMonth.length,
        },
        period: {
          thisMonth: now.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          previousMonth: endOfPrevMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        },
      },
    });
    
  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📈 Voucher Sales Per Day (for Recharts)
exports.getSalesStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🏆 Top-Selling Packages
exports.getTopSellingPackages = async (req, res) => {
  try {
    const grouped = await Voucher.aggregate([
      { $match: { used: true } },
      {
        $group: {
          _id: "$package",
          totalSales: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const grandTotal = grouped.reduce((sum, i) => sum + i.totalSales, 0);

    const formatted = grouped.map((pkg) => ({
      _id: pkg._id,
      totalSales: pkg.totalSales,
      count: pkg.count,
      percentage: Number(((pkg.totalSales / grandTotal) * 100).toFixed(2)),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ Top Packages Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentPayments = async (req, res) => {
  try {
    const recent = await Payment.find().sort({ createdAt: -1 }).limit(10);
    console.log("🧾 Recent payments:", recent.length, "records found");

    res.status(200).json({
      success: true,
      data: recent,
    });
  } catch (err) {
    console.error("❌ getRecentPayments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

