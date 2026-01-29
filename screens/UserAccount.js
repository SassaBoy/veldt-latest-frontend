import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from '@react-native-community/datetimepicker';
import PasswordFields from './PasswordFields';
import ServicesSection101 from "./ServicesSection101";
import ImageGallery from "./ImageGallery";

const UserAccount = ({ route, navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bottomSidebarVisible, setBottomSidebarVisible] = useState(false);
  const [editableFields, setEditableFields] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [activeTimeField, setActiveTimeField] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deletedImages, setDeletedImages] = useState([]);

  const [availableServices] = useState([
    { name: 'Cleaning', category: 'Home' },
    { name: 'Plumbing', category: 'Home' },
    { name: 'Electrical', category: 'Home' },
  ]);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("Home");
      } else {
        fetchUserDetails();
      }
    };
  
    const unsubscribe = navigation.addListener("focus", checkAuthToken);
    return unsubscribe;
  }, [navigation]);
  
  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/get-user",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserDetails(data.user);

          const defaultFields = {
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            businessAddress: "",
            town: "",
            yearsOfExperience: "",
            services: [],
            operatingHours: {
              Monday: { start: null, end: null, isClosed: false },
              Tuesday: { start: null, end: null, isClosed: false },
              Wednesday: { start: null, end: null, isClosed: false },
              Thursday: { start: null, end: null, isClosed: false },
              Friday: { start: null, end: null, isClosed: false },
              Saturday: { start: null, end: null, isClosed: false },
              Sunday: { start: null, end: null, isClosed: false }
            },
            socialLinks: {
              facebook: "",
              twitter: "",
              instagram: "",
              linkedin: ""
            },
            images: [],
            errors: {}
          };

          if (data.user.completeProfile) {
            defaultFields.businessAddress = data.user.completeProfile.businessAddress || "";
            defaultFields.town = data.user.completeProfile.town || "";
            defaultFields.yearsOfExperience = data.user.completeProfile.yearsOfExperience || "";

            defaultFields.services = Array.isArray(data.user.completeProfile.services)
              ? data.user.completeProfile.services.map(s => ({
                  id: s._id || null,
                  name: s.name,
                  category: s.category,
                  price: s.price?.toString() || "0",
                  priceType: s.priceType?.toString() || "hour"
                }))
              : [];

            defaultFields.operatingHours = data.user.completeProfile.operatingHours || defaultFields.operatingHours;
            defaultFields.socialLinks = data.user.completeProfile.socialLinks || defaultFields.socialLinks;

            defaultFields.images = data.user.completeProfile.images?.map(img =>
              img.startsWith("http") ? img : `https://service-booking-backend-eb9i.onrender.com/${img.replace(/\\/g, "/")}`
            ) || [];
          }

          setEditableFields(defaultFields);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load profile data"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (uri) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");

      if (!userDetails || !userDetails.id) {
        throw new Error("User details not loaded yet. Please try again.");
      }

      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append("profileImage", {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: `profile_${Date.now()}.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      });

      const response = await fetch(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/update-profile-picture/${userDetails.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        }
      );

      const rawText = await response.text();

      if (!response.ok) throw new Error(`Server Error: ${response.status} - ${rawText}`);

      const data = JSON.parse(rawText);

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile picture has been updated.",
      });

      setUserDetails((prev) => ({
        ...prev,
        profileImage: data.profileImage,
      }));
    } catch (error) {
      console.error("Error uploading profile picture:", error.message || error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to upload profile picture.",
      });
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const confirmDeleteService = (serviceId, index) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to remove this service?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteService(serviceId, index), style: "destructive" },
      ]
    );
  };

  const deleteService = async (serviceId, index) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");
  
      setLoading(true);
  
      const response = await fetch(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/delete-service/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to delete service. Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        setEditableFields((prev) => ({
          ...prev,
          services: prev.services ? prev.services.filter((_, i) => i !== index) : [],
        }));
        
        Toast.show({
          type: "success",
          text1: "Service Deleted",
          text2: "The service has been successfully removed.",
        });
      } else {
        throw new Error(data.message || "Failed to delete service.");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete service.",
      });
    } finally {
      setLoading(false);
    }
  };

  const pickNewBusinessImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission needed",
          text2: "Please grant camera roll permissions to upload photos.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const localImageUri = result.assets[0].uri;

        setEditableFields((prev) => ({
          ...prev,
          images: [...(prev.images || []), localImageUri],
        }));

        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("Authentication token is missing.");

        const formData = new FormData();
        formData.append("image", {
          uri: Platform.OS === "android" ? localImageUri : localImageUri.replace("file://", ""),
          name: `business_${Date.now()}.jpg`,
          type: "image/jpeg",
        });

        const response = await fetch(
          "https://service-booking-backend-eb9i.onrender.com/api/auth/images/add",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        
        const data = await response.json();
        
        if (!data.imagePath || typeof data.imagePath !== "string") {
          throw new Error("Invalid imagePath received from server.");
        }
        
        setEditableFields((prev) => ({
          ...prev,
          images: prev.images.map((img) =>
            img === localImageUri
              ? `https://service-booking-backend-eb9i.onrender.com/${data.imagePath.replace(/\\/g, "/")}`
              : img
          ),
        }));

        Toast.show({
          type: "success",
          text1: "Image Uploaded",
          text2: "Business image added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to upload image.",
      });
    }
  };

  const deleteBusinessImage = (index) => {
    const imageToDelete = editableFields.images[index];
    
    setEditableFields(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setDeletedImages(prev => [...prev, imageToDelete]);
  };

  const handleTimePickerConfirm = (value) => {
    const [day, field] = activeTimeField.split(".");
    setEditableFields((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      },
    }));
    setShowTimePicker(false);
  };
  
  const toggleDayClosed = (day) => {
    setEditableFields(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          isClosed: !prev.operatingHours[day].isClosed
        }
      }
    }));
  };

  const updateService = (index, field, value) => {
    setEditableFields((prev) => {
      const updatedServices = [...prev.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return { ...prev, services: updatedServices };
    });
  };

  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing");

      let errors = {};

      if (!editableFields.name) errors.name = "Name cannot be empty.";
      if (!editableFields.email) {
        errors.email = "Email cannot be empty.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editableFields.email)) {
          errors.email = "Invalid email format.";
        }
      }
      if (!editableFields.phone) errors.phone = "Phone number cannot be empty.";

      if (showPasswordFields) {
        if (!passwordFields.oldPassword) {
          errors.oldPassword = "Current password is required.";
        }
        if (!passwordFields.newPassword) {
          errors.newPassword = "New password is required.";
        }
        if (!passwordFields.confirmPassword) {
          errors.confirmPassword = "Confirm password is required.";
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (passwordFields.newPassword && !passwordRegex.test(passwordFields.newPassword)) {
          errors.newPassword = "Password must be at least 8 characters, contain an uppercase letter, and a number.";
        }

        if (passwordFields.newPassword !== passwordFields.confirmPassword) {
          errors.confirmPassword = "New password and confirm password do not match.";
        }
      }

      if (Object.keys(errors).length > 0) {
        setEditableFields((prev) => ({ ...prev, errors }));
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please fix the errors highlighted.",
        });
        return;
      }

      if (showPasswordFields) {
        const verifyPasswordResponse = await fetch(
          "https://service-booking-backend-eb9i.onrender.com/api/auth/verify-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: editableFields.email,
              password: passwordFields.oldPassword,
            }),
          }
        );

        const verifyData = await verifyPasswordResponse.json();
        if (!verifyPasswordResponse.ok || !verifyData.success) {
          setEditableFields((prev) => ({
            ...prev,
            errors: { ...prev.errors, oldPassword: "Incorrect current password." },
          }));
          Toast.show({
            type: "error",
            text1: "Incorrect Password",
            text2: "The current password you entered is incorrect.",
          });
          return;
        }
      }

      const updateData = {
        name: editableFields.name,
        email: editableFields.email,
        phone: editableFields.phone,
        completeProfile: {
          businessAddress: editableFields.businessAddress || "",
          town: editableFields.town || "",
          yearsOfExperience: editableFields.yearsOfExperience || "",
          services: editableFields.services.map(service => ({
            name: service.name,
            category: service.category,
            price: parseFloat(service.price) || 0,
            priceType: service.priceType || "hour",
          })),
          operatingHours: editableFields.operatingHours || {},
          socialLinks: editableFields.socialLinks || {},
          images: editableFields.images.map(img =>
            img.replace(/^https?:\/\/[^/]+\//, "").replace(/\\/g, "/")
          ),
        },
      };

      if (showPasswordFields) {
        updateData.passwordChange = {
          oldPassword: passwordFields.oldPassword,
          newPassword: passwordFields.newPassword,
        };
      }

      const response = await fetch(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/update-user/${userDetails.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setPasswordFields({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordFields(false);
      setEditing(false);
      fetchUserDetails();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully.",
      });

    } catch (error) {
      console.error("Error saving changes:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save changes.",
      });
    }
  };

  const renderBottomSidebar = () => (
    <Modal
      visible={bottomSidebarVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setBottomSidebarVisible(false)}
    >
      <TouchableOpacity 
        style={styles.bottomSidebarOverlay}
        activeOpacity={1}
        onPress={() => setBottomSidebarVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.bottomSidebar}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sidebarHandle} />
          <Text style={styles.bottomSidebarTitle}>Update Profile Picture</Text>
          
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setBottomSidebarVisible(false);
              pickImageFromGallery();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrapper}>
              <Icon name="photo-library" size={24} color="#1a237e" />
            </View>
            <Text style={styles.optionText}>Choose from Gallery</Text>
            <Icon name="arrow-forward-ios" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setBottomSidebarVisible(false);
              takePhoto();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrapper}>
              <Icon name="camera-alt" size={24} color="#1a237e" />
            </View>
            <Text style={styles.optionText}>Take a Photo</Text>
            <Icon name="arrow-forward-ios" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setBottomSidebarVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const renderBasicInfo = () => {
    const basicFields = [
      { key: "name", label: "Full Name", icon: "person" },
      { key: "email", label: "Email Address", icon: "email" },
      { key: "phone", label: "Phone Number", icon: "phone" },
    ];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="info" size={20} color="#1a237e" />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>
        
        {basicFields.map(({ key, label, icon }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {editing ? (
              <View style={[styles.inputContainer, editableFields.errors?.[key] && styles.errorInputContainer]}>
                <View style={styles.inputIconWrapper}>
                  <Icon name={icon} size={20} color={editableFields.errors?.[key] ? "#d32f2f" : "#1a237e"} />
                </View>
                <TextInput
                  style={styles.input}
                  value={editableFields[key] || ""}
                  onChangeText={(text) =>
                    setEditableFields((prev) => ({
                      ...prev,
                      [key]: text,
                      errors: { ...prev.errors, [key]: "" },
                    }))
                  }
                  keyboardType={key === "email" ? "email-address" : key === "phone" ? "phone-pad" : "default"}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  placeholderTextColor="#999"
                />
              </View>
            ) : (
              <View style={styles.fieldValueContainer}>
                <View style={styles.fieldIconWrapper}>
                  <Icon name={icon} size={18} color="#1a237e" />
                </View>
                <Text style={styles.fieldValue}>{editableFields[key] || 'Not provided'}</Text>
              </View>
            )}
            {editableFields.errors?.[key] && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={14} color="#d32f2f" />
                <Text style={styles.errorText}>{editableFields.errors[key]}</Text>
              </View>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity
            style={styles.passwordToggleButton}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
            activeOpacity={0.7}
          >
            <View style={styles.passwordIconWrapper}>
              <Icon name={showPasswordFields ? "lock" : "lock-outline"} size={20} color="#1a237e" />
            </View>
            <Text style={styles.passwordToggleText}>
              {showPasswordFields ? "Hide Password Fields" : "Change Password"}
            </Text>
            <Icon name={showPasswordFields ? "expand-less" : "expand-more"} size={24} color="#1a237e" />
          </TouchableOpacity>
        )}

        {editing && showPasswordFields && (
          <View style={styles.passwordFieldsContainer}>
            <PasswordFields
              passwordFields={passwordFields}
              setPasswordFields={setPasswordFields}
              onValidationChange={() => {}}
            />
          </View>
        )}
      </View>
    );
  };

  const renderProviderInfo = () => {
    if (!userDetails?.completeProfile || userDetails.role !== 'Provider') return null;

    return (
      <>
        {/* Business Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business" size={20} color="#1a237e" />
            <Text style={styles.sectionTitle}>Business Information</Text>
          </View>
          
          {[
            { key: 'businessAddress', label: 'Business Address', icon: 'location-on' },
            { key: 'town', label: 'Town/City', icon: 'location-city' },
            { key: 'yearsOfExperience', label: 'Years of Experience', icon: 'work' },
          ].map(({ key, label, icon }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              {editing ? (
                <View style={[styles.inputContainer, editableFields.errors?.[key] && styles.errorInputContainer]}>
                  <View style={styles.inputIconWrapper}>
                    <Icon name={icon} size={20} color="#1a237e" />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={editableFields[key]?.toString() || ""}
                    onChangeText={(text) =>
                      setEditableFields((prev) => ({
                        ...prev,
                        [key]: text,
                        errors: { ...prev.errors, [key]: '' },
                      }))
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                    keyboardType={key === 'yearsOfExperience' ? 'numeric' : 'default'}
                  />
                </View>
              ) : (
                <View style={styles.fieldValueContainer}>
                  <View style={styles.fieldIconWrapper}>
                    <Icon name={icon} size={18} color="#1a237e" />
                  </View>
                  <Text style={styles.fieldValue}>{editableFields[key] || 'Not provided'}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="room-service" size={20} color="#1a237e" />
            <Text style={styles.sectionTitle}>Services Offered</Text>
          </View>

          {editing && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Icon name="info" size={18} color="#1976d2" />
              </View>
              <Text style={styles.infoText}>
                Edit your services here. Changes will be saved when you tap the save button.
              </Text>
            </View>
          )}

          {(!editableFields.services || editableFields.services.length === 0) ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name="room-service" size={48} color="#e0e0e0" />
              </View>
              <Text style={styles.emptyTitle}>No Services Added</Text>
              <Text style={styles.emptyText}>
                {editing ? "Add services below to get started" : "Enable editing to add services"}
              </Text>
            </View>
          ) : (
            editableFields.services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                {editing && (
                  <TouchableOpacity 
                    style={styles.deleteServiceButton} 
                    onPress={() => confirmDeleteService(service.id || service._id, index)}
                    activeOpacity={0.7}
                  >
                    <Icon name="delete" size={20} color="#fff" />
                  </TouchableOpacity>
                )}

                <View style={styles.serviceHeader}>
                  <View style={styles.serviceIconWrapper}>
                    <Icon name="room-service" size={24} color="#1a237e" />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCategory}>{service.category}</Text>
                  </View>
                </View>

                {editing ? (
                  <View style={styles.serviceEditContainer}>
                    <View style={styles.priceEditGroup}>
                      <Text style={styles.editLabel}>Price (N$)</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={service.price || ""}
                        keyboardType="numeric"
                        onChangeText={(text) => updateService(index, "price", text)}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.priceTypeGroup}>
                      <Text style={styles.editLabel}>Pricing Type</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={service.priceType || "hour"}
                          onValueChange={(value) => updateService(index, "priceType", value)}
                          style={styles.priceTypePicker}
                        >
                          <Picker.Item label="Per Hour" value="hour" />
                          <Picker.Item label="One-Time" value="once-off" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.servicePriceContainer}>
                    <Icon name="attach-money" size={16} color="#4CAF50" />
                    <Text style={styles.servicePrice}>
                      N$ {service.price} / {service.priceType === 'hour' ? 'hour' : 'one-time'}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}

          {editing && (
            <ServicesSection101
              services={editableFields.services || []}
              availableServices={availableServices}
              onServicesChange={(updatedServices) => {
                setEditableFields((prev) => ({
                  ...prev,
                  services: updatedServices,
                }));
              }}
            />
          )}
        </View>

        {/* Operating Hours Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="schedule" size={20} color="#1a237e" />
            <Text style={styles.sectionTitle}>Operating Hours</Text>
          </View>

          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
            const hours = editableFields.operatingHours?.[day] || { isClosed: false, start: "", end: "" };

            return (
              <View key={day} style={styles.hourRow}>
                <View style={styles.dayColumn}>
                  <Text style={styles.dayName}>{day.substring(0, 3)}</Text>
                  <Text style={styles.dayFull}>{day}</Text>
                </View>

                {editing ? (
                  <View style={styles.hoursEditContainer}>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>{!hours.isClosed ? 'Open' : 'Closed'}</Text>
                      <Switch
                        value={!hours.isClosed}
                        onValueChange={() => toggleDayClosed(day)}
                        trackColor={{ false: "#e0e0e0", true: "#c5cae9" }}
                        thumbColor={!hours.isClosed ? "#1a237e" : "#999"}
                      />
                    </View>
                    {!hours.isClosed && (
                      <View style={styles.timeInputsRow}>
                        <TouchableOpacity
                          style={styles.timeInputButton}
                          onPress={() => {
                            setActiveTimeField(`${day}.start`);
                            setShowTimePicker(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="access-time" size={16} color="#1a237e" />
                          <Text style={styles.timeButtonText}>{hours.start || "Start"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeSeparator}>—</Text>
                        <TouchableOpacity
                          style={styles.timeInputButton}
                          onPress={() => {
                            setActiveTimeField(`${day}.end`);
                            setShowTimePicker(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="access-time" size={16} color="#1a237e" />
                          <Text style={styles.timeButtonText}>{hours.end || "End"}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.hoursDisplayContainer}>
                    {hours.isClosed ? (
                      <View style={styles.closedBadge}>
                        <Icon name="block" size={14} color="#d32f2f" />
                        <Text style={styles.closedText}>Closed</Text>
                      </View>
                    ) : hours.start && hours.end ? (
                      <View style={styles.openBadge}>
                        <Icon name="access-time" size={14} color="#4CAF50" />
                        <Text style={styles.hours}>{`${hours.start} - ${hours.end}`}</Text>
                      </View>
                    ) : (
                      <Text style={styles.notSpecifiedText}>Not specified</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Business Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="photo-library" size={20} color="#1a237e" />
            <Text style={styles.sectionTitle}>Business Images</Text>
          </View>
          <ImageGallery
            images={editableFields.images || []}
            editing={editing}
            onDeleteImage={deleteBusinessImage}
            onAddImage={pickNewBusinessImage}
          />
          {!editing && editableFields.images?.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name="photo-library" size={48} color="#e0e0e0" />
              </View>
              <Text style={styles.emptyTitle}>No Images Added</Text>
              <Text style={styles.emptyText}>Enable editing to add business photos</Text>
            </View>
          )}
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="share" size={20} color="#1a237e" />
            <Text style={styles.sectionTitle}>Social Media Links</Text>
          </View>

          {Object.entries(editableFields.socialLinks || {}).map(([platform, link]) => {
            const platformIcons = {
              facebook: 'facebook',
              twitter: 'flutter-dash',
              instagram: 'photo-camera',
              linkedin: 'business'
            };

            return (
              <View key={platform} style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
                {editing ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconWrapper}>
                      <Icon name={platformIcons[platform] || 'link'} size={20} color="#1a237e" />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={link}
                      onChangeText={(text) =>
                        setEditableFields((prev) => ({
                          ...prev,
                          socialLinks: {
                            ...prev.socialLinks,
                            [platform]: text,
                          },
                        }))
                      }
                      placeholder={`Enter ${platform} URL`}
                      placeholderTextColor="#999"
                    />
                  </View>
                ) : (
                  <View style={styles.fieldValueContainer}>
                    <View style={styles.fieldIconWrapper}>
                      <Icon name={platformIcons[platform] || 'link'} size={18} color="#1a237e" />
                    </View>
                    <Text style={styles.fieldValue}>{link || 'Not provided'}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={64} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptyText}>Unable to load user details</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast />
      
      {/* Header with Back Button and Save */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Icon name="arrow-back" size={24} color="#1a237e" />
          </View>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>My Profile</Text>
        <TouchableOpacity
          style={[styles.editButtonTop, editing && styles.saveButtonTop]}
          onPress={() => editing ? saveChanges() : setEditing(true)}
          activeOpacity={0.7}
        >
          <Icon name={editing ? "check" : "edit"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            onPress={() => setBottomSidebarVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: userDetails?.profileImage && typeof userDetails.profileImage === "string"
                    ? `https://service-booking-backend-eb9i.onrender.com/${userDetails.profileImage.replace(/\\/g, "/")}`
                    : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
                }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              <View style={styles.cameraOverlay}>
                <Icon name="camera-alt" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userDetails.name}</Text>
          
          <View style={styles.roleBadge}>
            <Icon name="verified-user" size={14} color="#1a237e" />
            <Text style={styles.roleText}>{userDetails.role}</Text>
          </View>

          <View style={[
            styles.statusBadge,
            userDetails?.completeProfile ? styles.completeBadge : styles.incompleteBadge
          ]}>
            <Icon 
              name={userDetails?.completeProfile ? "check-circle" : "info"} 
              size={16} 
              color={userDetails?.completeProfile ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={[
              styles.statusText,
              { color: userDetails?.completeProfile ? "#4CAF50" : "#FF9800" }
            ]}>
              {userDetails?.completeProfile ? "Profile Complete" : "Complete Your Profile"}
            </Text>
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {renderBasicInfo()}
          {renderProviderInfo()}
        </View>
      </ScrollView>

      {renderBottomSidebar()}

      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={selectedTime}
          is24Hour={true}
          display="default"
          onChange={(event, date) => {
            if (date) {
              handleTimePickerConfirm(date);
              setSelectedTime(date);
            }
            setShowTimePicker(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {},
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  editButtonTop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1a237e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonTop: {
    backgroundColor: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f0f0f0',
    backgroundColor: '#e0e0e0',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a237e',
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  roleText: {
    color: '#1a237e',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  completeBadge: {
    backgroundColor: '#e8f5e9',
  },
  incompleteBadge: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    letterSpacing: -0.3,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
  },
  infoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 56,
  },
  errorInputContainer: {
    borderColor: '#d32f2f',
  },
  inputIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a237e',
    paddingVertical: 0,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  fieldIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: '#1a237e',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    flex: 1,
  },
  passwordToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  passwordIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passwordToggleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
  },
  passwordFieldsContainer: {
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteServiceButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
  },
  serviceEditContainer: {
    gap: 12,
  },
  priceEditGroup: {
    flex: 1,
  },
  priceTypeGroup: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  priceInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a237e',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceTypePicker: {
    height: 50,
  },
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayColumn: {
    width: 80,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 2,
  },
  dayFull: {
    fontSize: 12,
    color: '#999',
  },
  hoursEditContainer: {
    flex: 1,
    gap: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  hoursDisplayContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  hours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  closedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
  },
  notSpecifiedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  bottomSidebarOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSidebar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  sidebarHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  optionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
  cancelButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});

export default UserAccount;