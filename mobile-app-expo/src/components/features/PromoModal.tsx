import React from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native';
import Animated, { FadeIn, ZoomIn, FadeOut, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface PromoModalProps {
  visible: boolean;
  onClose: () => void;
  imageUrl?: string;
}

export const PromoModal: React.FC<PromoModalProps> = ({ 
  visible, 
  onClose,
  imageUrl
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // We handle animation via Reanimated
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              entering={ZoomIn.springify().damping(15).delay(100)}
              exiting={ZoomOut.duration(200)}
              style={styles.modalContainer}
            >
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <Image 
                source={imageUrl ? { uri: imageUrl } : require('../../../assets/images/promo-poster.png')}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'visible', // For close button to float
  },
  closeBtn: {
    position: 'absolute',
    top: -40,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  image: {
    flex: 1,
    borderRadius: 16,
  },
});
