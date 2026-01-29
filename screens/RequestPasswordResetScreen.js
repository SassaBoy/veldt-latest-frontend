import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import axios from "axios";

const RequestPasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

  const handleRequestReset = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/forgot-password",
        { email }
      );

      Toast.show({
        type: "success",
        text1: "OTP Sent Successfully",
        text2: response.data.message || "Please check your email",
      });

      setTimeout(() => {
        navigation.navigate("ResetPassword", {
          email,
          role: response.data.role,
        });
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP. Please try again.";

      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: errorMessage,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <View style={styles.iconInnerCircle}>
                  <Icon name="lock-reset" size={44} color="#1a237e" />
                </View>
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a verification code
              </Text>
            </View>

            {/* Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Icon name="info" size={20} color="#1976d2" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>
                  We'll send a one-time password (OTP) to your email. Use this code
                  to verify your identity and create a new password.
                </Text>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput && styles.inputFocused,
                    error && styles.inputError,
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <Icon
                      name="email"
                      size={20}
                      color={focusedInput ? "#1a237e" : "#999"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput(true)}
                    onBlur={() => setFocusedInput(false)}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setEmail("")}
                      style={styles.clearButton}
                      activeOpacity={0.7}
                    >
                      <Icon name="cancel" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {error && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                onPress={handleRequestReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <Icon name="autorenew" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Sending OTP...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Send OTP</Text>
                      <Icon name="send" size={20} color="#fff" />
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.backToLoginContainer}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Icon name="arrow-back" size={18} color="#1a237e" />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>

            {/* Security Footer */}
            <View style={styles.securityFooter}>
              <View style={styles.securityIconWrapper}>
                <Icon name="security" size={18} color="#2e7d32" />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Secure Process</Text>
                <Text style={styles.securityText}>
                  Your password reset request is encrypted and secure. The OTP will
                  expire in 10 minutes.
                </Text>
              </View>
            </View>

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <View style={styles.helpItems}>
                <View style={styles.helpItem}>
                  <Icon name="check-circle" size={16} color="#1a237e" />
                  <Text style={styles.helpItemText}>
                    Make sure you enter the email used during signup
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Icon name="check-circle" size={16} color="#1a237e" />
                  <Text style={styles.helpItemText}>
                    Check your spam folder if you don't see the email
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Icon name="check-circle" size={16} color="#1a237e" />
                  <Text style={styles.helpItemText}>
                    Contact support if you continue to have issues
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  keyboardView: {
    flex: 1,
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
    marginTop: 20,
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
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 14,
    marginBottom: 28,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#1976d2",
    lineHeight: 19,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputFocused: {
    borderColor: "#1a237e",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputError: {
    borderColor: "#d32f2f",
    borderWidth: 1.5,
  },
  inputIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(26, 35, 126, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#d32f2f",
    flex: 1,
  },
  sendButton: {
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
  sendButtonDisabled: {
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  backToLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  backToLoginText: {
    fontSize: 15,
    color: "#1a237e",
    fontWeight: "600",
  },
  securityFooter: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
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
  helpSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 14,
  },
  helpItems: {
    gap: 12,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  helpItemText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
  },
});

export default RequestPasswordResetScreen;