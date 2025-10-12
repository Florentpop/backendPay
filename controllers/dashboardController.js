const Package = require('../models/Package');
const Voucher = require('../models/Voucher');
const Payment = require('../models/Payment');
const Voucher = require('../models/Voucher');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();
    const totalVouchers = await Voucher.countDocuments();
    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);

    const totalSales = totalPayments.length ? totalPayments[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      data: {
        packages: totalPackages,
        vouchers: totalVouchers,
        payments: totalSales
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📈 For the Recharts line graph (voucher sales per day)
exports.getSalesStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🧮 Top-Selling Packages
// 📈 Top-Selling Packages based on voucher usage
exports.getTopSellingPackages = async (req, res) => {
  try {
    // Step 1️⃣: Group by package name (ensure correct field)
    const grouped = await Voucher.aggregate([
      { $match: { used: true } },
      {
        $group: {
          _id: "$package", // ⚠️ Make sure this matches your field name (use "$packageName" if that's your schema)
          totalSales: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    if (!grouped.length) {
      return res.status(200).json([]);
    }

    // Step 2️⃣: Compute grand total to calculate percentage
    const grandTotal = grouped.reduce((sum, pkg) => sum + pkg.totalSales, 0);

    // Step 3️⃣: Add percentage share
    const finalData = grouped.map(pkg => ({
      _id: pkg._id,
      totalSales: pkg.totalSales,
      count: pkg.count,
      percentage: Number(((pkg.totalSales / grandTotal) * 100).toFixed(2))
    }));

    res.status(200).json(finalData);
  } catch (error) {
    console.error("❌ Error getting top-selling packages:", error);
    res.status(500).json({ message: error.message });
  }
};
