// otherComponent/location/confirmLocation.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { styles } from './styles';
import appColors from '../../../theme/appColors';
import { useAuth } from '../../../utils/context/authContext';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ConfirmLocationScreen = ({ route }) => {
  const { selectedLocation } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { saveLocation, markAppAsLaunched, isFirstLaunch, userToken } = useAuth();

  // Get address state from Redux
  const { addLoading, addSuccess, addError } = useSelector(state => state.address);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();



  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to show your position on the map.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          return true;
        } else {
          setHasPermission(false);
          return false;
        }
      } else {
        // For iOS, we'll rely on Geolocation's built-in permission handling
        setHasPermission(true);
        return true;
      }
    } catch (err) {
      console.warn("Permission error:", err);
      setHasPermission(false);
      return false;
    }
  };

  useEffect(() => {
    initializeLocation();
  }, [selectedLocation]);

  // Handle add address success
  useEffect(() => {
    if (addSuccess) {
      console.log("✅ Address added successfully");
      // Continue with navigation after address is saved
      handleNavigation();
    }
  }, [addSuccess]);

  // Handle add address error
  useEffect(() => {
    if (addError) {
      console.error("❌ Error adding address:", addError);
      Alert.alert("Error", "Failed to save your address. Please try again.");
      setLoading(false);
    }
  }, [addError]);

  const initializeLocation = async () => {
    setLoading(true);

    // Request permission first
    const permissionGranted = await requestLocationPermission();

    if (permissionGranted) {
      if (selectedLocation) {
        // Use selected location
        setAddress(selectedLocation.formattedAddress || selectedLocation.name);
        setLocation({
          coords: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          }
        });
        setLoading(false);
        updateMap(selectedLocation.latitude, selectedLocation.longitude);
      } else {
        // Get current location
        getCurrentLocation();
      }
    } else {
      // Permission denied
      setLoading(false);
      Alert.alert(
        "Permission Required",
        "Location permission is required to show your position on the map.",
        [
          {
            text: "Try Again",
            onPress: initializeLocation
          },
          {
            text: "Use Default",
            onPress: () => {
              const defaultLocation = {
                coords: {
                  latitude: 28.6139,
                  longitude: 77.2090
                }
              };
              setLocation(defaultLocation);
              setAddress("Delhi, India");
              updateMap(28.6139, 77.2090);
            }
          }
        ]
      );
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        reverseGeocode(position.coords.latitude, position.coords.longitude);
        updateMap(position.coords.latitude, position.coords.longitude);
        setHasPermission(true);
      },
      (error) => {
        console.error('Location error:', error);
        setLoading(false);

        // Handle different error types
        if (error.code === error.PERMISSION_DENIED) {
          Alert.alert(
            "Permission Denied",
            "Please enable location permissions in your device settings.",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings()
              },
              {
                text: "Use Default Location",
                onPress: () => {
                  const defaultLocation = {
                    coords: {
                      latitude: 28.6139,
                      longitude: 77.2090
                    }
                  };
                  setLocation(defaultLocation);
                  setAddress("Delhi, India");
                  updateMap(28.6139, 77.2090);
                }
              }
            ]
          );
        } else {
          Alert.alert(
            "Location Error",
            "Could not get your location. Please try again.",
            [
              { text: "Retry", onPress: getCurrentLocation },
              {
                text: "Use Default",
                onPress: () => {
                  const defaultLocation = {
                    coords: {
                      latitude: 28.6139,
                      longitude: 77.2090
                    }
                  };
                  setLocation(defaultLocation);
                  setAddress("Delhi, India");
                  updateMap(28.6139, 77.2090);
                }
              }
            ]
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "LaundryApp/1.0",
            "Accept": "application/json"
          }
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }

      setAddress(data.display_name || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMap = (lat, lng) => {
    if (webViewRef.current) {
      // Wait a bit for the WebView to be ready
      setTimeout(() => {
        const jsCode = `
          if (typeof updateMap === 'function') {
            updateMap(${lat}, ${lng});
          } else {
            // If updateMap is not available yet, initialize the map
            initMap();
            setTimeout(() => updateMap(${lat}, ${lng}), 100);
          }
          true;
        `;
        webViewRef.current.injectJavaScript(jsCode);
      }, 500);
    }
  };

  const handleMapLoad = () => {
    setMapLoading(false);
    console.log('Map loaded successfully');

    // If we have location data, update the map
    if (location) {
      updateMap(location.coords.latitude, location.coords.longitude);
    } else if (selectedLocation) {
      updateMap(selectedLocation.latitude, selectedLocation.longitude);
    }
  };

  const handleMapError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setMapLoading(false);
  };

  const handleNavigation = async () => {
    try {
      // Mark app as launched after location confirmation
      if (isFirstLaunch) {
        await markAppAsLaunched();
      }

      // Navigate based on first launch status
      if (isFirstLaunch) {
        navigation.navigate('NotificationPermission');
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Could not proceed. Please try again.");
    }
  };

  const handleConfirmLocation = async () => {
    if (location && address) {
      try {
        setLoading(true);

        // Prepare address data according to API structure
        const addressData = {
          type: "Home",
          location: {
            address: address,
            coordinates: [location.coords.longitude, location.coords.latitude]
          },
          isDefault: true,
        };

        console.log("📍 Saving address:", addressData);

        // Save to local storage for re-use
        await saveLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address,
        });

        // Then call your API (uncomment this when ready)
        // await dispatch(addAddress(addressData)).unwrap();

        setLoading(false);
        console.log("✅ Location confirmed and saved successfully");
        handleNavigation();

      } catch (error) {
        console.error("Error confirming location:", error);
        setLoading(false);
        Alert.alert("Error", "Could not save your location. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please wait for location to load.");
    }
  };


  const openInMapsApp = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}`
      });
      Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
    }
  };

  // Improved HTML template for OpenStreetMap with better error handling
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body, html { 
          width: 100%; 
          height: 100%; 
          overflow: hidden;
        }
        #map { 
          width: 100%; 
          height: 100%; 
        }
        .leaflet-container { 
          background: #f8f9fa;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .custom-marker {
          background: #ff7e00;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-family: system-ui;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="loading" class="loading">Loading map...</div>
      
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script>
        let map, marker;
        let mapInitialized = false;
        
        function initMap() {
          if (mapInitialized) return;
          
          try {
            // Remove loading indicator
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.style.display = 'none';
            
            // Create map with default center (will be updated later)
            map = L.map('map').setView([28.6139, 77.2090], 13);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
              minZoom: 2
            }).addTo(map);
            
            // Custom icon
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width: 100%; height: 100%; border-radius: 50%; background: #ff7e00;"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            // Create initial marker
            marker = L.marker([28.6139, 77.2090], { icon: customIcon })
              .addTo(map)
              .bindPopup('Your Location')
              .openPopup();
            
            mapInitialized = true;
            console.log('Map initialized successfully');
            
          } catch (error) {
            console.error('Map initialization error:', error);
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.innerHTML = 'Error loading map';
          }
        }
        
        function updateMap(lat, lng) {
          if (!mapInitialized) {
            initMap();
            // Retry after a short delay
            setTimeout(() => updateMap(lat, lng), 100);
            return;
          }
          
          try {
            // Update map view
            map.setView([lat, lng], 15);
            
            // Update or create marker
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              const customIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="width: 100%; height: 100%; border-radius: 50%; background: #ff7e00;"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              
              marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
            }
            
            console.log('Map updated to:', lat, lng);
          } catch (error) {
            console.error('Map update error:', error);
          }
        }
        
        // Initialize map when page loads
        document.addEventListener('DOMContentLoaded', function() {
          console.log('DOM loaded, initializing map...');
          initMap();
        });
        
        // Fallback initialization
        setTimeout(initMap, 1000);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      {/* Map View with WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: mapHtml }}
          onLoad={handleMapLoad}
          onError={handleMapError}
          onHttpError={handleMapError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={false}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          renderLoading={() => (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color={appColors.blue} />
              <Text style={styles.mapLoadingText}>Loading map...</Text>
            </View>
          )}
        />

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
        >
          <Icon name="locate" size={20} color={appColors.blue} />
        </TouchableOpacity>

        {/* Open in Maps App Button */}
        <TouchableOpacity
          style={styles.openMapsButton}
          onPress={openInMapsApp}
        >
          <Icon name="map" size={20} color={appColors.blue} />
        </TouchableOpacity>
      </View>

      {/* Bottom Card with Address and Confirm Button */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.addressSection}>
          <Icon name="location" size={20} color={appColors.blue} style={styles.addressIcon} />
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressLabel}>Your Location</Text>
            {loading ? (
              <ActivityIndicator size="small" color={appColors.blue} style={styles.loadingIndicator} />
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>
                {address || 'Location not available'}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, (!location || loading || addLoading) && styles.disabled]}
          onPress={handleConfirmLocation}
          disabled={!location || loading || addLoading}
        >
          {(loading || addLoading) ? (
            <ActivityIndicator size="small" color={appColors.white} />
          ) : (
            <Text style={styles.confirmText}>
              {addLoading ? 'Saving Address...' : 'Confirm Location'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Loading Overlay */}
      {mapLoading && (
        <View style={styles.mapOverlay}>
          <ActivityIndicator size="large" color={appColors.blue} />
          <Text style={styles.mapOverlayText}>Loading map...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ConfirmLocationScreen;