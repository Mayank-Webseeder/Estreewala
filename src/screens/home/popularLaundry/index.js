import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  AppState,
} from "react-native";
import { washingWash, ironinWash } from "../../../utils/images/images";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "./styles";
import React, { useEffect, useCallback, useState } from "react";
import { clearVendors, getNearbyVendors } from "../../../redux/slices/nearByVendor";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../utils/context/authContext";
import Geolocation from "react-native-geolocation-service";
import { PermissionsAndroid } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import appColors from "../../../theme/appColors";
import { useFocusEffect } from "@react-navigation/native";

const randomImages = [washingWash, ironinWash];

const PopularLaundry = (props) => {
  const dispatch = useDispatch();
  const { selectedAddress, addresses } = useSelector(
    state => state.address
  );
  const { userLocation, saveLocation } = useAuth();
  const { vendors, vendorsError } = useSelector(
    (state) => state.nearByVendor
  );

  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

  const effectiveLocation =
    selectedAddress ||
    (hasAddresses && addresses.find(a => a.isDefault)) ||
    (hasAddresses && addresses[0]) ||
    (!hasAddresses ? userLocation : null);

  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  const getCoordinates = () => {
    // Saved address case
    if (effectiveLocation?.location?.coordinates?.coordinates) {
      return effectiveLocation.location.coordinates.coordinates; // [lng, lat]
    }

    // Current location case
    if (effectiveLocation?.coordinates?.length === 2) {
      return effectiveLocation.coordinates; // [lng, lat]
    }

    return null;
  };

  const coords = getCoordinates();

  const hasValidLocation =
    coords?.length === 2 && !locationPermissionDenied;


  // 🔁 App foreground → permission recheck
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active" && Platform.OS === "android") {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted) {
          setLocationPermissionDenied(false);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (hasValidLocation) {
        dispatch(getNearbyVendors({ lng: coords[0], lat: coords[1] }));
      }
    }, [hasValidLocation, coords])
  );

  // 📡 Fetch vendors when location available
  useEffect(() => {
    if (!hasValidLocation) return;

    dispatch(clearVendors());

    dispatch(
      getNearbyVendors({
        lng: coords[0],
        lat: coords[1],
      })
    );
  }, [hasValidLocation, effectiveLocation, dispatch]);


  // 🔐 Permission request
  const requestLocationPermission = async () => {
    if (Platform.OS !== "android") return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      setLocationPermissionDenied(false);
      return true;
    }

    setLocationPermissionDenied(true);

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        "Location Required",
        "Please enable location from settings to see nearby laundries",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }

    return false;
  };

  // 🌍 Reverse geocode
  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "LaundryApp/1.0",
          Accept: "application/json",
        },
      }
    );
    return res.json();
  };

  const parseAddress = (data) => {
    const addr = data?.address || {};

    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        "",

      state: addr.state || addr.region || "",

      pincode: addr.postcode || "",
    };
  };
  // 📍 Auto detect location
  const handleAutoLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        await saveLocation(null);
        return;
      }

      Geolocation.getCurrentPosition(
        async ({ coords }) => {
          const geoData = await reverseGeocode(
            coords.latitude,
            coords.longitude
          );

          const parsed = parseAddress(geoData);

          const locationData = {
            coordinates: [coords.longitude, coords.latitude],
            city: parsed.city || "Current Location",
            state: parsed.state || "",
            pincode: parsed.pincode || "",
          };

          await saveLocation(locationData);
        },
        (error) => {
          console.log("📍 Location error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (e) {
      console.log("❌ Auto location failed:", e);
    }
  };


  const popularVendors = [...vendors]
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    .slice(0, 3)
    .map((vendor, index) => ({
      id: vendor.id,
      name: vendor.businessName,
      location: vendor.address,
      image: randomImages[index % randomImages.length],
      distanceKm: vendor.distanceKm,
    }));

  return (
    <View style={styles.container}>
      {!hasValidLocation ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 15,
          }}
        >
          <TouchableOpacity
            onPress={handleAutoLocation}
            activeOpacity={0.7}
            style={{ alignItems: "center" }}
          >
            <Ionicons name="location-outline" size={50} color="#07172cff" />
            <Text style={[styles.emptyText, { marginTop: 10, textAlign: "center" }]}>
              Please enable location to see nearby laundries
            </Text>
          </TouchableOpacity>
        </View>

      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Popular Laundry</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                props.navigation.navigate("Tabs", {
                  screen: "Laundry",
                  params: { serviceName: "Popular Laundry" },
                })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularVendors}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() =>
                  props.navigation.navigate("LaundryService", {
                    title: item.name,
                    vendorId: item.id,
                    address: item.location,
                  })
                }
              >
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.image} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.name}</Text>

                  <View style={styles.locationContainer}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#07172cff"
                    />
                    <Text
                      style={styles.location}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.location}
                    </Text>
                  </View>

                  <View style={styles.locationContainer}>
                    <Icon name="location-on" size={12} color={appColors.darkBlue} />
                    <Text style={styles.location}>
                      {item.distanceKm.toFixed(1)} km away
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No laundries available at this location
              </Text>
            }
          />
        </>
      )}

      {vendorsError && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{vendorsError}</Text>
        </View>
      )}
    </View>
  );
};

export default PopularLaundry;
