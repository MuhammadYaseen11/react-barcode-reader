from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# URL of the Node.js server API
NODE_SERVER_URL = 'http://localhost:5000/scan-product'

@app.route('/scan-product', methods=['POST'])
def scan_product():
    # Extract data from the incoming request
    data = request.get_json()
    product_name = data.get('name')
    halal_status = data.get('halalStatus')

    if not product_name or not halal_status:
        return jsonify({"message": "Product name and halal status are required"}), 400

    # Send data to Node.js server
    response = requests.post(NODE_SERVER_URL, json={'name': product_name, 'halalStatus': halal_status})

    if response.status_code == 200:
        return jsonify({"message": "Product data forwarded successfully"}), 200
    else:
        return jsonify({"message": "Error forwarding product data", "error": response.text}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Running on port 5001