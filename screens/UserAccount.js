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

  const getUserId = (user) => user?._id || user?.id || null;

  const fetchUserDetails = async (useCacheFirst = false) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("Home");
        return;
      }

      if (useCacheFirst) {
        const cached = await AsyncStorage.getItem("userDetails");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (getUserId(parsed)) {
            setUserDetails(parsed);
          }
        }
      }

      const response = await fetch(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/user-details",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken");
        navigation.replace("Home");
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        const userId = getUserId(user);

        if (!userId) {
          Toast.show({ type: "error", text1: "Profile Error", text2: "User ID missing" });
          return;
        }

        const normalizedUser = { ...user, id: userId };
        setUserDetails(normalizedUser);
        await AsyncStorage.setItem("userDetails", JSON.stringify(normalizedUser));

        const defaultFields = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || user.completeProfile?.phone || "",
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
            Sunday: { start: null, end: null, isClosed: false },
          },
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
          },
          images: [],
          errors: {},
        };

        if (user.completeProfile) {
          const profile = user.completeProfile;
          defaultFields.businessAddress = profile.businessAddress || "";
          defaultFields.town = profile.town || "";
          defaultFields.yearsOfExperience = profile.yearsOfExperience || "";

          defaultFields.services = Array.isArray(profile.services)
            ? profile.services.map(s => ({
                id: s._id || s.id || null,
                name: s.name || "",
                category: s.category || "",
                price: s.price?.toString() || "0",
                priceType: s.priceType || "hour",
              }))
            : [];

          defaultFields.operatingHours = profile.operatingHours || defaultFields.operatingHours;
          defaultFields.socialLinks = profile.socialLinks || defaultFields.socialLinks;

          defaultFields.images = Array.isArray(profile.images)
            ? profile.images.map(img =>
                img.startsWith("http")
                  ? img
                  : `https://service-booking-backend-eb9i.onrender.com/${img.replace(/\\/g, "/")}`
              )
            : [];
        }

        setEditableFields(defaultFields);
      }
    } catch (error) {
      console.error("Fetch user details error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("Home");
      } else {
        await fetchUserDetails(true);
      }
    };

    const unsubscribe = navigation.addListener("focus", checkAuthAndLoad);
    checkAuthAndLoad();

    return unsubscribe;
  }, [navigation]);

  // ── Upload Profile Picture ─────────────────────────────────────────────
  const uploadProfilePicture = async (uri) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const userId = getUserId(userDetails);
      if (!userId) throw new Error("User ID missing");

      const formData = new FormData();
      formData.append("profileImage", {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const response = await fetch(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/update-profile-picture/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();

      setUserDetails(prev => ({ ...prev, profileImage: data.profileImage }));
      await AsyncStorage.setItem("userDetails", JSON.stringify({
        ...userDetails,
        profileImage: data.profileImage,
      }));

      Toast.show({ type: "success", text1: "Success", text2: "Profile picture updated" });
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to update picture" });
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: "error", text1: "Permission Denied", text2: "Allow gallery access" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: "error", text1: "Permission Denied", text2: "Allow camera access" });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const confirmDeleteService = (serviceId, index) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to remove this service?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteService(serviceId, index) },
      ]
    );
  };

  const deleteService = async (serviceId, index) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token");

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

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        setEditableFields(prev => ({
          ...prev,
          services: prev.services.filter((_, i) => i !== index),
        }));
        Toast.show({ type: "success", text1: "Deleted", text2: "Service removed" });
      } else {
        throw new Error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete service error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Could not delete service" });
    } finally {
      setLoading(false);
    }
  };

  const pickNewBusinessImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: "error", text1: "Permission Denied", text2: "Allow gallery access" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const localUri = result.assets[0].uri;

        setEditableFields(prev => ({
          ...prev,
          images: [...(prev.images || []), localUri],
        }));

        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const formData = new FormData();
        formData.append("image", {
          uri: Platform.OS === "android" ? localUri : localUri.replace("file://", ""),
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

        if (!data.success || !data.imagePath) {
          throw new Error(data.message || "Image upload failed");
        }

        setEditableFields(prev => ({
          ...prev,
          images: prev.images.map(img =>
            img === localUri
              ? `https://service-booking-backend-eb9i.onrender.com/${data.imagePath.replace(/\\/g, "/")}`
              : img
          ),
        }));

        Toast.show({ type: "success", text1: "Success", text2: "Image added" });
      }
    } catch (error) {
      console.error("Add image error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to add image" });
    }
  };

  const deleteBusinessImage = (index) => {
    const imageToDelete = editableFields.images[index];
    setEditableFields(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setDeletedImages(prev => [...prev, imageToDelete]);
  };

  const handleTimePickerConfirm = (value) => {
    if (!value) return;
    const [day, field] = activeTimeField.split(".");
    setEditableFields(prev => ({
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
          isClosed: !prev.operatingHours[day].isClosed,
        },
      },
    }));
  };

  const updateService = (index, field, value) => {
    setEditableFields(prev => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      let errors = {};

      if (!editableFields.name?.trim()) errors.name = "Name is required";
      if (!editableFields.email?.trim()) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editableFields.email))
        errors.email = "Invalid email";

      if (!editableFields.phone?.trim()) errors.phone = "Phone is required";

      if (showPasswordFields) {
        if (!passwordFields.oldPassword) errors.oldPassword = "Current password required";
        if (!passwordFields.newPassword) errors.newPassword = "New password required";
        if (!passwordFields.confirmPassword) errors.confirmPassword = "Confirm password required";

        if (passwordFields.newPassword && !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwordFields.newPassword))
          errors.newPassword = "Password must be 8+ chars with uppercase & number";

        if (passwordFields.newPassword !== passwordFields.confirmPassword)
          errors.confirmPassword = "Passwords do not match";
      }

      if (Object.keys(errors).length > 0) {
        setEditableFields(prev => ({ ...prev, errors }));
        Toast.show({ type: "error", text1: "Validation Error", text2: "Check the highlighted fields" });
        return;
      }

      if (showPasswordFields) {
        const verifyRes = await fetch(
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

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          setEditableFields(prev => ({
            ...prev,
            errors: { ...prev.errors, oldPassword: "Incorrect current password" },
          }));
          Toast.show({ type: "error", text1: "Incorrect Password", text2: "Current password is wrong" });
          return;
        }
      }

      const updateData = {
        name: editableFields.name.trim(),
        email: editableFields.email.trim(),
        phone: editableFields.phone.trim(),
        completeProfile: {
          businessAddress: editableFields.businessAddress?.trim() || "",
          town: editableFields.town?.trim() || "",
          yearsOfExperience: editableFields.yearsOfExperience || "",
          services: editableFields.services.map(s => ({
            name: s.name,
            category: s.category,
            price: parseFloat(s.price) || 0,
            priceType: s.priceType || "hour",
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
        throw new Error(data.message || "Update failed");
      }

      // Preserve critical fields (phone especially)
      const preservedFields = {
        ...editableFields,
        phone: editableFields.phone.trim(),
        errors: {},
      };

      setEditableFields(preservedFields);
      setUserDetails(prev => ({
        ...prev,
        name: editableFields.name.trim(),
        email: editableFields.email.trim(),
      }));

      setPasswordFields({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordFields(false);
      setEditing(false);

      // Clear deleted images after successful save
      setDeletedImages([]);

      // Refresh from server
      fetchUserDetails();

      Toast.show({ type: "success", text1: "Success", text2: "Profile updated" });
    } catch (error) {
      console.error("Save error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to save changes" });
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

          <TouchableOpacity style={styles.optionButton} onPress={pickImageFromGallery}>
            <Icon name="photo-library" size={24} color="#1a237e" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
            <Icon name="camera" size={24} color="#1a237e" />
            <Text style={styles.optionText}>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setBottomSidebarVisible(false)}
          >
            <Icon name="close" size={24} color="#d32f2f" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
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
              <View style={styles.inputContainer}>
                <Icon name={icon} size={20} color="#1a237e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={editableFields[key] || ""}
                  onChangeText={text =>
                    setEditableFields(prev => ({
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
                <Icon name={icon} size={18} color="#1a237e" style={styles.fieldIcon} />
                <Text style={styles.fieldValue}>{editableFields[key] || "Not provided"}</Text>
              </View>
            )}
            {editableFields.errors?.[key] && (
              <Text style={styles.errorText}>{editableFields.errors[key]}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <Icon name={showPasswordFields ? "lock-open" : "lock"} size={20} color="#1a237e" />
            <Text style={styles.passwordToggleText}>
              {showPasswordFields ? "Hide Password Change" : "Change Password"}
            </Text>
          </TouchableOpacity>
        )}

        {editing && showPasswordFields && (
          <View style={styles.passwordSection}>
            <PasswordFields
              passwordFields={passwordFields}
              setPasswordFields={setPasswordFields}
            />
          </View>
        )}
      </View>
    );
  };

  const renderProviderInfo = () => {
    const isProvider =
      userDetails?.role?.toLowerCase() === 'provider' ||
      userDetails?.role?.toLowerCase() === 'service provider' ||
      userDetails?.role?.toLowerCase().includes('provider') ||
      !!userDetails?.completeProfile;

    if (!isProvider) return null;

    return (
      <>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Business Information</Text>
          </View>

          {[
            { key: "businessAddress", label: "Business Address", icon: "location-on" },
            { key: "town", label: "Town / City", icon: "location-city" },
            { key: "yearsOfExperience", label: "Years of Experience", icon: "work" },
          ].map(({ key, label, icon }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              {editing ? (
                <View style={styles.inputContainer}>
                  <Icon name={icon} size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editableFields[key]?.toString() || ""}
                    onChangeText={text =>
                      setEditableFields(prev => ({
                        ...prev,
                        [key]: text,
                        errors: { ...prev.errors, [key]: "" },
                      }))
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                    keyboardType={key === "yearsOfExperience" ? "numeric" : "default"}
                  />
                </View>
              ) : (
                <View style={styles.fieldValueContainer}>
                  <Icon name={icon} size={20} color="#1a237e" style={styles.inputIcon} />
                  <Text style={styles.fieldValue}>{editableFields[key] || "Not provided"}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="room-service" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Services Offered</Text>
          </View>

          {editing && (
            <View style={styles.infoBanner}>
              <Icon name="info" size={18} color="#1976d2" />
              <Text style={styles.infoText}>
                Add, edit or remove your services. Save when finished.
              </Text>
            </View>
          )}

          {(!editableFields.services || editableFields.services.length === 0) ? (
            <View style={styles.emptyState}>
              <Icon name="room-service" size={48} color="#e0e0e0" />
              <Text style={styles.emptyTitle}>No Services Added</Text>
              <Text style={styles.emptyText}>
                {editing ? "Add services below" : "Tap Edit to add services"}
              </Text>
            </View>
          ) : (
            editableFields.services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                {editing && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteService(service.id || service._id, index)}
                  >
                    <Icon name="delete" size={20} color="#fff" />
                  </TouchableOpacity>
                )}

                <View style={styles.serviceHeader}>
                  <Icon name="room-service" size={24} color="#1a237e" style={styles.serviceIcon} />
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCategory}>{service.category}</Text>
                  </View>
                </View>

                {editing ? (
                  <View style={styles.serviceEdit}>
                    <TextInput
                      style={styles.priceInput}
                      value={service.price || ""}
                      keyboardType="numeric"
                      onChangeText={text => updateService(index, "price", text)}
                      placeholder="Price (N$)"
                    />
                    <Picker
                      selectedValue={service.priceType || "hour"}
                      onValueChange={value => updateService(index, "priceType", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Per Hour" value="hour" />
                      <Picker.Item label="One-Time" value="once-off" />
                    </Picker>
                  </View>
                ) : (
                  <View style={styles.priceTag}>
                    <Icon name="attach-money" size={16} color="#4CAF50" />
                    <Text style={styles.priceText}>
                      N$ {service.price} / {service.priceType === "hour" ? "hour" : "once-off"}
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
              onServicesChange={updated =>
                setEditableFields(prev => ({ ...prev, services: updated }))
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="schedule" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Operating Hours</Text>
          </View>

          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
            const hours = editableFields.operatingHours?.[day] || {
              isClosed: false,
              start: "",
              end: "",
            };

            return (
              <View key={day} style={styles.hourRow}>
                <Text style={styles.dayName}>{day}</Text>

                {editing ? (
                  <View style={styles.hoursEdit}>
                    <Switch
                      value={!hours.isClosed}
                      onValueChange={() => toggleDayClosed(day)}
                      trackColor={{ false: "#e0e0e0", true: "#c5cae9" }}
                      thumbColor={!hours.isClosed ? "#1a237e" : "#999"}
                    />
                    {!hours.isClosed && (
                      <View style={styles.timeRow}>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => {
                            setActiveTimeField(`${day}.start`);
                            setShowTimePicker(true);
                          }}
                        >
                          <Text style={styles.timeText}>{hours.start || "Start"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.separator}>–</Text>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => {
                            setActiveTimeField(`${day}.end`);
                            setShowTimePicker(true);
                          }}
                        >
                          <Text style={styles.timeText}>{hours.end || "End"}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.hoursDisplay}>
                    {hours.isClosed ? (
                      <Text style={styles.closedText}>Closed</Text>
                    ) : hours.start && hours.end ? (
                      <Text style={styles.hoursText}>
                        {hours.start} – {hours.end}
                      </Text>
                    ) : (
                      <Text style={styles.notSetText}>Not set</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="photo-library" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Business Images</Text>
          </View>

          <ImageGallery
            images={editableFields.images || []}
            editing={editing}
            onDeleteImage={deleteBusinessImage}
            onAddImage={pickNewBusinessImage}
          />

          {!editing && !editableFields.images?.length && (
            <View style={styles.emptyState}>
              <Icon name="photo-library" size={48} color="#e0e0e0" />
              <Text style={styles.emptyTitle}>No Images</Text>
              <Text style={styles.emptyText}>Tap Edit to add photos</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="share" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Social Media Links</Text>
          </View>

          {Object.entries(editableFields.socialLinks || {}).map(([platform, link]) => (
            <View key={platform} style={styles.field}>
              <Text style={styles.fieldLabel}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Text>
              {editing ? (
                <View style={styles.inputContainer}>
                  <Icon name="link" size={20} color="#1a237e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={link}
                    onChangeText={text =>
                      setEditableFields(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [platform]: text },
                      }))
                    }
                    placeholder={`https://${platform}.com/yourpage`}
                    placeholderTextColor="#999"
                  />
                </View>
              ) : (
                <View style={styles.fieldValueContainer}>
                  <Icon name="link" size={18} color="#1a237e" style={styles.fieldIcon} />
                  <Text style={styles.fieldValue}>{link || "Not connected"}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="error-outline" size={64} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>Profile Not Found</Text>
          <Text style={styles.emptyText}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1a237e" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={[styles.editBtn, editing && styles.saveBtn]}
          onPress={() => editing ? saveChanges() : setEditing(true)}
        >
          <Icon name={editing ? "check" : "edit"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setBottomSidebarVisible(true)}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    userDetails?.profileImage?.startsWith("http")
                      ? userDetails.profileImage
                      : userDetails?.profileImage
                      ? `https://service-booking-backend-eb9i.onrender.com/${userDetails.profileImage.replace(/\\/g, "/")}`
                      : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Icon name="camera-alt" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userDetails.name || "User"}</Text>

          <View style={styles.roleBadge}>
            <Icon name="verified-user" size={14} color="#1a237e" />
            <Text style={styles.roleText}>{userDetails.role || "User"}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              userDetails?.completeProfile ? styles.complete : styles.incomplete,
            ]}
          >
            <Icon
              name={userDetails?.completeProfile ? "check-circle" : "info"}
              size={16}
              color={userDetails?.completeProfile ? "#4CAF50" : "#FF9800"}
            />
            <Text
              style={[
                styles.statusText,
                { color: userDetails?.completeProfile ? "#4CAF50" : "#FF9800" },
              ]}
            >
              {userDetails?.completeProfile ? "Profile Complete" : "Complete Profile"}
            </Text>
          </View>
        </View>

        <View style={styles.mainContent}>
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
    backgroundColor: "#f8f9fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a237e",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#4CAF50",
  },
  scroll: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#f0f0f0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#1a237e",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,35,126,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 8,
  },
  complete: {
    backgroundColor: "#e8f5e9",
  },
  incomplete: {
    backgroundColor: "#fff3e0",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
    marginBottom: 8,
    letterSpacing: 0.2,
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
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  fieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 56,
  },
  fieldIcon: {
    marginRight: 12,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
  },
  passwordToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,35,126,0.05)",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  passwordToggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },
  passwordSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  serviceCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  deleteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ef4444",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  serviceIcon: {
    backgroundColor: "rgba(26,35,126,0.08)",
    padding: 10,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a237e",
  },
  serviceCategory: {
    fontSize: 14,
    color: "#6b7280",
  },
  serviceEdit: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 12,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    width: 100,
  },
  hoursEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  hoursDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  hoursText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  closedText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  notSetText: {
    fontSize: 15,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1a237e",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 90,
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
  },
  separator: {
    fontSize: 16,
    color: "#6b7280",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1d4ed8",
  },
  bottomSidebarOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSidebar: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSidebarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#fef2f2",
  },
  cancelText: {
    color: "#ef4444",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#1a237e",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default UserAccount;