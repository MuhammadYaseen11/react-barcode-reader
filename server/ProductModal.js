import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const ProductModal = ({ visible, productInfo, onClose }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Product Information</Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Product: {productInfo?.name || 'No product data'}</Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Status: {productInfo?.halalStatus || 'Unknown'}</Text>
          <TouchableOpacity style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 }} onPress={onClose}>
            <Text style={{ color: 'white', fontSize: 16 }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;
