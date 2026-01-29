import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Image,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import ModalDateTimePicker from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import ServicesSection101 from "./ServicesSection101";

const { width } = Dimensions.get("window");

const CompleteProfileScreen = ({ route, navigation }) => {
  const { email } = route.params;

  const [businessAddress, setBusinessAddress] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);
  const [operatingHours, setOperatingHours] = useState({});
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [town, setTown] = useState("");
  const [newService, setNewService] = useState({
    name: "",
    category: "",
    price: "",
    priceType: "",
    description: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [timePicker, setTimePicker] = useState({
    isVisible: false,
    day: "",
    field: "",
  });

  const namibianTowns = [
    "Arandis",
    "Aranos",
    "Aroab",
    "Aus",
    "Bethanie",
    "Buitepos",
    "Divundu",
    "Eenhana",
    "Gochas",
    "Gobabis",
    "Grootfontein",
    "Henties Bay",
    "Kalkrand",
    "Kamanjab",
    "Karasburg",
    "Karibib",
    "Katima Mulilo",
    "Keetmanshoop",
    "Khorixas",
    "Leonardville",
    "Lüderitz",
    "Mariental",
    "Maltahöhe",
    "Nkurenkuru",
    "Okatana",
    "Okahandja",
    "Okahao",
    "Okakarara",
    "Okalongo",
    "Okongo",
    "Omaruru",
    "Ongwediva",
    "Oniipa",
    "Opuwo",
    "Oranjemund",
    "Oshakati",
    "Oshikango",
    "Oshikuku",
    "Oshivelo",
    "Osona",
    "Otavi",
    "Otjinene",
    "Otjiwarongo",
    "Outapi",
    "Outjo",
    "Rehoboth",
    "Rundu",
    "Ruacana",
    "Swakopmund",
    "Tsumeb",
    "Usakos",
    "Walvis Bay",
    "Windhoek",
  ];

  const isFormValid = () => {
    return businessAddress && town && yearsOfExperience && services.length > 0;
  };

  const addService = (service) => {
    if (!service.category || !service.name || !service.price || !service.priceType) {
      Alert.alert("Error", "Please fill all fields to add a service.");
      return;
    }

    if (services.find((s) => s.name === service.name && s.category === service.category)) {
      Alert.alert("Error", "Service already added in this category.");
      return;
    }

    setServices([...services, service]);
    setNewService({ name: "", price: "", priceType: "" });
    setCategory("");
  };

  const updateOperatingHours = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
        isClosed: prev[day]?.isClosed || false,
      },
    }));
  };

  const handleTimePickerConfirm = (value) => {
    const { day, field } = timePicker;
    updateOperatingHours(
      day,
      field,
      value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    setTimePicker({ isVisible: false, day: "", field: "" });
  };

  const toggleDayClosed = (day) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isClosed: !prev[day]?.isClosed,
        start: null,
        end: null,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const profileData = new FormData();

    profileData.append("email", email);
    profileData.append("businessAddress", businessAddress);
    profileData.append("yearsOfExperience", yearsOfExperience);
    profileData.append("town", town);
    profileData.append("services", JSON.stringify(services));
    profileData.append("operatingHours", JSON.stringify(operatingHours));
    profileData.append("socialLinks", JSON.stringify(socialLinks));
    profileData.append("description", description);

    images.forEach((image, index) => {
      const uri = Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri;

      profileData.append("images", {
        uri: uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      });
    });

    try {
      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/complete-profile",
        profileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const customServices = services.filter((service) => service.isCustom);
      if (customServices.length > 0) {
        await Promise.all(
          customServices.map((service) =>
            axios.post("https://service-booking-backend-eb9i.onrender.com/api/auth/custom-service", {
              name: service.name,
              category: service.category,
              description: service.description,
            })
          )
        );
      }

      Toast.show({
        type: "success",
        text1: "Profile Completed",
        text2: "Your account has been successfully created!",
      });

      setTimeout(() => {
        navigation.navigate("UploadDocuments", { email, profileData: response.data.profile });
      }, 1000);
    } catch (error) {
      console.error("Error completing profile:", error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to complete profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (images.length >= 10) {
      Alert.alert("Limit Reached", "You can upload a maximum of 10 images.");
      return;
    }

    const remaining = 10 - images.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newOnes = result.assets.slice(0, remaining);
      setImages((prev) => [...prev, ...newOnes]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const wordCount = description.split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.iconInnerCircle}>
              <Icon name="business" size={48} color="#1a237e" />
            </View>
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Build your professional service provider profile
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Icon name="check" size={16} color="#fff" />
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressStepText}>2</Text>
            </View>
            <View style={[styles.progressLine, styles.progressLineInactive]} />
            <View style={styles.progressStep}>
              <Text style={[styles.progressStepText, styles.progressStepTextInactive]}>3</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>Profile Details</Text>
        </View>

        {/* Business Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="store" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Business Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Address *</Text>
            <View style={styles.inputContainer}>
              <Icon name="location-on" size={20} color="#1a237e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your business address"
                placeholderTextColor="#999"
                value={businessAddress}
                onChangeText={setBusinessAddress}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>Town/City *</Text>
  <View style={styles.pickerContainer}>
    <Icon name="location-city" size={20} color="#1a237e" style={styles.inputIcon} />
    <Picker
      selectedValue={town}
      onValueChange={setTown}
      style={styles.picker}
      itemStyle={styles.pickerItem}           // ← new: better item styling
      mode="dropdown"                         // ← ensures dropdown style on Android
    >
      <Picker.Item 
        label="Select Your Town/City" 
        value="" 
        color="#999"                          // gray placeholder text
      />
      {namibianTowns.map((townName, index) => (
        <Picker.Item 
          key={index} 
          label={townName} 
          value={townName} 
          color="#333"                        // darker text for list items
        />
      ))}
    </Picker>
  </View>
</View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Description</Text>
            <View style={styles.textAreaContainer}>
              <Icon name="description" size={20} color="#1a237e" style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Describe your business in 50 words or less"
                placeholderTextColor="#999"
                value={description}
                onChangeText={(text) => {
                  if (text.split(/\s+/).filter(Boolean).length <= 50) {
                    setDescription(text);
                  }
                }}
                multiline
                maxLength={300}
              />
            </View>
            <Text style={styles.charCount}>{wordCount}/50 words</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Years of Experience *</Text>
            <View style={styles.inputContainer}>
              <Icon name="work-history" size={20} color="#1a237e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor="#999"
                value={yearsOfExperience}
                onChangeText={setYearsOfExperience}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="design-services" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Services Offered *</Text>
          </View>
          <ServicesSection101 onServicesChange={setServices} />
        </View>

        {/* Operating Hours Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="schedule" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Operating Hours</Text>
          </View>

          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
            const isClosed = operatingHours[day]?.isClosed || false;

            return (
              <View key={day} style={styles.hoursCard}>
                <View style={styles.hoursHeader}>
                  <Text style={styles.dayText}>{day}</Text>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>{isClosed ? "Closed" : "Open"}</Text>
                    <Switch
                      value={!isClosed}
                      onValueChange={() => toggleDayClosed(day)}
                      trackColor={{ false: "#e0e0e0", true: "#1a237e" }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                {!isClosed && (
                  <View style={styles.timeSelectors}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setTimePicker({ isVisible: true, day, field: "start" })}
                    >
                      <Icon name="access-time" size={18} color="#1a237e" />
                      <Text style={styles.timeButtonText}>
                        {operatingHours[day]?.start || "Start Time"}
                      </Text>
                    </TouchableOpacity>

                    <Icon name="arrow-forward" size={20} color="#999" />

                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setTimePicker({ isVisible: true, day, field: "end" })}
                    >
                      <Icon name="access-time" size={18} color="#1a237e" />
                      <Text style={styles.timeButtonText}>
                        {operatingHours[day]?.end || "End Time"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <ModalDateTimePicker
            isVisible={timePicker.isVisible}
            mode="time"
            onConfirm={handleTimePickerConfirm}
            onCancel={() => setTimePicker({ isVisible: false, day: "", field: "" })}
          />
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="share" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Social Media Links</Text>
          </View>

          {[
            { platform: "Website", icon: "language", key: "website" },
            { platform: "Facebook", icon: "facebook", key: "facebook" },
            { platform: "Instagram", icon: "camera-alt", key: "instagram" },
            { platform: "LinkedIn", icon: "work", key: "linkedin" },
            { platform: "Twitter", icon: "alternate-email", key: "twitter" },
            { platform: "TikTok", icon: "music-note", key: "tiktok" },
          ].map(({ platform, icon, key }) => (
            <View key={key} style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Icon name={icon} size={20} color="#1a237e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={`Enter your ${platform} link`}
                  placeholderTextColor="#999"
                  value={socialLinks[key]}
                  onChangeText={(text) =>
                    setSocialLinks((prev) => ({ ...prev, [key]: text }))
                  }
                />
              </View>
            </View>
          ))}
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="photo-library" size={24} color="#1a237e" />
            <Text style={styles.sectionTitle}>Gallery Images</Text>
          </View>

          <View style={styles.imageCountBadge}>
            <Icon name="image" size={18} color="#1a237e" />
            <Text style={styles.imageCountText}>
              {images.length}/10 images uploaded
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.uploadButton,
              images.length >= 10 && styles.uploadButtonDisabled,
            ]}
            onPress={pickImage}
            disabled={images.length >= 10}
            activeOpacity={0.7}
          >
            <Icon
              name="add-photo-alternate"
              size={24}
              color={images.length >= 10 ? "#999" : "#fff"}
            />
            <Text style={[
              styles.uploadButtonText,
              images.length >= 10 && styles.uploadButtonTextDisabled,
            ]}>
              {images.length >= 10 ? "Maximum Reached" : "Add Images"}
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>Creating Profile...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="check-circle" size={22} color="#fff" />
              <Text style={styles.submitButtonText}>Complete Profile</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Icon name="verified-user" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your information is securely encrypted and protected
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
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
    paddingHorizontal: 30,
  },
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressStepActive: {
    backgroundColor: "#1a237e",
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  progressStepTextInactive: {
    color: "#999",
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: "#1a237e",
    marginHorizontal: 8,
  },
  progressLineInactive: {
    backgroundColor: "#e0e0e0",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
    letterSpacing: -0.3,
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
  pickerContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#e0e0e0",
  paddingLeft: 16,
  height: Platform.OS === "ios" ? 100 : 60,  // ← much taller on iOS (wheel needs space)
  overflow: "hidden",
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

picker: {
  flex: 1,
  height: Platform.OS === "ios" ? 180 : 60,   // ← matches container height
  width: "100%",
  color: "#333",
  fontSize: 16,
},

pickerItem: {
  fontSize: 16,                              // larger, clearer text in dropdown
  color: "#333",
  fontWeight: "500",
  backgroundColor: "#fff",   
  marginTop: -20,                // clean white background
},
  textAreaContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    minHeight: 120,
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
  textAreaIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 6,
  },
  hoursCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    marginBottom: 12,
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
  hoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  timeSelectors: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafbff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a237e",
  },
  imageCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
    gap: 8,
  },
  imageCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a237e",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadButtonDisabled: {
    backgroundColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  uploadButtonTextDisabled: {
    color: "#999",
  },
  imageGallery: {
    marginTop: 8,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1a237e",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f44336",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
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
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});

export default CompleteProfileScreen;