import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const LoginScreen = ({ route, navigation }) => {
  const role = route?.params?.role || "User";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const redirectTo = route?.params?.redirectTo || "Home";
  const redirectParams = route?.params?.params || {};
  
  const handleLogin = async () => {
    setLoading(true);
    setError({});
  
    if (!email) {
      setError((prev) => ({ ...prev, email: "Email is required." }));
      setLoading(false);
      return;
    }
    if (!password) {
      setError((prev) => ({ ...prev, password: "Password is required." }));
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
  
      const { token, user } = response.data;
      setIsLoggedIn(true);
      setUserDetails(user);
      
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userId", user.id);
  
      Toast.show({
        type: "success",
        text1: "Login successful!",
        text2: `Welcome back, ${user.name || 'User'}!`,
      });

      setTimeout(() => {
        if (redirectTo && redirectTo !== "Home") {
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo, params: redirectParams }]
          });
        } else {
          navigation.navigate("Home", { refresh: Date.now() });
        }
      }, 1000);

    } catch (error) {
      console.debug("Login error (for debugging only):", error.response?.data?.message || error.message || error);

      let errorMessage = "Something went wrong. Please try again.";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else if (error.response.status === 404) {
          errorMessage = "Account not found. Please sign up first.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      if (errorMessage.toLowerCase().includes("email")) {
        setError((prev) => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes("password")) {
        setError((prev) => ({ ...prev, password: errorMessage }));
      } else {
        setError((prev) => ({ ...prev, general: errorMessage }));
      }

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: errorMessage,
      });
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
                  <Icon name="login" size={44} color="#1a237e" />
                </View>
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to your account
              </Text>
              
              {/* Role Badge */}
              <View style={styles.roleBadge}>
                <Icon name="account-circle" size={16} color="#1a237e" />
                <Text style={styles.roleText}>Logging in as {role}</Text>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "email" && styles.inputFocused,
                    error.email && styles.inputError,
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <Icon
                      name="email"
                      size={20}
                      color={focusedInput === "email" ? "#1a237e" : "#999"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError((prev) => ({ ...prev, email: "" }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                {error.email && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{error.email}</Text>
                  </View>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "password" && styles.inputFocused,
                    error.password && styles.inputError,
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <Icon
                      name="lock"
                      size={20}
                      color={focusedInput === "password" ? "#1a237e" : "#999"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError((prev) => ({ ...prev, password: "" }));
                    }}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={isPasswordVisible ? "visibility" : "visibility-off"}
                      size={20}
                      color={focusedInput === "password" ? "#1a237e" : "#999"}
                    />
                  </TouchableOpacity>
                </View>
                {error.password && (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={14} color="#d32f2f" />
                    <Text style={styles.errorText}>{error.password}</Text>
                  </View>
                )}
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("RequestPassword")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* General Error */}
              {error.general && (
                <View style={styles.generalErrorContainer}>
                  <Icon name="error-outline" size={18} color="#d32f2f" />
                  <Text style={styles.generalErrorText}>{error.general}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <Icon name="autorenew" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Logging in...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Login</Text>
                      <Icon name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Signup Link */}
              <TouchableOpacity
                style={styles.signupContainer}
                onPress={() => navigation.navigate("Signup", { role })}
                activeOpacity={0.7}
              >
                <Text style={styles.signupText}>
                  Don't have an account?{" "}
                  <Text style={styles.signupHighlight}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Footer */}
            <View style={styles.securityFooter}>
              <View style={styles.securityIconWrapper}>
                <Icon name="security" size={18} color="#2e7d32" />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Secure Login</Text>
                <Text style={styles.securityText}>
                  Your credentials are encrypted and protected
                </Text>
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
    marginBottom: 32,
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
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a237e",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputWrapper: {
    marginBottom: 20,
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
  eyeIcon: {
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#1a237e",
    fontSize: 14,
    fontWeight: "600",
  },
  generalErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 14,
    color: "#d32f2f",
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 24,
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
  loginButtonDisabled: {
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "600",
  },
  signupContainer: {
    alignItems: "center",
    padding: 16,
  },
  signupText: {
    fontSize: 15,
    color: "#666",
  },
  signupHighlight: {
    color: "#1a237e",
    fontWeight: "700",
  },
  securityFooter: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
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
});

export default LoginScreen;