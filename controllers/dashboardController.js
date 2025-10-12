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
    const topPackages = await Voucher.aggregate([
      // ✅ Only count used vouchers
      { $match: { used: true } },

      // ✅ Group by package name
      {
        $group: {
          _id: "$package",
          totalSales: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },

      // ✅ Calculate total sales sum for percentage
      {
        $group: {
          _id: null,
          packages: { $push: "$$ROOT" },
          grandTotal: { $sum: "$totalSales" }
        }
      },

      // ✅ Flatten packages array
      { $unwind: "$packages" },

      // ✅ Compute percentage for each package
      {
        $project: {
          _id: "$packages._id",
          totalSales: "$packages.totalSales",
          count: "$packages.count",
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$packages.totalSales", "$grandTotal"] }, 100] },
              2
            ]
          }
        }
      },

      // ✅ Sort and limit to top 5
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: topPackages
    });
  } catch (error) {
    console.error("❌ Error getting top-selling packages:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
