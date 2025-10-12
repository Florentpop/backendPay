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
const Payment = require('../models/Payment');

exports.getTopSellingPackages = async (req, res) => {
  try {
    const topPackages = await Payment.aggregate([
      // 1️⃣ Join the Package collection
      {
        $lookup: {
          from: "packages",              // collection name (lowercase plural of model)
          localField: "packageId",       // field in Payment
          foreignField: "_id",           // field in Package
          as: "packageInfo"              // output array
        }
      },
      // 2️⃣ Flatten the joined array
      { $unwind: "$packageInfo" },
      // 3️⃣ Group by the package name
      {
        $group: {
          _id: "$packageInfo.name",
          totalSales: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      // 4️⃣ Sort and limit to top 5
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ success: true, data: topPackages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
