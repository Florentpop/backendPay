const Voucher = require('../models/Voucher');
const XLSX = require('xlsx');

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Bulk create vouchers from Excel
exports.uploadVouchers = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      const requiredFields = ['code', 'package', 'price'];
      const headers = Object.keys(data[0] || {});
      const missingFields = requiredFields.filter(field => !headers.includes(field));
  
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
      }
  
      const invalidRows = [];
      const allCodes = data.map(item => item.code);
      const existingVouchers = await Voucher.find({ code: { $in: allCodes } }).select('code');
      const existingCodes = new Set(existingVouchers.map(v => v.code));
  
      const duplicates = [];
      const vouchers = data.map((item, index) => {
        const rowNumber = index + 2;
        if (
          typeof item.code !== 'string' ||
          typeof item.package !== 'string' ||
          typeof item.price !== 'number'
        ) {
          invalidRows.push(rowNumber);
          return null;
        }
  
        if (existingCodes.has(item.code)) {
          duplicates.push(item.code);
          return null;
        }
  
        return {
          code: item.code,
          package: item.package,
          price: item.price,
          used: item.used || false,
          assignedTo: item.assignedTo || null,
          usedAt: item.usedAt ? new Date(item.usedAt) : null
        };
      }).filter(Boolean);
  
      if (invalidRows.length > 0) {
        return res.status(400).json({ error: `Invalid data types in rows: ${invalidRows.join(', ')}` });
      }
  
      const inserted = await Voucher.insertMany(vouchers);
      res.status(201).json({
        message: 'Vouchers uploaded',
        insertedCount: inserted.length,
        duplicateCodes: duplicates
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


// Get all vouchers
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single voucher by code
exports.getVoucherByCode = async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ code: req.params.code });
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark voucher as used
exports.useVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ code: req.params.code });
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    if (voucher.used) {
      return res.status(400).json({ message: 'Voucher already used' });
    }
    voucher.used = true;
    voucher.usedAt = new Date();
    voucher.assignedTo = req.body.assignedTo || voucher.assignedTo;
    await voucher.save();
    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
