import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import Header from "../../../components/header";
import { styles } from "./styles";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import appColors from "../../../theme/appColors";
import { getCustomerDetails, updateCustomerName, clearUpdateNameSuccess, updateCustomerNameLocally } from "../../../redux/slices/customerSlice";
import fonts from "../../../theme/appFonts";

const LoginSecurityScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    customerData,
    loading,
    updatingName,
    updateNameError,
    updateNameSuccess
  } = useSelector(state => state.customer);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [focusedField, setFocusedField] = useState(false);

  // Load customer details on component mount
  useEffect(() => {
    dispatch(getCustomerDetails());
  }, [dispatch]);

  // Initialize form data from customer data
  useEffect(() => {
    if (customerData) {
      setName(customerData?.name || "");
    }
  }, [customerData]);

  // Handle update success
  useEffect(() => {
    if (updateNameSuccess) {
      Alert.alert('Success', 'Name updated successfully!');
      setEditMode(false);
      dispatch(clearUpdateNameSuccess());
    }
  }, [updateNameSuccess, dispatch]);

  // Handle update errors
  useEffect(() => {
    if (updateNameError) {
      Alert.alert('Update Failed', updateNameError);
    }
  }, [updateNameError]);

  const validateName = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameUpdate = async () => {
    if (!validateName()) return;

    try {
      // Update locally first for immediate UI feedback
      dispatch(updateCustomerNameLocally(name.trim()));

      // Then make API call
      await dispatch(updateCustomerName(name.trim())).unwrap();
    } catch (error) {
      // Revert local changes if API call fails
      if (customerData?.name) {
        dispatch(updateCustomerNameLocally(customerData.name));
      }
      console.log('Name update error:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original name
    setName(customerData?.name || "");
    setEditMode(false);
    setNameError("");
  };

  const fields = [
    {
      label: "Name",
      key: "name",
      value: name,
      editable: true
    },
    // { 
    //   label: "Email", 
    //   key: "email", 
    //   value: customerData?.email || "N/A", 
    //   editable: false 
    // },
    {
      label: "Contact",
      key: "contactNo",
      value: customerData?.phone || "N/A",
      editable: false
    },
  ];

  if (loading && !customerData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={"Personal Information"} onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: 0 }]}>
      <View style={styles.container}>
        <Header title={"Personal Information"} onBackPress={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionCard}>
              {fields.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.fieldContainer,
                    { borderBottomWidth: editMode && item.editable ? 0 : 1 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{item.label}</Text>

                    {!item.editable ? (
                      <Text style={styles.fieldValue}>{item.value}</Text>
                    ) : editMode ? (
                      <>
                        <TextInput
                          style={[
                            styles.input,
                            focusedField && styles.inputFocused,
                            nameError && styles.inputError
                          ]}
                          onFocus={() => setFocusedField(true)}
                          onBlur={() => setFocusedField(false)}
                          onChangeText={(text) => {
                            setName(text);
                            if (nameError) setNameError("");
                          }}
                          value={name}
                          autoCapitalize="words"
                          underlineColorAndroid="transparent"
                          placeholder="Enter your name"
                          placeholderTextColor={"gray"}
                        />
                        {nameError && (
                          <Text style={styles.errorText}>{nameError}</Text>
                        )}
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.fieldValue,
                          !item.value && {
                            fontSize: 14,
                            color: 'gray',
                            fontFamily: fonts.InterRegular,
                          }
                        ]}
                      >
                        {item.value || "Enter your name"}
                      </Text>

                    )}
                  </View>

                  {item.editable && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        if (editMode) {
                          handleCancelEdit();
                        } else {
                          setEditMode(true);
                        }
                      }}
                    >
                      {editMode ? (
                        <Icon name="close-circle-outline" size={22} color="#FF3B30" />
                      ) : (
                        <Icon name="create-outline" size={22} color={appColors.blue} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {editMode && (
                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity
                    style={[styles.saveButton, updatingName && styles.saveButtonDisabled]}
                    onPress={handleNameUpdate}
                    disabled={updatingName}
                  >
                    {updatingName ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>

                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LoginSecurityScreen;