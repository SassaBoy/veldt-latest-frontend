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
const PRIMARY_COLOR = "#1a237e";

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
  const [loading, setLoading] = useState(false);

  const validNamibianPrefixes = useMemo(() => [
    "061", "062", "063", "064", "065", "066", "067", "060", "081", "083", "084", "085",
  ], []);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }, []);

  const validatePhone = useCallback((phone) => {
    if (phone.length < 10) return false;
    const prefix = phone.substring(0, 3);
    return validNamibianPrefixes.includes(prefix);
  }, [validNamibianPrefixes]);

  const handleFieldTouch = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required.";
    if (!email || !validateEmail(email)) newErrors.email = "Invalid email address.";
    if (!password || !validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters, contain an uppercase letter, and a number.";
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

  const isFormValid = useMemo(() => validateForm(), [validateForm]);

  const shouldShowError = (fieldName) => {
    return (touchedFields[fieldName] || hasSubmitted) && errors[fieldName];
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
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
            { text: "No", onPress: () => navigation.navigate("Home"), style: "cancel" },
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
    <SafeAreaView style={styles.container}>
      {/* Premium Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 48 }} /> {/* Spacer for centering */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Sign up as {role}</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>

            {/* Profile Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.9}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Icon name="camera-alt" size={40} color="#fff" />
                </View>
              )}
              <View style={styles.imageOverlay}>
                <Icon name="camera-alt" size={28} color="#fff" />
              </View>
              <Text style={styles.imageText}>
                {profileImage ? "Change Photo" : "Add Profile Photo"}
              </Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Icon name="person-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  onBlur={() => handleFieldTouch('name')}
                />
              </View>
              {shouldShowError('name') && <Text style={styles.errorText}>{errors.name}</Text>}

              <View style={styles.inputWrapper}>
                <Icon name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => handleFieldTouch('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {shouldShowError('email') && <Text style={styles.errorText}>{errors.email}</Text>}

              <View style={styles.inputWrapper}>
                <Icon name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => handleFieldTouch('password')}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? "visibility" : "visibility-off"} size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {shouldShowError('password') && <Text style={styles.errorText}>{errors.password}</Text>}

              <View style={styles.inputWrapper}>
                <Icon name="phone-android" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  onBlur={() => handleFieldTouch('phone')}
                  keyboardType="phone-pad"
                />
              </View>
              {shouldShowError('phone') && <Text style={styles.errorText}>{errors.phone}</Text>}

              {role === "Provider" && (
                <>
                  <View style={styles.inputWrapper}>
                    <Icon name="business" size={24} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Business Name"
                      placeholderTextColor="#999"
                      value={businessName}
                      onChangeText={setBusinessName}
                      onBlur={() => handleFieldTouch('businessName')}
                    />
                  </View>
                  {shouldShowError('businessName') && <Text style={styles.errorText}>{errors.businessName}</Text>}
                </>
              )}

              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.signupBtn, (!isFormValid || loading) && styles.signupBtnDisabled]}
                onPress={handleSignup}
                disabled={!isFormValid || loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.signupBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login", { role })}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginHighlight}>Login here</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 48, // Offset for back button
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 32,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#fff',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: '#fff',
  },
  imageText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginTop: 16,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 17,
    color: '#333',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  signupBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
    elevation: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  signupBtnDisabled: {
    backgroundColor: '#a0a8d6',
    elevation: 0,
    shadowOpacity: 0,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginHighlight: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
});

export default SignupScreen;