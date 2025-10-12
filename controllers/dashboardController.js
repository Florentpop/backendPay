const Package = require('../models/Package');
const Voucher = require('../models/Voucher');
const Payment = require('../models/Payment');


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
// controllers/dashboardController.j        

// 📈 Top-Selling Packages based on used vouchers
exports.getTopSellingPackages = async (req, res) => {
  try {
    // Step 1️⃣ Group by package field
    const grouped = await Voucher.aggregate([
      { $match: { used: true } }, // only used vouchers
      {
        $group: {
          _id: "$package", // use your actual field name here
          
          totalSales: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } } // highest total first
    ]);

    // Step 2️⃣ Compute grand total for percentage calculation
    const grandTotal = grouped.reduce((sum, item) => sum + item.totalSales, 0);

    // Step 3️⃣ Add percentage to each package result
    const formatted = grouped.map(pkg => ({
      _id: pkg._id,
      totalSales: pkg.totalSales,
      count: pkg.count,
      percentage: Number(((pkg.totalSales / grandTotal) * 100).toFixed(2))
    }));

    // Step 4️⃣ Send clean JSON output (no wrapper object)
    return res.status(200).json(formatted);

  } catch (error) {
    console.error("❌ Error computing top-selling packages:", error);
    return res.status(500).json({ message: error.message });
  }
};
