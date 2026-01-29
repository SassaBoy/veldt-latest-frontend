import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const MAX_FILE_SIZE_MB = 5;

const UploadDocumentsScreen = ({ navigation }) => {
  const route = useRoute();
  const { email } = route.params;

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress] = useState(new Animated.Value(0));

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
          text2: `Maximum file size is ${MAX_FILE_SIZE_MB}MB`,
        });
        return;
      }

      setSelectedFile(file);
      Toast.show({
        type: "success",
        text1: "File selected",
        text2: file.name,
      });
    } catch (err) {
      console.log("❌ Picker error:", err);
      Toast.show({ type: "error", text1: "Failed to select file" });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Toast.show({ type: "error", text1: "Please select a file first" });
      return;
    }

    setIsUploading(true);

    // Animate progress
    Animated.timing(uploadProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

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

      const response = await fetch(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/upload-documents",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        console.log("❌ Server error details:", {
          status: response.status,
          message: data.message,
          error: data.error,
          errorDetails: data.errorDetails,
        });
        throw new Error(data.error || data.message || "Upload failed");
      }

      console.log("✅ Upload success:", data);

      Toast.show({
        type: "success",
        text1: "Upload successful!",
        text2: "Your document has been submitted",
      });

      setTimeout(() => {
        navigation.navigate("ThankYou1");
      }, 1500);
    } catch (error) {
      console.log("❌ Upload failed:", error.message);

      // Reset progress
      uploadProgress.setValue(0);

      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: error.message || "Please check your connection and try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={styles.iconInnerCircle}>
                <Icon name="folder-open" size={48} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.title}>Document Verification</Text>
            <Text style={styles.subtitle}>
              Upload your required documents for verification
            </Text>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.stepDotInactive]} />
            </View>
          </View>

          {/* Current Document Section */}
          <View style={styles.documentTypeCard}>
            <View style={styles.documentTypeHeader}>
              <View style={styles.documentIconBadge}>
                <Icon name="badge" size={24} color="#1a237e" />
              </View>
              <View style={styles.documentTypeInfo}>
                <Text style={styles.documentTypeTitle}>Government ID</Text>
                <Text style={styles.documentTypeSubtitle}>
                  National ID, Passport, or Driver's License
                </Text>
              </View>
            </View>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>

          {/* Information Cards */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Requirements</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconCircle}>
                  <Icon name="picture-as-pdf" size={22} color="#1a237e" />
                </View>
                <Text style={styles.infoTitle}>PDF Only</Text>
                <Text style={styles.infoText}>Format</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconCircle}>
                  <Icon name="storage" size={22} color="#1a237e" />
                </View>
                <Text style={styles.infoTitle}>Max {MAX_FILE_SIZE_MB}MB</Text>
                <Text style={styles.infoText}>File Size</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconCircle}>
                  <Icon name="verified-user" size={22} color="#1a237e" />
                </View>
                <Text style={styles.infoTitle}>Encrypted</Text>
                <Text style={styles.infoText}>Secure</Text>
              </View>
            </View>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Upload Document</Text>

            {!selectedFile ? (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickDocument}
                activeOpacity={0.7}
              >
                <View style={styles.uploadContent}>
                  <View style={styles.uploadIconWrapper}>
                    <Icon name="cloud-upload" size={56} color="#1a237e" />
                  </View>
                  <Text style={styles.uploadTitle}>Choose File</Text>
                  <Text style={styles.uploadSubtext}>
                    PDF documents up to {MAX_FILE_SIZE_MB}MB
                  </Text>
                  <View style={styles.uploadActionButton}>
                    <Icon name="add-circle-outline" size={20} color="#1a237e" />
                    <Text style={styles.uploadActionText}>Browse Files</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedFileContainer}>
                <View style={styles.selectedFileBox}>
                  <View style={styles.filePreview}>
                    <View style={styles.fileIconContainer}>
                      <Icon name="description" size={36} color="#1a237e" />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <View style={styles.fileMetadata}>
                        <View style={styles.fileSizeContainer}>
                          <Icon name="insert-drive-file" size={14} color="#999" />
                          <Text style={styles.fileSize}>
                            {formatFileSize(selectedFile.size)}
                          </Text>
                        </View>
                        <View style={styles.fileStatusContainer}>
                          <Icon name="check-circle" size={14} color="#4CAF50" />
                          <Text style={styles.fileStatusText}>Ready</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setSelectedFile(null)}
                      activeOpacity={0.7}
                    >
                      <Icon name="delete-outline" size={24} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Replace File Button */}
                <TouchableOpacity
                  style={styles.replaceFileButton}
                  onPress={pickDocument}
                  activeOpacity={0.7}
                >
                  <Icon name="sync" size={20} color="#1a237e" />
                  <Text style={styles.replaceFileText}>Replace File</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Progress Indicator */}
          {isUploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Uploading...</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(uploadProgress._value * 100)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: uploadProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                Please wait while we securely process your document
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedFile || isUploading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedFile || isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="upload" size={22} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Document</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Footer */}
          <View style={styles.securityFooter}>
            <View style={styles.securityIconWrapper}>
              <Icon name="lock" size={18} color="#4CAF50" />
            </View>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Your data is secure</Text>
              <Text style={styles.securityText}>
                All documents are encrypted and stored in compliance with data protection regulations
              </Text>
            </View>
          </View>

          {/* Future Documents Preview */}
          <View style={styles.futureDocsSection}>
            <Text style={styles.futureDocsTitle}>Additional Documents</Text>
            <Text style={styles.futureDocsSubtitle}>
              You may be asked to provide additional verification documents later
            </Text>
            <View style={styles.futureDocsList}>
              <View style={styles.futureDocItem}>
                <Icon name="check-circle-outline" size={18} color="#ccc" />
                <Text style={styles.futureDocText}>Proof of Address</Text>
              </View>
              <View style={styles.futureDocItem}>
                <Icon name="check-circle-outline" size={18} color="#ccc" />
                <Text style={styles.futureDocText}>Business License</Text>
              </View>
              <View style={styles.futureDocItem}>
                <Icon name="check-circle-outline" size={18} color="#ccc" />
                <Text style={styles.futureDocText}>Certifications</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a237e",
  },
  stepDotInactive: {
    backgroundColor: "#e0e0e0",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e0e0e0",
  },
  documentTypeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#1a237e",
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  documentTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  documentIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(26, 35, 126, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  documentTypeInfo: {
    flex: 1,
  },
  documentTypeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 4,
  },
  documentTypeSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  requiredBadge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff9800",
  },
  requiredText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff9800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 4,
    textAlign: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#c5cae9",
    borderRadius: 20,
    backgroundColor: "#fafbff",
    overflow: "hidden",
  },
  uploadContent: {
    padding: 36,
    alignItems: "center",
  },
  uploadIconWrapper: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 6,
  },
  uploadSubtext: {
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  uploadActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  uploadActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },
  selectedFileContainer: {
    gap: 12,
  },
  selectedFileBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  fileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
    marginBottom: 8,
  },
  fileMetadata: {
    flexDirection: "row",
    gap: 16,
  },
  fileSizeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fileSize: {
    fontSize: 13,
    color: "#999",
  },
  fileStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fileStatusText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceFileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  replaceFileText: {
    fontSize: 15,
    color: "#1a237e",
    fontWeight: "600",
  },
  progressContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a237e",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a237e",
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: "#bdbdbd",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  securityFooter: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  securityIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    color: "#558b2f",
    lineHeight: 18,
  },
  futureDocsSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
  },
  futureDocsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 6,
  },
  futureDocsSubtitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
    lineHeight: 19,
  },
  futureDocsList: {
    gap: 12,
  },
  futureDocItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  futureDocText: {
    fontSize: 14,
    color: "#999",
  },
});

export default UploadDocumentsScreen;