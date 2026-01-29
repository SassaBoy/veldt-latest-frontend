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
import { MaterialIcons } from "@expo/vector-icons";
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

      // Safety check: wait for userDetails to be loaded
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

      console.log("Uploading file:", {
        uri,
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
      console.log("Raw Response Text:", rawText);

      if (!response.ok) throw new Error(`Server Error: ${response.status} - ${rawText}`);

      const data = JSON.parse(rawText);
      console.log("Upload successful:", data);

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

      console.log("Image Picker Result:", result);
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadProfilePicture(result.assets[0].uri);
      } else {
        console.error("Image selection canceled or invalid result.");
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

      console.log("Camera Result:", result);
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadProfilePicture(result.assets[0].uri);
      } else {
        console.error("Photo capture canceled or invalid result.");
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
      <View style={styles.bottomSidebarOverlay}>
        <View style={styles.bottomSidebar}>
          <Text style={styles.bottomSidebarTitle}>Update Profile Picture</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setBottomSidebarVisible(false);
              pickImageFromGallery();
            }}
          >
            <MaterialIcons name="photo-library" size={28} color="#1a237e" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setBottomSidebarVisible(false);
              takePhoto();
            }}
          >
            <MaterialIcons name="camera-alt" size={28} color="#1a237e" />
            <Text style={styles.optionText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={() => setBottomSidebarVisible(false)}
          >
            <MaterialIcons name="close" size={28} color="#F44336" />
            <Text style={[styles.optionText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBasicInfo = () => {
    const basicFields = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        {basicFields.map(({ key, label }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {editing ? (
              <TextInput
                style={[styles.input, editableFields.errors?.[key] && styles.errorInput]}
                value={editableFields[key] || ""}
                onChangeText={(text) =>
                  setEditableFields((prev) => ({
                    ...prev,
                    [key]: text,
                    errors: { ...prev.errors, [key]: "" },
                  }))
                }
                keyboardType={key === "email" ? "email-address" : key === "phone" ? "phone-pad" : "default"}
              />
            ) : (
              <Text style={styles.fieldValue}>{editableFields[key] || 'Not provided'}</Text>
            )}
            {editableFields.errors?.[key] && (
              <Text style={styles.errorText}>{editableFields.errors[key]}</Text>
            )}
          </View>
        ))}
        {editing && (
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <MaterialIcons name="lock-outline" size={20} color="#1a237e" />
            <Text style={styles.passwordButtonText}>
              {showPasswordFields ? "Hide Password Fields" : "Change Password"}
            </Text>
          </TouchableOpacity>
        )}
        {editing && showPasswordFields && (
          <>
            <PasswordFields
              passwordFields={passwordFields}
              setPasswordFields={setPasswordFields}
              onValidationChange={() => {}}
            />
            {editableFields.errors?.oldPassword && (
              <Text style={styles.errorText}>{editableFields.errors.oldPassword}</Text>
            )}
            {editableFields.errors?.newPassword && (
              <Text style={styles.errorText}>{editableFields.errors.newPassword}</Text>
            )}
            {editableFields.errors?.confirmPassword && (
              <Text style={styles.errorText}>{editableFields.errors.confirmPassword}</Text>
            )}
          </>
        )}
      </View>
    );
  };

  const renderProviderInfo = () => {
    if (!userDetails?.completeProfile || userDetails.role !== 'Provider') return null;

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          {['businessAddress', 'town', 'yearsOfExperience'].map((key) => (
            <View key={key} style={styles.field}>
              <Text style={styles.fieldLabel}>
                {key === 'businessAddress' ? 'Business Address' : key === 'town' ? 'Town' : 'Years of Experience'}
              </Text>
              {editing ? (
                <TextInput
                  style={[styles.input, editableFields.errors?.[key] && styles.errorInput]}
                  value={editableFields[key]?.toString() || ""}
                  onChangeText={(text) =>
                    setEditableFields((prev) => ({
                      ...prev,
                      [key]: text,
                      errors: { ...prev.errors, [key]: '' },
                    }))
                  }
                />
              ) : (
                <Text style={styles.fieldValue}>{editableFields[key] || 'Not provided'}</Text>
              )}
              {editableFields.errors?.[key] && (
                <Text style={styles.errorText}>{editableFields.errors[key]}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>

          {editing && (
            <View style={styles.editingBanner}>
              <MaterialIcons name="info-outline" size={20} color="#FFC107" />
              <Text style={styles.editingText}>
                You can edit your services here. After making changes, tap the save icon on the top right to save.
              </Text>
            </View>
          )}

          {(!editableFields.services || editableFields.services.length === 0) ? (
            <Text style={styles.noServicesText}>
              No services listed. Add services to display them here.
            </Text>
          ) : (
            editableFields.services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                {editing && (
                  <TouchableOpacity 
                    style={styles.deleteServiceButton} 
                    onPress={() => confirmDeleteService(service.id || service._id, index)}
                  >
                    <MaterialIcons name="delete" size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDetail}>Category: {service.category}</Text>

                {editing ? (
                  <View style={styles.serviceEditRow}>
                    <TextInput
                      style={styles.priceInput}
                      value={service.price || ""}
                      keyboardType="numeric"
                      onChangeText={(text) => updateService(index, "price", text)}
                    />
                    <Picker
                      selectedValue={service.priceType || "hour"}
                      onValueChange={(value) => updateService(index, "priceType", value)}
                      style={styles.priceTypePicker}
                    >
                      <Picker.Item label="Per Hour" value="hour" />
                      <Picker.Item label="One-Time" value="once-off" />
                    </Picker>
                  </View>
                ) : (
                  <Text style={styles.servicePrice}>
                    N$ {service.price} ({service.priceType})
                  </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
            const hours = editableFields.operatingHours?.[day] || { isClosed: false, start: "", end: "" };

            return (
              <View key={day} style={styles.hourRow}>
                <Text style={styles.dayName}>{day}</Text>
                {editing ? (
                  <View style={styles.hoursInputContainer}>
                    <Switch
                      value={!hours.isClosed}
                      onValueChange={() => toggleDayClosed(day)}
                      trackColor={{ false: "#ccc", true: "#1a237e" }}
                      thumbColor={!hours.isClosed ? "#fff" : "#f4f3f4"}
                    />
                    {!hours.isClosed ? (
                      <>
                        <TouchableOpacity
                          style={styles.timeInput}
                          onPress={() => {
                            setActiveTimeField(`${day}.start`);
                            setShowTimePicker(true);
                          }}
                        >
                          <Text style={styles.timeText}>{hours.start || "Start"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeSeparator}>-</Text>
                        <TouchableOpacity
                          style={styles.timeInput}
                          onPress={() => {
                            setActiveTimeField(`${day}.end`);
                            setShowTimePicker(true);
                          }}
                        >
                          <Text style={styles.timeText}>{hours.end || "End"}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.closedText}>Closed</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.hours}>
                    {hours.isClosed
                      ? "Closed"
                      : hours.start && hours.end
                      ? `${hours.start} - ${hours.end}`
                      : "Not specified"}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Images</Text>
          <ImageGallery
            images={editableFields.images || []}
            editing={editing}
            onDeleteImage={deleteBusinessImage}
            onAddImage={pickNewBusinessImage}
          />
          {!editing && editableFields.images?.length === 0 && (
            <Text style={styles.noImagesText}>
              No images added yet. Tap the edit icon to add business images.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          {Object.entries(editableFields.socialLinks || {}).map(([platform, link]) => (
            <View key={platform} style={styles.socialLink}>
              <MaterialIcons name="link" size={24} color="#1a237e" />
              {editing ? (
                <TextInput
                  style={styles.socialLinkInput}
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
                />
              ) : (
                <Text style={styles.socialLinkText}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}: {link || 'Not provided'}
                </Text>
              )}
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      ) : !userDetails ? (
        <View style={styles.loadingContainer}>
          <Text>No user details found</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity onPress={() => setBottomSidebarVisible(true)}>
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
                  <MaterialIcons name="camera-alt" size={30} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.userName}>{userDetails.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userDetails.role}</Text>
              </View>

              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, userDetails?.completeProfile ? styles.completeBadge : styles.incompleteBadge]}>
                  <MaterialIcons 
                    name={userDetails?.completeProfile ? "verified" : "warning"} 
                    size={20} 
                    color={userDetails?.completeProfile ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={[styles.statusText, { color: userDetails?.completeProfile ? "#4CAF50" : "#FF9800" }]}>
                    {userDetails?.completeProfile ? "Profile Complete" : "Complete Your Profile"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>Account Details</Text>
              <TouchableOpacity
                style={[styles.editButton, editing && styles.saveButton]}
                onPress={() => editing ? saveChanges() : setEditing(true)}
              >
                <MaterialIcons name={editing ? "check" : "edit"} size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {renderBasicInfo()}
            {renderProviderInfo()}
          </View>
        </ScrollView>
      )}

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
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 60,
    paddingBottom: 80,
    alignItems: 'center',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -50,
    zIndex: 10,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#fff',
    backgroundColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#1a237e',
    padding: 14,
    borderRadius: 34,
    borderWidth: 5,
    borderColor: '#fff',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 32,
    marginTop: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  statusBadgeContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 32,
  },
  completeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
  },
  incompleteBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.25)',
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    marginTop: -40,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 60,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a237e',
  },
  editButton: {
    backgroundColor: '#1a237e',
    padding: 18,
    borderRadius: 20,
    elevation: 6,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  field: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValue: {
    fontSize: 18,
    color: '#212529',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
  },
  errorInput: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  passwordButtonText: {
    color: '#1a237e',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 14,
  },
  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#FFC107",
  },
  editingText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  noServicesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 17,
    fontStyle: "italic",
    paddingVertical: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    position: "relative",
  },
  deleteServiceButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#F44336",
    borderRadius: 28,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 8,
  },
  serviceDetail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  serviceEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    fontSize: 17,
  },
  priceTypePicker: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a237e',
    width: 110,
  },
  hours: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  closedText: {
    color: '#F44336',
    fontSize: 17,
    fontWeight: '600',
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#1a237e',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  timeText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  noImagesText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 17,
    fontStyle: 'italic',
    paddingVertical: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  socialLinkText: {
    fontSize: 17,
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  socialLinkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 18,
    marginLeft: 16,
    backgroundColor: "#f8f9fa",
    fontSize: 17,
  },
  bottomSidebarOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  bottomSidebar: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 48,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  bottomSidebarTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 28,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginLeft: 20,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#ffebee",
    marginTop: 12,
  },
  cancelText: {
    color: "#F44336",
    fontWeight: "600",
  },
});

export default UserAccount;