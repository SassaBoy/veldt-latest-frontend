import React, { useState, useEffect, Fragment } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

const ServicesSection101 = ({ onServicesChange }) => {
  const [availableServices, setAvailableServices] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("predefined");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get("https://service-booking-backend-eb9i.onrender.com/api/auth/services"),
        axios.get("https://service-booking-backend-eb9i.onrender.com/api/auth/categories"),
      ]);

      if (servicesRes.data?.success) setAvailableServices(servicesRes.data.services);
      if (categoriesRes.data?.success) setAvailableCategories(categoriesRes.data.categories);
    } catch (error) {
      Alert.alert("Error", "Failed to load services/categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateService = (service) => {
    const errs = {};
    if (!service.name?.trim()) errs.name = "Required";
    if (!service.price?.trim()) errs.price = "Required";
    if (!service.priceType) errs.priceType = "Required";
    if (service.isCustom && !service.description?.trim()) errs.description = "Required";
    return errs;
  };

  const handleAddPredefinedService = (service) => {
    if (selectedServices.some((s) => s.name === service.name)) {
      Alert.alert("Already added", "This service is already in your list.");
      return;
    }
    const newService = { ...service, price: "", priceType: "", description: "" };
    const updated = [...selectedServices, newService];
    setSelectedServices(updated);
    onServicesChange([...updated, ...customServices]);
    setIsSaved(false);
  };

  const handleAddCustomService = (category) => {
    const newService = {
      category,
      name: "",
      price: "",
      priceType: "",
      description: "",
      isCustom: true,
    };
    const updated = [...customServices, newService];
    setCustomServices(updated);
    onServicesChange([...selectedServices, ...updated]);
    setIsSaved(false);
  };

  const handleUpdateService = (index, key, value, isCustom = false) => {
    const list = isCustom ? [...customServices] : [...selectedServices];
    list[index] = { ...list[index], [key]: value };

    if (isCustom) setCustomServices(list);
    else setSelectedServices(list);

    onServicesChange([...selectedServices, ...customServices]);

    const serviceErrors = validateService(list[index]);
    setErrors((prev) => ({
      ...prev,
      [`${isCustom ? "custom" : "predefined"}_${index}`]: Object.keys(serviceErrors).length ? serviceErrors : undefined,
    }));

    setIsSaved(false);
  };

  const handleRemoveService = (index, isCustom = false) => {
    if (isCustom) {
      const updated = customServices.filter((_, i) => i !== index);
      setCustomServices(updated);
      onServicesChange([...selectedServices, ...updated]);
    } else {
      const updated = selectedServices.filter((_, i) => i !== index);
      setSelectedServices(updated);
      onServicesChange([...updated, ...customServices]);
    }
    setIsSaved(false);
  };

  const handleSave = () => {
    const allServices = [...selectedServices, ...customServices];
    const newErrors = {};

    allServices.forEach((s, i) => {
      const errs = validateService(s);
      if (Object.keys(errs).length) {
        newErrors[`${s.isCustom ? "custom" : "predefined"}_${i}`] = errs;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("Incomplete", "Please fill in all required fields.");
      return;
    }

    if (allServices.length === 0) {
      Alert.alert("No services", "Add at least one service.");
      return;
    }

    setIsSaved(true);
    onServicesChange(allServices);
    Alert.alert("Saved", "Services updated successfully.");
  };

  const PriceTypeSelector = ({ value, onChange, error }) => {
    const options = [
      { label: "Per Hour", value: "hourly" },
      { label: "Per Job", value: "once-off" },
    ];

    return (
      <View>
        <Text style={styles.fieldLabel}>Pricing Type *</Text>
        <View style={[styles.priceTypeContainer, error && styles.priceTypeContainerError]}>
          {options.map((opt, index) => (
            <Fragment key={opt.value}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={[
                  styles.priceTypeButton,
                  value === opt.value && styles.priceTypeButtonActive,
                  index === 0 && styles.firstButton,
                  index === options.length - 1 && styles.lastButton,
                ]}
                onPress={() => onChange(opt.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.priceTypeButtonText,
                    value === opt.value && styles.priceTypeButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            </Fragment>
          ))}
        </View>
        {error && <Text style={styles.fieldError}>Please select pricing type</Text>}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.contentPadding}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="business-center" size={28} color="#1a237e" />
          <Text style={styles.headerTitle}>Services</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "predefined" && styles.tabActive]}
            onPress={() => setActiveTab("predefined")}
          >
            <Text style={[styles.tabText, activeTab === "predefined" && styles.tabTextActive]}>
              Predefined
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "custom" && styles.tabActive]}
            onPress={() => setActiveTab("custom")}
          >
            <Text style={[styles.tabText, activeTab === "custom" && styles.tabTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Predefined tab */}
        {activeTab === "predefined" && (
          <View style={styles.card}>
            <Text style={styles.sectionHelpText}>Choose from our list of common services</Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue=""
                onValueChange={(val) => {
                  if (!val) return;
                  const service = availableServices.find((s) => s.name === val);
                  if (service) handleAddPredefinedService(service);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select a service..." value="" color="#757575" />
                {availableServices.map((s) => (
                  <Picker.Item key={s.name} label={`${s.name} (${s.category})`} value={s.name} />
                ))}
              </Picker>
            </View>

            {selectedServices.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="playlist-add" size={48} color="#cfd8dc" />
                <Text style={styles.emptyText}>No services added yet</Text>
              </View>
            ) : (
              <>
                <Text style={styles.countText}>{selectedServices.length} added</Text>

                {selectedServices.map((service, idx) => (
                  <View key={idx} style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <View>
                        <Text style={styles.serviceTitle}>{service.name}</Text>
                        <Text style={styles.serviceMeta}>{service.category}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveService(idx)}>
                        <MaterialIcons name="close" size={24} color="#78909c" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                      <View style={styles.priceRow}>
                        <View style={styles.priceInputGroup}>
                          <Text style={styles.fieldLabel}>Price (N$) *</Text>
                          <TextInput
                            style={[styles.input, errors[`predefined_${idx}`]?.price && styles.inputError]}
                            placeholder="0.00"
                            value={service.price}
                            onChangeText={(v) => handleUpdateService(idx, "price", v)}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.priceTypeGroup}>
                          <PriceTypeSelector
                            value={service.priceType}
                            onChange={(v) => handleUpdateService(idx, "priceType", v)}
                            error={!!errors[`predefined_${idx}`]?.priceType}
                          />
                        </View>
                      </View>

                      {errors[`predefined_${idx}`] && (
                        <Text style={styles.formError}>
                          {Object.values(errors[`predefined_${idx}`])[0]}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Custom tab */}
        {activeTab === "custom" && (
          <View style={styles.card}>
            <Text style={styles.sectionHelpText}>Create your own service</Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue=""
                onValueChange={(val) => val && handleAddCustomService(val)}
                style={styles.picker}
              >
                <Picker.Item label="Choose category..." value="" color="#757575" />
                {availableCategories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            {customServices.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="add-circle-outline" size={48} color="#cfd8dc" />
                <Text style={styles.emptyText}>No custom services yet</Text>
              </View>
            ) : (
              <>
                <Text style={styles.countText}>{customServices.length} added</Text>

                {customServices.map((service, idx) => (
                  <View key={idx} style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{service.category}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveService(idx, true)}>
                        <MaterialIcons name="close" size={24} color="#78909c" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Service Name *</Text>
                        <TextInput
                          style={[styles.input, errors[`custom_${idx}`]?.name && styles.inputError]}
                          placeholder="e.g. Deep Cleaning – 3 Bedrooms"
                          value={service.name}
                          onChangeText={(v) => handleUpdateService(idx, "name", v, true)}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput
                          style={[
                            styles.input,
                            styles.textArea,
                            errors[`custom_${idx}`]?.description && styles.inputError,
                          ]}
                          placeholder="What does this service include?..."
                          value={service.description}
                          onChangeText={(v) => handleUpdateService(idx, "description", v, true)}
                          multiline
                          numberOfLines={4}
                        />
                      </View>

                      <View style={styles.priceRow}>
                        <View style={styles.priceInputGroup}>
                          <Text style={styles.fieldLabel}>Price (N$) *</Text>
                          <TextInput
                            style={[styles.input, errors[`custom_${idx}`]?.price && styles.inputError]}
                            placeholder="0.00"
                            value={service.price}
                            onChangeText={(v) => handleUpdateService(idx, "price", v, true)}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.priceTypeGroup}>
                          <PriceTypeSelector
                            value={service.priceType}
                            onChange={(v) => handleUpdateService(idx, "priceType", v, true)}
                            error={!!errors[`custom_${idx}`]?.priceType}
                          />
                        </View>
                      </View>

                      {errors[`custom_${idx}`] && (
                        <Text style={styles.formError}>
                          {Object.values(errors[`custom_${idx}`])[0]}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Save bar */}
        <View style={styles.saveContainer}>
          <Text style={styles.totalCount}>
            {selectedServices.length + customServices.length} service
            {(selectedServices.length + customServices.length) !== 1 ? "s" : ""}
          </Text>

          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnSaved]}
            onPress={handleSave}
            disabled={isSaved}
          >
            <MaterialIcons name={isSaved ? "check" : "save"} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{isSaved ? "Saved" : "Save Services"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  contentPadding: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#1a237e",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a237e",
    marginLeft: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: "#e8eaf6",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#607d8b",
  },
  tabTextActive: {
    color: "#1a237e",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionHelpText: {
    fontSize: 15,
    color: "#546e7a",
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 140 : 52,
    width: "100%",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#78909c",
    fontWeight: "500",
  },
  countText: {
    fontSize: 15,
    color: "#455a64",
    marginVertical: 16,
    fontWeight: "500",
  },
  serviceItem: {
    backgroundColor: "#fafcff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e3e8ef",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#263238",
  },
  serviceMeta: {
    fontSize: 13,
    color: "#78909c",
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  categoryTagText: {
    color: "#1565c0",
    fontSize: 13,
    fontWeight: "500",
  },
  formSection: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceTypeGroup: {
    flex: 1.15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#455a64",
    marginBottom: 8,
  },
  fieldError: {
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d7dd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  inputError: {
    borderColor: "#ef5350",
    backgroundColor: "#fff5f5",
  },
  priceTypeContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d0d7dd",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  priceTypeContainerError: {
    borderColor: "#ef5350",
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  firstButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  divider: {
    width: 1,
    backgroundColor: "#d0d7dd",
    alignSelf: "stretch",
  },
  priceTypeButtonActive: {
    backgroundColor: "#1a237e",
  },
  priceTypeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#546e7a",
  },
  priceTypeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  formError: {
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 8,
  },
  saveContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginTop: 16,
  },
  totalCount: {
    fontSize: 15,
    color: "#455a64",
    fontWeight: "500",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a237e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  saveBtnSaved: {
    backgroundColor: "#43a047",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default ServicesSection101;
