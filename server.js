require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const packageRoutes = require('./routes/packageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require("./routes/authRoutes");



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost.com','https://hotspot-backend-dlwy.onrender.com','http://127.0.0.1:5500', 'http://flosel.hub','http://flosel.com','https://flosel.com','http://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
}).then(async() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Routes
// app.use('/api', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use("/api/auth", authRoutes);



// List all packages
// app.get('/api/packages', async (req, res) => {
//   const packages = await Package.find({});
//   res.json(packages);
// });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
