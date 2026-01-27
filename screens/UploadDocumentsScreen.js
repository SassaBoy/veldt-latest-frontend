import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";

const MAX_FILE_SIZE_MB = 5;

const UploadDocumentsScreen = ({ navigation }) => {
  const route = useRoute();
  const { email } = route.params;

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const sizeMB = file.size / (1024 * 1024);

      if (sizeMB > MAX_FILE_SIZE_MB) {
        Toast.show({
          type: "error",
          text1: "File too large",
          text2: `Max ${MAX_FILE_SIZE_MB}MB`,
        });
        return;
      }

      setSelectedFile(file);
    } catch (err) {
      console.log("❌ Picker error:", err);
      Toast.show({ type: "error", text1: "Picker failed" });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Toast.show({ type: "error", text1: "Select a file first" });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("idDocument", {
        uri: selectedFile.uri,
        name: selectedFile.name || "document.pdf",
        type: "application/pdf",
      });

      console.log("📤 Uploading:", selectedFile.name);
      console.log("📧 Email:", email);

      // ✅ Use fetch instead of axios (better FormData support in React Native)
      const response = await fetch(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/upload-documents",
        {
          method: "POST",
          body: formData,
          headers: {
            // ✅ DO NOT set Content-Type - let fetch handle it automatically
            "Accept": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        // Log full error details for debugging
        console.log("❌ Server error details:", {
          status: response.status,
          message: data.message,
          error: data.error,
          errorDetails: data.errorDetails
        });
        throw new Error(data.error || data.message || "Upload failed");
      }

      console.log("✅ Upload success:", data);

      Toast.show({
        type: "success",
        text1: "Upload successful",
        text2: "Your document has been submitted",
      });

      // Navigate after a brief delay
      setTimeout(() => {
        navigation.navigate("ThankYou1");
      }, 1500);
    } catch (error) {
      console.log("❌ Upload failed:", error.message);

      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error.message || "Please check your connection and try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="folder-open" size={40} color="#1a237e" />
          <Text style={styles.title}>Upload Your ID</Text>
          <Text style={styles.subtitle}>PDF only · Max 5MB</Text>
        </View>

        <View style={styles.uploadSection}>
          {!selectedFile ? (
            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
              <Icon name="upload-file" size={48} color="#1a237e" />
              <Text style={styles.uploadText}>Select PDF</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileBox}>
              <Icon name="description" size={24} color="#1a237e" />
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Icon name="close" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedFile || isUploading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9ff" },
  container: { flex: 1, padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a237e", marginTop: 10 },
  subtitle: { color: "#666", marginTop: 5 },
  uploadSection: { flex: 1, justifyContent: "center" },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#1a237e",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  uploadText: { marginTop: 10, fontSize: 16, color: "#1a237e" },
  selectedFileBox: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#1a237e",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  uploadingText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UploadDocumentsScreen;