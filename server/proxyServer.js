const express = require('express');
const axios = require('axios'); // For making HTTP requests
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001;

// Middleware to parse JSON data and enable CORS
app.use(bodyParser.json());
app.use(cors());

// URL of the main Node.js server API
const NODE_SERVER_URL = 'http://localhost:5000/scan-product';

// Route to handle the scanning of products
app.post('/scan-product', async (req, res) => {
  const { name, halalStatus } = req.body;

  // Check if both name and halalStatus are provided
  if (!name || !halalStatus) {
    return res.status(400).json({ message: 'Product name and halal status are required' });
  }

  try {
    // Send data to the main Node.js server
    const response = await axios.post(NODE_SERVER_URL, { name, halalStatus });

    if (response.status === 200) {
      return res.status(200).json({ message: 'Product data forwarded successfully' });
    } else {
      return res.status(500).json({ message: 'Error forwarding product data', error: response.data });
    }
  } catch (error) {
    // Handle errors if the request to the main Node.js server fails
    return res.status(500).json({ message: 'Error forwarding product data', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});