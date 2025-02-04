import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import axios from 'axios';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productInfo, setProductInfo] = useState<any>({
    name: null,
    halalStatus: null,
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Function to check product via the Node.js proxy API
  const checkHalalStatus = async (productName: string) => {
    try {
      const proxyResponse = await axios.post('http://192.168.1.100:5001/scan-product', {
        name: productName,
        halalStatus: 'Unknown', // Add logic here to determine halal status, if needed
      });

      console.log('Proxy Response:', proxyResponse.data);
      return proxyResponse.data.message === 'Product data saved successfully' ? 'Halal' : 'Non-Halal';
    } catch (error) {
      console.error("Error checking halal status:", error);
      return "Unknown (API Error)";
    }
  };

  async function handleBarCodeScanned({ type, data }: { type: string; data: string }) {
    if (isScanning) return;

    setIsScanning(true);
    setScannedData(`Type: ${type}, Data: ${data}`);
    console.log('Scanned Data:', data);

    try {
      // Fetch product details from Open Food Facts API
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      console.log('Open Food Facts Response:', response.data);

      if (response.data && response.data.status === 1) {
        const product = response.data.product;
        const productName = product.product_name || "Unknown";
        console.log('Product Name:', productName);

        // Check with Node.js proxy API
        const halalStatus = await checkHalalStatus(productName);
        console.log('Halal Status:', halalStatus);

        setProductInfo({ name: productName, halalStatus });
        setIsModalVisible(true); // Show the modal
      } else {
        setProductInfo({
          name: 'Unknown',
          halalStatus: 'Product not found in the database',
        });
        setIsModalVisible(true); // Show the modal
      }
    } catch (error) {
      console.error('Error fetching product information:', error);
      setProductInfo({
        name: 'Error',
        halalStatus: 'Failed to fetch product information',
      });
      setIsModalVisible(true); // Show the modal
    } finally {
      setTimeout(() => setIsScanning(false), 2000); // Reset scanning after 2 seconds
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'ean13', 'ean8'],
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Scanned Data */}
      {scannedData && (
        <Text style={styles.message}>Scanned Data: {scannedData}</Text>
      )}

      {/* Custom Modal for Product Info */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Product Information</Text>
            <Text style={styles.modalText}>Product: {productInfo.name || 'No product data'}</Text>
            <Text style={styles.modalText}>Status: {productInfo.halalStatus || 'Unknown'}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Overlay with some transparency
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    display: 'none',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 25,
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});