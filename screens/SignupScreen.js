import React, { useState, useCallback, useMemo } from "react";
import { Alert, ActivityIndicator } from "react-native";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import axios from "axios";

const { width } = Dimensions.get("window");

const SignupScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validNamibianPrefixes = useMemo(
    () => ["061", "062", "063", "064", "065", "066", "067", "060", "081", "083", "084", "085"],
    []
  );

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }, []);

  const validatePhone = useCallback(
    (phone) => {
      if (phone.length < 10) return false;
      const prefix = phone.substring(0, 3);
      return validNamibianPrefixes.includes(prefix);
    },
    [validNamibianPrefixes]
  );

  const handleFieldTouch = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required.";
    if (!email || !validateEmail(email)) newErrors.email = "Invalid email address.";
    if (!password || !validatePassword(password)) {
      newErrors.password =
        "Password must be at least 8 characters, contain an uppercase letter, and a number.";
    }
    if (!phone || !validatePhone(phone)) {
      newErrors.phone = "Invalid phone number for Namibia.";
    }
    if (role === "Provider" && !businessName) {
      newErrors.businessName = "Business name is required for providers.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, phone, businessName, role, validateEmail, validatePassword, validatePhone]);

  const isFormValid = useMemo(() => {
    return validateForm();
  }, [validateForm]);

  const shouldShowError = (fieldName) => {
    return (touchedFields[fieldName] || hasSubmitted) && errors[fieldName];
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    setHasSubmitted(true);
    setErrors({});
    setLoading(true);

    if (!isFormValid) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("role", role);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone", phone);
    if (role === "Provider" && businessName) {
      formData.append("businessName", businessName);
    }

    if (profileImage) {
      const imageUri = profileImage;
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image";

      formData.append("profileImage", {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    try {
      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/register/" + role,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.redirect) {
        Alert.alert(
          "Incomplete Application",
          "You already started the application. Would you like to continue?",
          [
            {
              text: "No",
              onPress: () => navigation.navigate("Home"),
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                navigation.navigate(response.data.redirect, {
                  email,
                  userData: response.data.user,
                });
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Signed up successfully as ${role}!`,
      });

      setTimeout(() => {
        if (role === "Provider") {
          navigation.navigate("CompleteProfile", {
            email,
            userData: response.data,
          });
        } else {
          navigation.navigate("Login", { role });
        }
      }, 1000);
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        const newErrors = {};
        if (errorMessage.toLowerCase().includes("email")) newErrors.email = errorMessage;
        if (errorMessage.toLowerCase().includes("password")) newErrors.password = errorMessage;
        if (errorMessage.toLowerCase().includes("phone")) newErrors.phone = errorMessage;
        if (Object.keys(newErrors).length === 0) newErrors.general = errorMessage;
        setErrors(newErrors);
      }

      Toast.show({
        type: "error",
        text1: "Registration Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={styles.iconInnerCircle}>
                <Icon name="person-add" size={48} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join as a {role}</Text>
          </View>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <Icon
              name={role === "Provider" ? "business-center" : "person"}
              size={18}
              color="#1a237e"
            />
            <Text style={styles.roleBadgeText}>{role} Registration</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Profile Image Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Profile Photo</Text>
              <TouchableOpacity
                style={styles.imagePickerCard}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    <View style={styles.imageOverlay}>
                      <Icon name="camera-alt" size={28} color="#fff" />
                      <Text style={styles.changeImageText}>Change Photo</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.placeholderIconCircle}>
                      <Icon name="add-a-photo" size={36} color="#1a237e" />
                    </View>
                    <Text style={styles.imageText}>Upload Profile Photo</Text>
                    <Text style={styles.imageSubtext}>JPG, PNG • Max 5MB</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errors.general && (
              <View style={styles.errorBanner}>
                <Icon name="error-outline" size={20} color="#d32f2f" />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    onBlur={() => handleFieldTouch("name")}
                  />
                </View>
                {shouldShowError("name") && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{errors.name}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => handleFieldTouch("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {shouldShowError("email") && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    onBlur={() => handleFieldTouch("phone")}
                    keyboardType="phone-pad"
                  />
                </View>
                {shouldShowError("phone") && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Security */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Security</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Icon name="lock-outline" size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => handleFieldTouch("password")}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={isPasswordVisible ? "visibility" : "visibility-off"}
                      size={22}
                      color="#1a237e"
                    />
                  </TouchableOpacity>
                </View>
                {shouldShowError("password") && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{errors.password}</Text>
                  </View>
                )}
              </View>

              <View style={styles.passwordHints}>
                <View style={styles.hintRow}>
                  <Icon
                    name={password.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                    size={16}
                    color={password.length >= 8 ? "#4CAF50" : "#ccc"}
                  />
                  <Text style={[styles.hintText, password.length >= 8 && styles.hintTextValid]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Icon
                    name={/[A-Z]/.test(password) ? "check-circle" : "radio-button-unchecked"}
                    size={16}
                    color={/[A-Z]/.test(password) ? "#4CAF50" : "#ccc"}
                  />
                  <Text style={[styles.hintText, /[A-Z]/.test(password) && styles.hintTextValid]}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Icon
                    name={/[0-9]/.test(password) ? "check-circle" : "radio-button-unchecked"}
                    size={16}
                    color={/[0-9]/.test(password) ? "#4CAF50" : "#ccc"}
                  />
                  <Text style={[styles.hintText, /[0-9]/.test(password) && styles.hintTextValid]}>
                    One number
                  </Text>
                </View>
              </View>
            </View>

            {/* Business Information (Provider Only) */}
            {role === "Provider" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Business Information</Text>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Icon name="business" size={20} color="#1a237e" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Business Name"
                      placeholderTextColor="#999"
                      value={businessName}
                      onChangeText={setBusinessName}
                      onBlur={() => handleFieldTouch("businessName")}
                    />
                  </View>
                  {shouldShowError("businessName") && (
                    <View style={styles.errorContainer}>
                      <Icon name="error" size={14} color="#d32f2f" />
                      <Text style={styles.errorText}>{errors.businessName}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="check-circle" size={22} color="#fff" />
                  <Text style={styles.submitButtonText}>Create Account</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login", { role })}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Icon name="lock" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>
                Your data is encrypted and stored securely
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
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
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 24,
    gap: 8,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  form: {
    width: "100%",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  imagePickerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
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
  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#1a237e",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(26, 35, 126, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  imagePlaceholder: {
    alignItems: "center",
    padding: 32,
  },
  placeholderIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  imageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
    marginBottom: 6,
  },
  imageSubtext: {
    fontSize: 13,
    color: "#999",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ef5350",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#d32f2f",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 16,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    flex: 1,
  },
  passwordHints: {
    backgroundColor: "#f5f7fa",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hintText: {
    fontSize: 13,
    color: "#999",
  },
  hintTextValid: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});

export default SignupScreen;