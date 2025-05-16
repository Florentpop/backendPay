const Package = require('../models/Package'); // adjust path as needed

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  const { name, active, duration, price } = req.body;
  const pkg = new Package({ name, active, duration, price });

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

    const { name, active, duration, price } = req.body;

    // if (id !== undefined) pkg.id = id;
    if (name !== undefined) pkg.name = name;
    if (active !== undefined) pkg.active = active;
    if (duration !== undefined) pkg.duration = duration;
    if (price !== undefined) pkg.price = price;

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

    await pkg.remove();
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
