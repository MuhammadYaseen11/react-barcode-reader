import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import axios from 'axios'; // Import axios

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [productInfo, setProductInfo] = useState<any>({
    name: null, // Initialize with a default value
    halalStatus: null, // Initialize with a default value
  }); // State for storing product information

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Expanded list of haram ingredients
  const haramIngredients = [
    'pork', 'alcohol', 'gelatin', 'lard', 'carnivorous animals', 'blood',
    'rennet', 'enzymes', 'emulsifiers', 'e-numbers', 'e120', 'e904', 'e441'
  ];

  // Function to check if the product contains haram ingredients
  const containsHaramIngredients = (ingredientsText: string) => {
    if (!ingredientsText) return false;
    const lowerCaseIngredients = ingredientsText.toLowerCase();
    return haramIngredients.some(ingredient => lowerCaseIngredients.includes(ingredient));
  };

  // Function to check for halal certification
  const hasHalalCertification = (labelsTags: string[]) => {
    if (!labelsTags) return false;
    const halalCertificationKeywords = ['halal', 'halal-certified', 'halal-certification'];
    return labelsTags.some(label => halalCertificationKeywords.includes(label.toLowerCase()));
  };

  async function handleBarCodeScanned({ type, data }: { type: string; data: string }) {
    if (isScanning) return;

    setIsScanning(true);
    setScannedData(`Type: ${type}, Data: ${data}`);

    try {
      // Call the Open Food Facts API
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      console.log(response);
      if (response.data && response.data.status === 1) {
        const product = response.data.product;

        // Check if the product is a food item
        const isFoodItem = product.categories_tags?.some((category: string) =>
          ['food', 'fats', 'oils', 'dairy', 'meat', 'beverages'].some(keyword => category.includes(keyword))
        );

        if (!isFoodItem) {
          // Non-food items are not applicable for halal status
          setProductInfo({
            name: product.product_name || 'Unknown',
            halalStatus: 'Not Applicable (Non-Food Item)',
          });
        } else {
          // Check for halal certification
          const isHalalCertified = hasHalalCertification(product.labels_tags);

          // Check for haram ingredients
          const ingredientsText = product.ingredients_text || '';
          const hasHaramIngredients = containsHaramIngredients(ingredientsText);

          // Determine halal status
          let halalStatus;
          if (isHalalCertified) {
            halalStatus = 'Halal (Certified)';
          } else if (hasHaramIngredients) {
            halalStatus = 'Not Halal (Contains Haram Ingredients)';
          } else {
            halalStatus = 'Halal (No Haram Ingredients Detected)';
          }

          setProductInfo({
            name: product.product_name || 'Unknown',
            halalStatus: halalStatus,
          });
        }
        setIsModalVisible(true); // Show modal with product info
      } else {
        setProductInfo({
          name: 'Unknown',
          halalStatus: 'Product not found in the database',
        });
        setIsModalVisible(true); // Show modal with no product data
      }
    } catch (error) {
      console.error('Error fetching product information:', error);
      setProductInfo({
        name: 'Error',
        halalStatus: 'Failed to fetch product information',
      });
      setIsModalVisible(true); // Show modal with error message
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
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