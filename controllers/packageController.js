const Package = require('../models/Package'); // adjust path as needed
const Voucher = require('../models/Voucher');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivePackages = async (req, res) => {
  try {
    // Only fetch packages that are active
    const packages = await Package.find({ active: true });

    // Get all unused vouchers
    const vouchers = await Voucher.find({ used: false });

    // Count available vouchers per package
    const voucherCount = {};
    vouchers.forEach(v => {
      voucherCount[v.package] = (voucherCount[v.package] || 0) + 1;
    });

    // Merge available count into package list
    const results = packages.map(pkg => ({
      name: pkg.name,
      price: pkg.price,
      active: pkg.active,
      category: pkg.category,
      available: voucherCount[pkg.name] || 0
    }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new package
exports.createPackage = async (req, res) => {
  const { name, active, duration, price,category } = req.body;
  const pkg = new Package({ name, active, duration, price,category });

  try {
    const newPackage = await pkg.save();
    res.status(201).json(newPackage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a package
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const { name, active, duration, price,category } = req.body;

    // if (id !== undefined) pkg.id = id;
    if (name !== undefined) pkg.name = name;
    if (active !== undefined) pkg.active = active;
    if (duration !== undefined) pkg.duration = duration;
    if (price !== undefined) pkg.price = price;
    if (category !== undefined) pkg.category = category;


    const updatedPackage = await pkg.save();
    res.json(updatedPackage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    await pkg.deleteOne();
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
