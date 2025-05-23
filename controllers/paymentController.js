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
              message: `Your Flosel WiFi voucher: ${voucher.code}. Thank you!`,
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
