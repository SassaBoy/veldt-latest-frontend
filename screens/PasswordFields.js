import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const PasswordFields = ({
  passwordFields,
  setPasswordFields,
  onValidationChange,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [focusedField, setFocusedField] = React.useState(null);
  const [fieldErrors, setFieldErrors] = React.useState({});

  const togglePasswordVisibility = (field) => {
    setIsPasswordVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = () => {
    const errors = {};
    
    if (!passwordFields.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    
    if (!passwordFields.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordFields.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!passwordFields.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setFieldErrors(errors);
    onValidationChange(Object.keys(errors).length === 0);
    return errors;
  };

  React.useEffect(() => {
    validatePasswords();
  }, [passwordFields]);

  const getFieldConfig = (field) => {
    const configs = {
      oldPassword: {
        label: "Current Password",
        placeholder: "Enter your current password",
        icon: "lock",
      },
      newPassword: {
        label: "New Password",
        placeholder: "Enter your new password",
        icon: "lock-outline",
      },
      confirmPassword: {
        label: "Confirm New Password",
        placeholder: "Re-enter your new password",
        icon: "lock-open",
      },
    };
    return configs[field];
  };

  const renderPasswordField = (field) => {
    const config = getFieldConfig(field);
    const hasError = fieldErrors[field] || (field === "oldPassword" && passwordFields.error);
    const errorMessage = fieldErrors[field] || (field === "oldPassword" && passwordFields.error);

    return (
      <View key={field} style={styles.fieldWrapper}>
        <Text style={styles.label}>{config.label}</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === field && styles.inputFocused,
            hasError && styles.inputError,
          ]}
        >
          <View style={styles.inputIconWrapper}>
            <Icon
              name={config.icon}
              size={20}
              color={focusedField === field ? "#1a237e" : "#999"}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={config.placeholder}
            placeholderTextColor="#999"
            secureTextEntry={!isPasswordVisible[field]}
            value={passwordFields[field]}
            onChangeText={(text) => {
              setPasswordFields((prev) => ({
                ...prev,
                [field]: text,
                error: "", // Clear error on input change
              }));
              // Clear field-specific error
              setFieldErrors((prev) => ({
                ...prev,
                [field]: "",
              }));
            }}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => togglePasswordVisibility(field)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Icon
              name={isPasswordVisible[field] ? "visibility" : "visibility-off"}
              size={20}
              color={focusedField === field ? "#1a237e" : "#999"}
            />
          </TouchableOpacity>
        </View>
        {hasError && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={14} color="#d32f2f" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Password Requirements Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <Icon name="info" size={18} color="#1976d2" />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Password Requirements</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Icon
                name="check-circle"
                size={14}
                color={passwordFields.newPassword?.length >= 8 ? "#4caf50" : "#999"}
              />
              <Text
                style={[
                  styles.requirementText,
                  passwordFields.newPassword?.length >= 8 && styles.requirementMet,
                ]}
              >
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name="check-circle"
                size={14}
                color={
                  passwordFields.newPassword === passwordFields.confirmPassword &&
                  passwordFields.newPassword?.length > 0
                    ? "#4caf50"
                    : "#999"
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  passwordFields.newPassword === passwordFields.confirmPassword &&
                    passwordFields.newPassword?.length > 0 &&
                    styles.requirementMet,
                ]}
              >
                Passwords match
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Password Fields */}
      <View style={styles.fieldsContainer}>
        {renderPasswordField("oldPassword")}
        {renderPasswordField("newPassword")}
        {renderPasswordField("confirmPassword")}
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <View style={styles.securityIconWrapper}>
          <Icon name="security" size={16} color="#2e7d32" />
        </View>
        <Text style={styles.securityText}>
          For security, you'll be logged out after changing your password
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#1976d2",
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
  },
  requirementMet: {
    color: "#2e7d32",
    fontWeight: "600",
  },
  fieldsContainer: {
    gap: 4,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
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
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#ff9800",
  },
  securityIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: "#e65100",
    lineHeight: 17,
  },
});

export default PasswordFields;