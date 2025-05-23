require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const packageRoutes = require('./routes/packageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const voucherRoutes = require('./routes/voucherRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost.com','https://hotspot-backend-dlwy.onrender.com']
}));
app.use(bodyParser.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
}).then(async() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Routes
app.use('/api', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/vouchers', voucherRoutes);

// List all packages
// app.get('/api/packages', async (req, res) => {
//   const packages = await Package.find({});
//   res.json(packages);
// });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
