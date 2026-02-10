import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../utils/context/authContext';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import appColors from '../../../theme/appColors';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../../../redux/slices/orderSlice';
import moment from 'moment';
import { clearCart } from '../../../redux/slices/cartSlice';
import { useToast } from '../../../utils/context/toastContext';


const UserDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const {
    vendorId,
    pickupDate,
    selectedDropDate,
    pickupSlot,
    note,
    location,
  } = route.params || {};

  const cartItems = useSelector(state => state.cart.items);
  const totalPrice = Object.keys(cartItems).reduce((sum, key) => {
    const item = cartItems[key];
    const price = item.price || 0;
    return sum + price * item.qty;
  }, 0);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saveAddressAs, setSaveAddressAs] = useState('Home');
  const [coords, setCoords] = useState({
    latitude: location?.latitude || 28.6139,
    longitude: location?.longitude || 77.209,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [locationErrorModalVisible, setLocationErrorModalVisible] =
    useState(false);
  const [errorType, setErrorType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const webViewRef = useRef(null);
  const { saveLocation, userLocation } = useAuth();
  const [address, setAddress] = useState(userLocation?.address || '');
  const { showToast } = useToast();

  // Check and request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show your position on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
          return true;
        } else {
          setHasLocationPermission(false);
          return false;
        }
      } else {
        setHasLocationPermission(true);
        return true;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      setHasLocationPermission(false);
      return false;
    }
  };

  useEffect(() => {
    initializeLocation();
    loadSavedData();
    loadSavedAddresses();
  }, []);

  const initializeLocation = async () => {
    setIsLoading(true);
    setPermissionModalVisible(false);

    const hasPermission = await requestLocationPermission();

    if (hasPermission) {
      if (location?.latitude && location?.longitude) {
        setCoords({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        updateMap(location.latitude, location.longitude);
        setAddress(location.address || '');
        reverseGeocode(location.latitude, location.longitude);
        setIsLoading(false);
      } else {
        getCurrentLocation();
      }
    } else {
      handlePermissionDenied();
    }
  };

  const handlePermissionDenied = () => {
    setIsLoading(false);
    setHasLocationPermission(false);
    setErrorType('permission');
    setErrorMessage(
      'Location access is needed to find your exact position for delivery',
    );
    setPermissionModalVisible(true);
  };

  const handleLocationError = (type, message) => {
    setIsLoading(false);
    if (locationErrorModalVisible) return;

    setErrorType(type);
    setErrorMessage(message);
    setLocationErrorModalVisible(true);
  };

  const loadSavedAddresses = async () => {
    try {
      const addressesJson = await AsyncStorage.getItem('savedAddresses');
      if (addressesJson) {
        setSavedAddresses(JSON.parse(addressesJson));
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);

    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        updateMap(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setIsLoading(false);
        setHasLocationPermission(true);
        setPermissionModalVisible(false);
        setLocationErrorModalVisible(false);
      },
      error => {
        console.log('Location error:', error);
        setIsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          handleLocationError(
            'permission',
            'Location access was denied. Please enable location permissions in settings.',
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          handleLocationError(
            'unavailable',
            'Unable to retrieve your location. Please check your GPS and internet connection.',
          );
        } else if (error.code === error.TIMEOUT) {
          handleLocationError(
            'timeout',
            'Location request timed out. Please check your connection and try again.',
          );
        } else {
          handleLocationError(
            'general',
            'Could not fetch your location. Please try again.',
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10,
      },
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data && data.display_name) {
        setAddress(data.display_name);

        const suggestions = [
          data.display_name,
          `${data.address.road || ''}, ${data.address.suburb || data.address.city_district || ''
          }`,
          `${data.address.neighbourhood || data.address.suburb || ''}, ${data.address.city || data.address.town || ''
          }`,
        ].filter(addr => addr.trim() !== '');

        setAddressSuggestions(suggestions);
      } else {
        setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`Near coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const loadSavedData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setName(parsedData.name || '');
        setMobile(parsedData.mobile || '');
        setEmail(parsedData.email || '');
        setFlatNo(parsedData.flatNo || '');
        setLandmark(parsedData.landmark || '');
        setSaveAddressAs(parsedData.saveAddressAs || 'Home');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const updateMap = (lat, lng) => {
    if (webViewRef.current) {
      const jsCode = `updateMap(${lat}, ${lng}); true;`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation - Required
    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Mobile validation - Required
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Email validation - Required
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Address validation - Required
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address (minimum 10 characters)';
    }

    // Flat/House No validation - Required
    if (!flatNo.trim()) {
      newErrors.flatNo = 'Flat/House number is required';
    }

    // Landmark validation - Required
    if (!landmark.trim()) {
      newErrors.landmark = 'Landmark is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Add this validation before the API call
  const validateOrderItems = () => {
    const cartItemsArray = Object.keys(cartItems).map(key => cartItems[key]);

    const premiumServices = ['steam ironing', 'spin washing', 'steam washing', 'stain removal'];
    const mainServices = ['ironing', 'washing', 'dry wash', 'wash & iron', 'wash and iron'];

    const hasPremiumServices = cartItemsArray.some(item =>
      premiumServices.includes(item.service?.toLowerCase())
    );

    const hasMainServices = cartItemsArray.some(item =>
      mainServices.includes(item.service?.toLowerCase())
    );

    if (hasPremiumServices && !hasMainServices) {
      showToast(
        `Please select a main service (Ironing, Washing, Dry Wash, or Wash & Iron). Premium services can only be added after choosing a main service.`,
        "info"
      );
      return false;
    }

    return true;
  };





  const handleSave = async () => {
    try {
      // 🔹 Validate all fields before proceeding
      if (!validateForm()) {
        return;
      }

      // 🔹 Ensure pickup & delivery dates are valid
      const pickupMoment = moment(pickupDate).isValid()
        ? moment(pickupDate)
        : moment().add(1, 'days');

      const deliveryMoment = moment(selectedDropDate).isValid()
        ? moment(selectedDropDate)
        : pickupMoment.clone().add(2, 'days');

      // 🔹 Build full address dynamically
      const fullAddress = `${flatNo ? flatNo + ', ' : ''}${address}${landmark ? ', ' + landmark : ''
        }`;

      // 🔹 Extract pickup start time
      const now = new Date();

      // 2. Add 2 or 3 hours delay (let's take 3 hours for example)
      const defaultPickupTimeDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);

      // 3. Format it to "HH:mm AM/PM"
      const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // convert 0 => 12
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
      };

      // 4. Use pickupSlot time or default time
      const rawPickupTime = pickupSlot?.time || formatTime(defaultPickupTimeDate);
      const pickupStartTime = rawPickupTime.split('-')[0].trim();
      const formattedDeliveryTime = deliveryMoment.format('hh:mm A');

      // 🔹 Construct final payload
      const orderPayload = {
        vendorId: vendorId || '',
        items: Object.keys(cartItems).map(key => ({
          item: cartItems[key].itemId,
          category: cartItems[key].category,
          service: cartItems[key].service || '',
          quantity: cartItems[key].qty || 1,
        })),
        totalPrice: totalPrice || 0,
        pickupDate: pickupMoment.format('YYYY-MM-DD'),
        pickupTime: pickupStartTime,
        deliveryDate: deliveryMoment.format('YYYY-MM-DD'),
        deliveryTime: formattedDeliveryTime,
        instructions: note,
        address: fullAddress,
        coordinates: {
          type: 'Point',
          coordinates: [
            coords?.longitude || 0,
            coords?.latitude || 0,
          ],
        },
        house: flatNo || '',
        landmark: landmark || '',
        contactDetails: {
          fullName: name || '',
          mobile: mobile || '',
          email: email || '',
        },
      };

      console.log(
        '🧾 FINAL ORDER PAYLOAD ===>>>',
        JSON.stringify(orderPayload, null, 2),
      );

      const result = await dispatch(placeOrder(orderPayload)).unwrap();
      dispatch(clearCart());
      navigation.replace('OrderConfirmation', { orderData: result });
    } catch (error) {
      console.error('❌ Error placing order:', error);
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('Premium service') &&
        errorMessage.includes('can only be added along with a main service')) {
        showToast(
          errorMessage,
          "info"
        );
      } else {
        showToast(
          error?.message || 'Failed to place order. Please try again.',
          "error"
        );
      }
    }
  };

  // Custom Modal Components
  const PermissionModal = () => (
    <Modal
      visible={permissionModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPermissionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.customModalContainer}>
          <View style={styles.modalIconContainer}>
            <Icon name="location-off" size={50} color={appColors.orange} />
          </View>

          <Text style={styles.modalTitle}>Location Access Needed</Text>

          <Text style={styles.modalMessage}>
            {errorMessage ||
              'We need location access to find your exact position for accurate delivery.'}
          </Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => {
                setPermissionModalVisible(false);
                setCoords({
                  latitude: 28.6139,
                  longitude: 77.209,
                });
                updateMap(28.6139, 77.209);
                setAddress('Delhi, India (Default Location)');
              }}
            >
              <Text style={styles.secondaryButtonText}>
                Use Default Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.primaryButton]}
              onPress={initializeLocation}
            >
              <Text style={styles.primaryButtonText}>Allow Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const LocationErrorModal = () => (
    <Modal
      visible={locationErrorModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLocationErrorModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.customModalContainer}>
          <View style={styles.modalIconContainer}>
            <Icon
              name={errorType === 'unavailable' ? 'gps-off' : 'error-outline'}
              size={50}
              color={appColors.orange}
            />
          </View>

          <Text style={styles.modalTitle}>
            {errorType === 'permission'
              ? 'Location Access Denied'
              : errorType === 'unavailable'
                ? 'Location Unavailable'
                : 'Location Error'}
          </Text>

          <Text style={styles.modalMessage}>{errorMessage}</Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.primaryButton]}
              onPress={() => {
                setLocationErrorModalVisible(false);
                setTimeout(() => {
                  getCurrentLocation();
                }, 300);
              }}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Radio button component
  const RadioButton = ({ selected, onPress, label, value }) => (
    <TouchableOpacity style={styles.radioOption} onPress={() => onPress(value)}>
      <View style={styles.radioCircle}>
        {selected && <View style={styles.selectedRb} />}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );

  // Map HTML
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-container { background: #f8f9fa; }
        .custom-marker {
          background-color: #ff7e00;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script>
        let map, marker;

        function initMap() {
          map = L.map('map').setView([${coords.latitude}, ${coords.longitude}], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width: 20px; height: 20px; border-radius: 50%;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          marker = L.marker([${coords.latitude}, ${coords.longitude}], {
            icon: customIcon
          }).addTo(map).bindPopup('Your location').openPopup();
        }

        function updateMap(lat, lng) {
          if (map) {
            map.setView([lat, lng], 16);
            if (marker) marker.setLatLng([lat, lng]);
          }
        }

        document.addEventListener('DOMContentLoaded', initMap);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.blue} />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      ) : (
        <>
          {/* Map Section */}
          <View style={styles.mapContainer}>
            <WebView
              ref={webViewRef}
              style={styles.map}
              source={{ html: mapHtml }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onLoadEnd={() => setIsMapLoading(false)}
              renderLoading={() => (
                <View style={styles.mapLoadingContainer}>
                  <ActivityIndicator size="large" color={appColors.blue} />
                </View>
              )}
            />

            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
            >
              <Icon name="my-location" size={20} color={appColors.blue} />
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            {/* Address Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Address *</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    errors.address && styles.inputError,
                    { paddingRight: 40 },
                  ]}
                  placeholder="Enter your complete address *"
                  placeholderTextColor={appColors.font}
                  value={address}
                  onChangeText={text => {
                    setAddress(text);
                    setErrors({ ...errors, address: null });
                    setShowSuggestions(text.length > 2);
                  }}
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  style={styles.inputIcon}
                  onPress={() => setMapModalVisible(true)}
                >
                  <Icon name="place" size={20} color="#888" />
                </TouchableOpacity>
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            {/* Flat/House No */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Flat / House No *</Text>
              <TextInput
                style={[styles.input, errors.flatNo && styles.inputError]}
                placeholder="E.g. B-102, Sunrise Apartments *"
                placeholderTextColor={appColors.border}
                value={flatNo}
                onChangeText={text => {
                  setFlatNo(text);
                  setErrors({ ...errors, flatNo: null });
                }}
              />
              {errors.flatNo && (
                <Text style={styles.errorText}>{errors.flatNo}</Text>
              )}
            </View>

            {/* Landmark */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Landmark *</Text>
              <TextInput
                style={[styles.input, errors.landmark && styles.inputError]}
                placeholder="E.g. Near Central Mall *"
                placeholderTextColor={appColors.border}
                value={landmark}
                onChangeText={text => {
                  setLandmark(text);
                  setErrors({ ...errors, landmark: null });
                }}
              />
              {errors.landmark && (
                <Text style={styles.errorText}>{errors.landmark}</Text>
              )}
            </View>

            {/* Save Address As */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Save Address As *</Text>
              <View style={styles.radioGroup}>
                <RadioButton
                  selected={saveAddressAs === 'Home'}
                  onPress={setSaveAddressAs}
                  label="Home"
                  value="Home"
                />
                <RadioButton
                  selected={saveAddressAs === 'Work'}
                  onPress={setSaveAddressAs}
                  label="Work"
                  value="Work"
                />
                <RadioButton
                  selected={saveAddressAs === 'Other'}
                  onPress={setSaveAddressAs}
                  label="Other"
                  value="Other"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Contact Details</Text>

            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Your name *"
                placeholderTextColor={appColors.border}
                value={name}
                onChangeText={text => {
                  setName(text);
                  setErrors({ ...errors, name: null });
                }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Mobile */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={[styles.input, errors.mobile && styles.inputError]}
                placeholder="10-digit mobile number *"
                placeholderTextColor={appColors.border}
                value={mobile}
                onChangeText={text => {
                  setMobile(text);
                  setErrors({ ...errors, mobile: null });
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.mobile && (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Your email address *"
                placeholderTextColor={appColors.border}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save & Continue</Text>
            </TouchableOpacity>

            {/* Required Fields Note */}
            <Text style={styles.requiredNote}>
              * All fields are required
            </Text>
          </ScrollView>
        </>
      )}

      {/* Custom Modals */}
      <PermissionModal />
      <LocationErrorModal />

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)}>
              <Icon name="close" size={24} color={appColors.darkBlue} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={styles.placeholder} />
          </View>
          <WebView
            style={styles.fullScreenMap}
            source={{ html: mapHtml }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          <TouchableOpacity
            style={styles.confirmLocationButton}
            onPress={() => setMapModalVisible(false)}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserDetailsScreen;