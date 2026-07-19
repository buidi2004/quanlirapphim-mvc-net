import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert, Vibration } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../theme/tokens';
import { apiClient } from '../../api/apiClient';

export const ScannerScreen = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    Vibration.vibrate();

    try {
      let isConcession = false;
      let ticketId = data;

      try {
        const payload = JSON.parse(data);
        if (payload.type === 'concession') {
          isConcession = true;
        }
        ticketId = data; // Keep the whole payload to send to API
      } catch (e) {
        // Not JSON, normal ticket ID
      }

      const endpoint = isConcession ? '/scanner/scan-concession' : '/scanner/scan';
      const response = await apiClient.post(endpoint, { ticketId });
      
      if (response.data?.success) {
        if (isConcession) {
          Alert.alert(
            'Giao bắp nước', 
            `Đã giao thành công bắp nước!\nPhim: ${response.data.data.movie}\nGhế: ${response.data.data.seat}`,
            [{ text: 'Quét tiếp', onPress: () => setScanned(false) }]
          );
        } else {
          Alert.alert(
            'Thành công', 
            `Khách check-in thành công!\nPhim: ${response.data.data.movie}\nPhòng: ${response.data.data.room}\nGhế: ${response.data.data.seat}\nGiờ chiếu: ${response.data.data.time}`,
            [{ text: 'Quét tiếp', onPress: () => setScanned(false) }]
          );
        }
      } else {
        Alert.alert('Lỗi', response.data?.message || 'Có lỗi xảy ra', [{ text: 'Quét lại', onPress: () => setScanned(false) }]);
      }
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể kết nối đến máy chủ.',
        [{ text: 'Quét lại', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Đang yêu cầu quyền sử dụng camera...</Text></View>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Bạn chưa cấp quyền sử dụng camera.</Text>
        <Button title="Cấp quyền" onPress={() => Camera.requestCameraPermissionsAsync()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Quét Vé Cửa</Text>
        <View style={{ width: 40 }} />
      </View>

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.scanText}>Căn mã QR của khách vào khung</Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Theme.colors.warning,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  scanText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  }
});
