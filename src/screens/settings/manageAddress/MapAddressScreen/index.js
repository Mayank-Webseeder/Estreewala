import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Platform,
  TextInput
} from 'react-native';
import WebView from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from "../../../../redux/slices/addressSlice"
import Header from "../../../../components/header"
import { styles } from "./styles";
import appColors from '../../../../theme/appColors';
import { useToast } from "../../../../utils/context/toastContext"
import { useAuth } from '../../../../utils/context/authContext';

const MapAddressScreen = ({ navigation, route }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { userLocation } = useAuth();
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  console.log("userLocation", userLocation);
  const { addresses, addressesLoading } = useSelector(state => state.address);
  const { editingAddress } = route.params || {};
  const isEditMode = !!editingAddress;

  const webViewRef = useRef(null);
  // State for address form
  const [addressType, setAddressType] = useState(editingAddress?.type || 'Home');
  const [addressLine1, setAddressLine1] = useState(editingAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(editingAddress?.addressLine2 || '');
  const [city, setCity] = useState(editingAddress?.city || '');
  const [stateName, setStateName] = useState(editingAddress?.state || '');
  const [pincode, setPincode] = useState(editingAddress?.pincode || '');
  const [isDefault, setIsDefault] = useState(editingAddress?.isDefault || false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const normalizeCoordinates = (coords) => {
    if (!coords || coords.length !== 2) return null;
    const [a, b] = coords;
    if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [a, b]; // lat,lng
    return [b, a]; // swap if seems like lng,lat
  };

  const [coordinates, setCoordinates] = useState(() => {
    if (editingAddress?.coordinates?.length === 2) {
      return normalizeCoordinates(editingAddress.coordinates);
    }
    if (userLocation?.coordinates?.length === 2) {
      // Assuming [lng, lat] or [long, lat]
      const [lng, lat] = normalizeCoordinates(userLocation.coordinates);
      return [lng, lat];
    }
    return null;
  });


  useEffect(() => {
    if (hasLocationPermission && !coordinates) {
      useCurrentLocation();
    }
  }, [hasLocationPermission]);


  useEffect(() => {
    if (coordinates?.length === 2) {
      const [lng, lat] = coordinates;

      // 🔥 auto reverse geocode when coordinates are set
      reverseGeocodeCoordinates(lat, lng);
    }
  }, [coordinates]);



  // Initialize with editing address or user location
  useEffect(() => {
    if (editingAddress) {
      const coords = normalizeCoordinates(editingAddress.coordinates);

      if (coords) {
        setCoordinates(coords);
      } else if (userLocation?.latitude && userLocation?.longitude) {
        setCoordinates([userLocation.longitude, userLocation.latitude]);
      }

      setAddressType(editingAddress.type);
      setAddressLine1(editingAddress.addressLine1 || '');
      setAddressLine2(editingAddress.addressLine2 || '');
      setCity(editingAddress.city || '');
      setStateName(editingAddress.state || '');
      setPincode(editingAddress.pincode || '');
      setIsDefault(editingAddress.isDefault);
    } else if (userLocation?.latitude && userLocation?.longitude) {
      setCoordinates([userLocation.longitude, userLocation.latitude]);
    }

    requestLocationPermission();
  }, [editingAddress, userLocation]);



  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show your position on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
        } else {
          setHasLocationPermission(false);
        }
      } else {
        setHasLocationPermission(true);
      }
    } catch (err) {
      console.warn('Permission error:', err);
      setHasLocationPermission(false);
    }
  };

  // Manual reverse geocoding function - IMPROVED
  const reverseGeocodeCoordinates = async (lat, lng) => {
    if (isReverseGeocoding) return;

    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'YourApp/1.0' } }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.address) {
          parseNominatimAddress(data);
        }
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Fixed Map HTML - Improved with better geocoding
  const getMapHtml = () => {
    // Convert coordinates from [lng, lat] to [lat, lng] for map display
    const mapLat = coordinates?.[1];
    const mapLng = coordinates?.[0];

    if (mapLat == null || mapLng == null) {
      return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    font-family: Arial, sans-serif;
  }
  .box {
    text-align: center;
    padding: 20px;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
</head>
<body>
  <div class="box">
    ${hasLocationPermission
          ? `
          <div class="spinner"></div>
          <h3>Fetching your current location…</h3>
          <p>Please wait while we find you on the map</p>
        `
          : `
          <h3>📍 Location Required</h3>
          <p>Please allow location access to continue</p>
        `
        }
  </div>
</body>
</html>
`;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 80%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-container { background: #f8f9fa; font: inherit; }
        .custom-marker {
          background: #007bff;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .address-popup { 
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          padding: 8px;
          max-width: 300px;
        }
        .loading-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 5px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script>
        let map, marker;
        let currentLat = ${mapLat};
        let currentLng = ${mapLng};
        let isInitialized = false;
        let isGeocoding = false;

        function initMap() {
          if (isInitialized) return;
          isInitialized = true;
          
          console.log('🗺️ Initializing map at - Lat:', currentLat, 'Lng:', currentLng);
          
          try {
            // Validate coordinates
            if (isNaN(currentLat) || isNaN(currentLng)) {
              throw new Error('Invalid coordinates: ' + currentLat + ', ' + currentLng);
            }

            // Initialize map
            map = L.map('map', {
              zoomControl: true,
              dragging: true,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              boxZoom: true,
              keyboard: true,
              tap: true,
              touchZoom: true
            }).setView([currentLat, currentLng], 16);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
              minZoom: 3
            }).addTo(map);

            // Create custom marker icon
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width: 20px; height: 20px; border-radius: 50%; background: #007bff; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            // Add draggable marker
            marker = L.marker([currentLat, currentLng], {
              icon: customIcon,
              draggable: true
            }).addTo(map);

            // Update popup initially
            updateMarkerPopup();

            // Handle marker drag end
            marker.on('dragstart', function(e) {
              // Show loading in popup when dragging starts
              marker.bindPopup(
                '<div class="address-popup">' +
                '<strong>📍 Moving Location</strong><br>' +
                'Lat: ' + currentLat.toFixed(6) + '<br>' +
                'Lng: ' + currentLng.toFixed(6) + '<br>' +
                '<small>Drag to new location...</small>' +
                '</div>'
              ).openPopup();
            });

            marker.on('dragend', function(e) {
              const newLatLng = e.target.getLatLng();
              currentLat = newLatLng.lat;
              currentLng = newLatLng.lng;
              
              console.log('📍 Marker dragged to - Lat:', currentLat, 'Lng:', currentLng);
              
              // Update popup immediately with new coordinates
              updateMarkerPopup();
              
              // Send coordinates in API format [lng, lat]
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'COORDINATES',
                coordinates: [currentLng, currentLat] // [lng, lat] for API
              }));
              
              // Reverse geocode new location - FIXED: Ensure this triggers
              setTimeout(() => {
                reverseGeocode(currentLat, currentLng);
              }, 300);
            });

            // Handle map click to move marker - FIXED: Improved click handling
            map.on('click', function(e) {
              const newLatLng = e.latlng;
              currentLat = newLatLng.lat;
              currentLng = newLatLng.lng;
              
              console.log('📍 Map clicked at - Lat:', currentLat, 'Lng:', currentLng);
              marker.setLatLng(newLatLng);
              
              // Update popup immediately
              updateMarkerPopup();
              
              // Send coordinates in API format [lng, lat]
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'COORDINATES',
                coordinates: [currentLng, currentLat] // [lng, lat] for API
              }));
              
              // Reverse geocode new location - FIXED: Ensure this always triggers
              setTimeout(() => {
                reverseGeocode(currentLat, currentLng);
              }, 300);
            });

            // Force map refresh
            setTimeout(function() {
              map.invalidateSize();
            }, 100);

            console.log('✅ Map initialized successfully at your location');

          } catch (error) {
            console.error('❌ Map initialization error:', error);
            // Send error to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ERROR',
              error: error.message
            }));
          }
        }

        function updateMarkerPopup() {
          if (!marker) return;
          
          const popupContent = 
            '<div class="address-popup">' +
            '<strong>📍 Selected Location</strong><br>' +
            'Latitude: ' + currentLat.toFixed(6) + '<br>' +
            'Longitude: ' + currentLng.toFixed(6) + '<br>' +
            (isGeocoding ? '<small>Getting address... <div class="loading-spinner"></div></small>' : '<small>Drag marker or tap map to move</small>') +
            '</div>';
            
          marker.bindPopup(popupContent).openPopup();
        }

        async function reverseGeocode(lat, lng) {
          if (isGeocoding) return;
          isGeocoding = true;
          
          try {
            console.log('🔍 Reverse geocoding - Lat:', lat, 'Lng:', lng);
            
            // Show loading state in popup
            updateMarkerPopup();
            
            const response = await fetch(
              'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + 
              lat + '&lon=' + lng + '&zoom=18&addressdetails=1',
              {
                headers: {
                  'User-Agent': 'YourApp/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                console.log('📫 Got address:', data.display_name);
                
                // Send address to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'ADDRESS',
  raw: data
}));

                
                // Update popup with address
                marker.bindPopup(
                  '<div class="address-popup">' +
                  '<strong>📍 Selected Location</strong><br>' +
                  data.display_name + '<br>' +
                  '<small>Lat: ' + lat.toFixed(6) + ', Lng: ' + lng.toFixed(6) + '</small>' +
                  '</div>'
                ).openPopup();
              } else {
                // If no address found, send coordinates only
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ADDRESS_NOT_FOUND',
                  coordinates: [lng, lat]
                }));
              }
            } else {
              // If API response not OK
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'GEOCODING_ERROR',
                coordinates: [lng, lat]
              }));
            }
          } catch (error) {
            console.error('❌ Geocoding error:', error);
            // Send error for manual handling
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GEOCODING_ERROR',
              coordinates: [lng, lat]
            }));
          } finally {
            isGeocoding = false;
          }
        }

        function updateMapPosition(lat, lng) {
          if (!map || !marker) {
            console.log('⚠️ Map not ready for update');
            return;
          }
          
          // Validate new coordinates
          if (isNaN(lat) || isNaN(lng)) {
            console.error('❌ Invalid coordinates received:', lat, lng);
            return;
          }
          
          currentLat = lat;
          currentLng = lng;
          
          console.log('🎯 Updating map position - Lat:', lat, 'Lng:', lng);
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
          updateMarkerPopup();
          
          // Also reverse geocode the new position
          setTimeout(() => reverseGeocode(lat, lng), 500);
        }

        function setCurrentLocation(lat, lng) {
          console.log('🎯 Setting current location - Lat:', lat, 'Lng:', lng);
          updateMapPosition(lat, lng);
        }

        // Initialize map when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initMap);
        } else {
          initMap();
        }

        // Handle resize
        window.addEventListener('resize', function() {
          if (map) {
            setTimeout(() => map.invalidateSize(), 100);
          }
        });

      </script>
    </body>
    </html>
    `;
  };

  const parseNominatimAddress = (data) => {
    if (isEditMode) return;

    const addr = data.address || {};

    const line1Parts = [
      addr.house_number,
      addr.building,
      addr.road,
      addr.county,
      addr.suburb,
      addr.neighbourhood,
      addr.locality
    ].filter(Boolean);

    const line1 = line1Parts.join(', ');

    const line2Parts = [
      addr.suburb,
      addr.neighbourhood,
      addr.locality,
    ].filter(Boolean);

    const line2 = line2Parts.join(', ');

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      '';

    const state = addr.state || '';
    const pincode = addr.postcode || '';

    setAddressLine1(line1);
    setAddressLine2(line2);
    setCity(city);
    setStateName(state);
    setPincode(pincode);
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message:', data);

      switch (data.type) {
        case 'COORDINATES':
          setCoordinates(data.coordinates);
          console.log('📍 Coordinates updated:', data.coordinates);
          setTimeout(() => {
            reverseGeocodeCoordinates(data.coordinates[1], data.coordinates[0]);
          }, 1000);
          break;

        case 'ADDRESS':
          if (data.raw) {
            parseNominatimAddress(data.raw);
          }
          break;

        case 'ADDRESS_NOT_FOUND':
          console.log('📍 Address not found for coordinates:', data.coordinates);
          reverseGeocodeCoordinates(data.coordinates[1], data.coordinates[0]);
          break;

        case 'GEOCODING_ERROR':
          console.error('❌ Geocoding failed for coordinates:', data.coordinates);
          reverseGeocodeCoordinates(data.coordinates[1], data.coordinates[0]);
          break;

        case 'ERROR':
          console.error('❌ Map error:', data.error);
          showToast("Failed to load map. Please try again.", "error");
          break;
      }
    } catch (error) {
      console.error('❌ Error parsing WebView message:', error);
    }
  };

  const useCurrentLocation = () => {
    if (!hasLocationPermission) {
      showToast("Location permission is required", "error");
      requestLocationPermission();
      return;
    }

    setIsFetchingLocation(true); // ✅ START FETCHING

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const newCoordinates = [longitude, latitude];
        setCoordinates(newCoordinates);
        reverseGeocodeCoordinates(latitude, longitude);

        const jsCode = `setCurrentLocation(${latitude}, ${longitude}); true;`;
        webViewRef.current?.injectJavaScript(jsCode);

        setIsFetchingLocation(false); // ✅ DONE
      },
      (error) => {
        setIsFetchingLocation(false); // ❌ ERROR CASE
        showToast("Unable to fetch location", "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };


  const validateForm = () => {
    if (!addressLine1) return false;
    if (!city) return false;
    if (!stateName) return false;
    if (!pincode) return false;
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const addressData = {
        type: addressType,
        addressLine1,
        addressLine2,
        city,
        state: stateName,
        pincode,
        coordinates,
        isDefault
      };

      console.log("💾 Saving address:", addressData);

      if (editingAddress) {
        await dispatch(updateAddress({
          id: editingAddress._id,
          addressData
        })).unwrap();
      } else {
        await dispatch(addAddress(addressData)).unwrap();
      }

      navigation.goBack();

    } catch (error) {
      console.error("❌ Error saving address:", error);
      showToast(error?.message || "Failed to save address", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const addressTypes = ['Home', 'Work', 'Other'];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={editingAddress ? "Edit Address" : "Add New Address"}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            style={styles.map}
            key={coordinates ? coordinates.join(',') : 'fetching'}
            source={{ html: getMapHtml() }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => {
              setIsMapLoading(false);
              console.log('✅ WebView loaded successfully at your location');
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              setIsMapLoading(false);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            renderLoading={() => (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color={appColors.blue} />
                <Text style={styles.loadingText}>Loading map at your location...</Text>
              </View>
            )}
            startInLoadingState={true}
            mixedContentMode="compatibility"
          />

          <TouchableOpacity
            style={[
              styles.currentLocationButton,
              isFetchingLocation && { opacity: 0.6 }
            ]}
            onPress={useCurrentLocation}
            disabled={isFetchingLocation}
          >
            {isFetchingLocation ? (
              <ActivityIndicator size="small" color={appColors.blue} />
            ) : (
              <Icon name="my-location" size={28} color={appColors.blue} />
            )}
          </TouchableOpacity>


          {isMapLoading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={appColors.blue} />
              <Text style={styles.loadingText}>Loading map at your location...</Text>
            </View>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <View style={styles.selectedAddressContainer}>

            <Text style={styles.selectedAddressLabel}>House / Flat / Road</Text>

            <TextInput
              style={styles.input}
              placeholder="House / Flat / Road"
              placeholderTextColor={"gray"}
              value={addressLine1}
              onChangeText={setAddressLine1}
            />

            <Text style={styles.selectedAddressLabel}>Area / Landmark (Optional)</Text>

            <TextInput
              style={styles.input}
              placeholder="Area / Landmark (Optional)"
              placeholderTextColor={"gray"}
              value={addressLine2}
              onChangeText={setAddressLine2}
            />

            <Text style={styles.selectedAddressLabel}>City</Text>

            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={"gray"}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.selectedAddressLabel}>State</Text>

            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor={"gray"}
              value={stateName}
              onChangeText={setStateName}
            />

            <Text style={styles.selectedAddressLabel}>Pincode</Text>

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              placeholderTextColor={"gray"}
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
              maxLength={6}
            />

            {isReverseGeocoding && (
              <View style={styles.geocodingIndicator}>
                <ActivityIndicator size="small" color={appColors.blue} />
                <Text style={styles.geocodingText}>Fetching address from map…</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address Type</Text>
            <View style={styles.addressTypeContainer}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.addressTypeOption,
                    addressType === type && styles.addressTypeOptionSelected
                  ]}
                  onPress={() => setAddressType(type)}
                >
                  <Text
                    style={[
                      styles.addressTypeText,
                      addressType === type && styles.addressTypeTextSelected
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {!editingAddress?.isDefault && (
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() => setIsDefault(!isDefault)}
              >
                <View style={[
                  styles.checkbox,
                  isDefault && styles.checkboxSelected
                ]}>
                  {isDefault && <Icon name="check" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxText}>Set as default address</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!addressLine1 || !city || !stateName || !pincode || isSaving) &&
              styles.saveButtonDisabled
            ]}
            onPress={handleSaveAddress}
            disabled={!addressLine1 || !city || !stateName || !pincode || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={appColors.darkBlue} />
            ) : (
              <Text style={styles.saveButtonText}>
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MapAddressScreen;