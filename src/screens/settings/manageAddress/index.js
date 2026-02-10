import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  BackHandler,
  TouchableWithoutFeedback
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';

import {
  getAddresses,
  addAddress,
  deleteAddress,
  setSelectedAddress,
  resetAddressState,
  setDefaultAddress,
} from "../../../redux/slices/addressSlice";

import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteConfirmation from "../../../otherComponent/deleteConfirmation";
import Header from "../../../components/header";
import { styles } from "./styles";
import appColors from "../../../theme/appColors";
import { LocationIcon } from "../../../assets/Icons/svg/locationIcon";
import { useAuth } from "../../../utils/context/authContext";
import { useToast } from "../../../utils/context/toastContext";
import { clearVendors } from "../../../redux/slices/nearByVendor";

export default function ManageAddress({ navigation, route }) {
  const dispatch = useDispatch();
  const { addresses, selectedAddress } = useSelector(
    (state) => state.address
  );
  const { userLocation, saveLocation } = useAuth();
  const { showToast } = useToast();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => sub.remove();
    }, [navigation])
  );


  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getAddresses());
    setRefreshing(false);
  };

  const {
    apiMessage,
    addressesError,
    addError,
    updateError,
    deleteError,
    setDefaultError,
  } = useSelector((state) => state.address);

  const [localSelectedAddress, setLocalSelectedAddress] = useState(
    route.params?.selectedAddressId || selectedAddress || null
  );

  const hasAddresses = addresses?.length > 0;

  console.log("hasAddresses", hasAddresses);

  console.log("addresses", addresses);

  const openAddressModal = (item) => {
    setSelectedAddressData(item);
    setAddressModalVisible(true);
  };

  const closeAddressModal = () => {
    setAddressModalVisible(false);
    setSelectedAddressData(null);
  };



  useEffect(() => {
    dispatch(getAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (!localSelectedAddress && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setLocalSelectedAddress(defaultAddr._id);
    }
  }, [addresses]);

  useEffect(() => {
    if (apiMessage) {
      showToast(apiMessage, "success");
      dispatch(resetAddressState());
    }
  }, [apiMessage]);

  useEffect(() => {
    const error =
      addressesError ||
      addError ||
      updateError ||
      deleteError ||
      setDefaultError;

    if (typeof error === 'string' && error.trim()) {
      showToast(error, "error");
      dispatch(resetAddressState());
    }
  }, [
    addressesError,
    addError,
    updateError,
    deleteError,
    setDefaultError,
  ]);


  const getCurrentLocation = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "We need your location to add address automatically",
        buttonPositive: "Allow",
        buttonNegative: "Cancel",
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      showToast("Please enable location permission", "error");
      return;
    }
    navigation.navigate("MapAddressScreen", {
      editingAddress: null,
      from: route.params?.from,
    });
  };


  const setAsDefault = async (id) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();

      const selectedObj = addresses.find(a => a._id === id);
      if (selectedObj) {
        dispatch(setSelectedAddress(selectedObj));
      }

      setLocalSelectedAddress(id);
    } catch (err) {
      showToast(err?.message || "Failed to set default", "error");
    }
  };


  const confirmDelete = (id) => {
    setAddressToDelete(id);
    setDeleteModalVisible(true);
  };


  const handleDelete = async () => {
    try {
      const deletedAddr = addresses.find(
        (a) => a._id === addressToDelete
      );

      await dispatch(deleteAddress(addressToDelete)).unwrap();

      if (deletedAddr?.isDefault) {
        const remaining = addresses.filter(
          (a) => a._id !== addressToDelete
        );

        if (remaining.length > 0) {
          await dispatch(setDefaultAddress(remaining[0]._id)).unwrap();
          dispatch(setSelectedAddress(remaining[0]));
          setLocalSelectedAddress(remaining[0]._id);
        }
      }
    } catch (err) {
      showToast(err?.message || "Delete failed", "error");
    } finally {
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    }
  };


  const applySelectedAddress = async () => {
  const selectedObj = addresses.find(a => a._id === localSelectedAddress);
  if (!selectedObj) return;

  dispatch(setSelectedAddress(selectedObj));

  const coords =
    selectedObj?.location?.coordinates?.coordinates;

  if (Array.isArray(coords) && coords.length === 2) {
    await saveLocation({
      coordinates: coords,
      city: selectedObj.city,
      state: selectedObj.state,
      pincode: selectedObj.pincode,
    });
  }

  navigation.goBack();
};



  const openMap = (item = null) => {
    navigation.navigate("MapAddressScreen", {
      editingAddress: item,
      from: route.params?.from, // 👈 VERY IMPORTANT
    });
  };

  const renderItem = ({ item }) => {
    const selected = localSelectedAddress === item._id;

    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.selectedCard]}
        onPress={() => setLocalSelectedAddress(item._id)}
        activeOpacity={0.9}
      >
        <View style={styles.row}>
          <View style={styles.radioOuter}>
            {selected && <View style={styles.radioInner} />}
          </View>

          <TouchableOpacity
            style={styles.addressDetails}
            activeOpacity={0.7}
            onPress={() => openAddressModal(item)}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.title}>{item.type}</Text>

              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
            </View>

            <Text
              style={styles.details}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.location?.fullAddress}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.iconBtn, { marginRight: 8 }]}
              onPress={() => confirmDelete(item._id)}
            >
              <Icon name="trash-outline" size={20} color="red" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openMap(item)}
            >
              <Icon name="create-outline" size={20} color="#1c1a1a" />
            </TouchableOpacity>
          </View>
        </View>

        {!item.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultBtn}
            onPress={() => setAsDefault(item._id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Address"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      {!hasAddresses && (
        <TouchableOpacity
          style={[styles.currentLocationBtn]}
          onPress={getCurrentLocation}
        // disabled={isLocating || !userLocation}
        >
          <Icon name="navigate" size={20} color={appColors.blue} />
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={addresses}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LocationIcon size={40} />
            <Text style={styles.emptyStateText}>No addresses saved</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addNewButton} onPress={() => openMap()}>
        <Icon name="add-circle-outline" size={20} color={appColors.darkBlue} />
        <Text style={styles.addNewButtonText}>Add New Address</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.applyBtn,
          !localSelectedAddress && { opacity: 0.5 }
        ]}
        disabled={!localSelectedAddress}
        onPress={applySelectedAddress}
      >
        <Text style={styles.applyBtnText}>Apply Selected Address</Text>
      </TouchableOpacity>

      <DeleteConfirmation visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} onConfirm={handleDelete} />
      <Modal
        visible={addressModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeAddressModal}
      >
        {/* 🔴 OUTER OVERLAY — tap here closes modal */}
        <TouchableWithoutFeedback onPress={closeAddressModal}>
          <View style={styles.modalOverlay}>

            {/* 🟢 INNER MODAL — prevent close on tap */}
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {selectedAddressData?.type} Address
                </Text>

                <Text style={styles.modalAddress}>
                  {selectedAddressData?.location?.fullAddress}
                </Text>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={closeAddressModal}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}
