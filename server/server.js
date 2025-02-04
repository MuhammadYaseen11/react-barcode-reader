const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware to parse JSON data and enable CORS
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB (Replace with your MongoDB URI)
mongoose.connect('mongodb+srv://yaseencyber:8lM5jrW1HPEr3BnZ@cluster0.p0zqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  halalStatus: String,
  scannedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Route to store product scan data
app.post('/scan-product', async (req, res) => {
  const { name, halalStatus } = req.body;

  try {
    const newProduct = new Product({ name, halalStatus });
    await newProduct.save();
    res.status(200).json({ message: 'Product data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving product data', error });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});