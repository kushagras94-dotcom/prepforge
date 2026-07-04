const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const scorecardRoutes = require('./src/routes/scorecardRoutes');


connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
// ...
app.use('/api/scorecard', scorecardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));