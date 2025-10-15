const axios = require('axios');
const Payment = require('../models/Payment');
const Voucher = require('../models/Voucher');

exports.verifyPayment = async (req, res) => {
  const { reference, packageName, amount } = req.body;

  console.log('🔍 Verifying payment...');
  console.log('📦 Received reference:', reference);
  console.log('📦 Package:', packageName, 'Amount:', amount);

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      }
    });

    const data = response.data;
    console.log('✅ Paystack data:', data);

    if (data.status && data.data.status === 'success') {
      const phone = data.data.customer.phone || data.data.authorization?.mobile_money_number;

      // 🔎 Find a matching, unused voucher
      const voucher = await Voucher.findOneAndUpdate(
        { package: packageName, price: amount, used: false },
        { used: true, assignedTo: phone, usedAt: new Date() },
        { new: true }
      );

      if (!voucher) {
        console.warn('⚠️ No available voucher found');
        return res.status(200).json({
          message: 'Payment verified, but no voucher is available.',
          success: false
        });
      }

      // 💾 Save payment with voucher code
      const payment = new Payment({
        reference,
        packageName,
        amount,
        phone,
        status: data.data.status,
        customer: data.data.customer.email || 'anonymous',
        voucherCode: voucher.code
      });

      await payment.save();
      console.log('💾 Payment saved with voucher:', payment);

      // 📲 Send SMS
      if (phone) {
        const formattedNumber = phone.startsWith('+')
          ? phone
          : `+233${phone.replace(/^0/, '')}`;

        try {
          const smsResponse = await axios.post(
            'https://sms.arkesel.com/api/v2/sms/send',
            {
              sender: 'Flosel Wifi',
              message: `Flosel WiFi Voucher Code: ${voucher.code}. To Check Status: flosel.hub/status`,
              recipients: [formattedNumber]
            },
            {
              headers: {
                'api-key': process.env.ARKESEL_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('📲 SMS sent:', smsResponse.data);
        } catch (smsError) {
          console.error('❌ Failed to send SMS:', smsError.response?.data || smsError.message);
        }
      } else {
        console.warn('⚠️ mobile_money_number not found. SMS not sent.');
      }

      return res.status(200).json({
        message: `Payment verified! Your voucher code is: ${voucher.code}`,
        success: true,
        voucher: voucher.code,
        package: voucher.package
      });

    } else {
      return res.status(400).json({
        message: 'Payment verification failed',
        success: false,
        data
      });
    }

  } catch (error) {
    console.error('❌ Verification error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.response?.data || error.message
    });
  }
};


// ✅ Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};

// ✅ Get single payment by reference
exports.getPaymentByReference = async (req, res) => {
  try {
    const payment = await Payment.findOne({ reference: req.params.reference });
    if (!payment)
      return res.status(404).json({ success: false, message: 'Payment not found' });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment',
      error: error.message
    });
  }
};

// ✅ Get payments by phone or customer (optional filter)
exports.searchPayments = async (req, res) => {
  try {
    const { phone, customer } = req.query;
    const query = {};

    if (phone) query.phone = phone;
    if (customer) query.customer = { $regex: customer, $options: 'i' };

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('❌ Error searching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching payments',
      error: error.message
    });
  }
};
