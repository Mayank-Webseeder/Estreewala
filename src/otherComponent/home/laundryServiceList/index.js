import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid, Platform, Alert,
  Linking,
  AppState
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import FilterModal from '../filterModal';
import Header from '../../../components/header';
import SearchBar from '../../../components/searchBar';
import { styles } from './styles';
import appColors from '../../../theme/appColors';
import { washingWash, ironinWash } from '../../../utils/images/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { clearVendors, getNearbyVendors, updateNearbyVendors } from '../../../redux/slices/nearByVendor';
import { searchVendors, clearSearchResults } from '../../../redux/slices/searchSlice';
import { useSocket } from '../../../utils/context/socketContext';
import { useToast } from '../../../utils/context/toastContext';
import axiosInstance from '../../../services/axiosConfig';
import { GET_NEARBY_VENDORS_FILTER_API } from '../../../services/api';
import { useAuth } from '../../../utils/context/authContext';
import Geolocation from 'react-native-geolocation-service';
import { useFocusEffect } from '@react-navigation/native';

const randomImages = [washingWash, ironinWash];

const LaundryCard = ({ vendor, navigation, index }) => {
  const randomImage = randomImages[index % randomImages.length];
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('LaundryService', {
          title: vendor.businessName,
          vendorId: vendor.id,
          address: vendor.address
        })
      }
      style={styles.card}
    >
      <View style={styles.imageWrapper}>
        <FastImage
          source={
            vendor.profileImage
              ? { uri: vendor.profileImage }
              : randomImage
          }
          style={styles.cardImage}
          resizeMode="cover"
          defaultSource={randomImage}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{vendor.businessName}</Text>
        <View style={styles.deliveryInfo}>
          <Ionicons style={styles.icon} name="location-outline" size={14} color="#07172cff" />
          <Text style={styles.cardLocation} numberOfLines={2}>
            {vendor.address}
          </Text>
        </View>

        {vendor.distanceKm && (
          <View style={styles.deliveryInfo}>
            <Icon name="location-on" size={12} color={appColors.darkBlue} />
            <Text style={styles.deliveryText}>
              {vendor.distanceKm.toFixed(1)} km away
            </Text>
          </View>
        )}

        {/* <View style={styles.deliveryInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="access-time" size={12} color={appColors.darkBlue} />
            <Text style={styles.deliveryText}>
              {'9AM - 11 PM'}{' '}
            </Text>
          </View>
        </View> */}

        <View style={styles.dashedLine} />
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const LaundryServiceList = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { userLocation, saveLocation } = useAuth();
  console.log("userLocation", userLocation);
  const { showToast } = useToast();
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [useFilteredList, setUseFilteredList] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');

  const { vendors, vendorsLoading, vendorsError } = useSelector(
    state => state.nearByVendor,
  );
  console.log("vendors", vendors);

  const { searchResults, searchLoading, searchError } = useSelector(
    state => state.search,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [showSearchLoader, setShowSearchLoader] = useState(false);
  const { selectedAddress, addresses } = useSelector(
    state => state.address
  );

  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

  const effectiveLocation =
    selectedAddress ||
    (hasAddresses && addresses.find(a => a.isDefault)) ||
    (hasAddresses && addresses[0]) ||
    (!hasAddresses ? userLocation : null);

  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        navigation.setParams({ serviceName: undefined });
        setSelectedServices([]);
        setUseFilteredList(false);
        setFilteredVendors([]);
        setEmptyMessage('');
      };
    }, [navigation])
  );

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

  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { serviceName } = route.params || {};
  const [selectedServices, setSelectedServices] = useState([]);

  const getDisplayVendors = () => {
    if (useFilteredList) return filteredVendors;
    if (searchQuery.trim() === '') return vendors;
    if (searchQuery.trim().length <= 2) return localSearchResults;
    return searchResults;
  };


  const displayVendors = getDisplayVendors();
  const sortedDisplayVendors = React.useMemo(() => {
    return [...displayVendors].sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );
  }, [displayVendors]);

  const isInitialLoading = vendorsLoading && vendors.length === 0;
  const isSearching = showSearchLoader && searchQuery.trim().length > 2;
  const hasSearchError = searchError && searchQuery.trim() !== '';
  const hasVendorsError = vendorsError && searchQuery.trim() === '';

  const getLatLngObject = () => {
    if (!coords || coords.length !== 2) return null;
    return {
      lat: coords[1],
      lng: coords[0],
    };
  };


  console.log("DISPLAY VENDORS", displayVendors)

  console.log("serviceName", serviceName);

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


  useEffect(() => {
    if (!serviceName) return;
    if (!vendors || vendors.length === 0) return;

    const SERVICE_MAP = {
      'Dry Wash': 'Dry Wash',
      'Wash': 'Washing',
      'Washing': 'Washing',
      'Ironing': 'Ironing',
      'Steam Ironing': 'Steam Ironing',
      'Wash & Iron': 'Wash & Iron',
      'Spin Washing': 'Spin Washing',
      'Steam Washing': 'Steam Washing',
      'Stain Removal': 'Stain Removal',
    };

    const matchedService = SERVICE_MAP[serviceName];
    if (!matchedService) return;

    setSelectedServices([matchedService]);

    applyFilters({
      rating: 0,
      distance: 0,
      services: [matchedService],
      reset: false,
    });

  }, [serviceName, vendors]); 

 useFocusEffect(
  useCallback(() => {
    if (hasValidLocation) {
      dispatch(clearVendors());
      dispatch(
        getNearbyVendors({
          lng: coords[0],
          lat: coords[1],
        })
      );
    }
    return () => {
      navigation.setParams({ serviceName: undefined });
      setSelectedServices([]);
      setUseFilteredList(false);
      setFilteredVendors([]);
      setEmptyMessage('');
    };
  }, [hasValidLocation, coords?.[0], coords?.[1], dispatch, navigation])
);


  // Reverse geocode
  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    switch (result) {
      case PermissionsAndroid.RESULTS.GRANTED:
        setLocationPermissionDenied(false);
        return true;

      case PermissionsAndroid.RESULTS.DENIED:
        // ❌ User said "Don't allow" (can ask again)
        setLocationPermissionDenied(true);
        return false;

      case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
        // 🚨 User ticked "Don't ask again"
        setLocationPermissionDenied(true);
        Alert.alert(
          "Location Required",
          "Please enable location from settings to see nearby laundries",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;

      default:
        setLocationPermissionDenied(true);
        return false;
    }
  };



  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LaundryApp/1.0',
          Accept: 'application/json',
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


  const handleAutoLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        await saveLocation(null);
        return null;
      }

      return new Promise((resolve) => {
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
            resolve(locationData);
          },
          (error) => {
            console.log("📍 Location error:", error);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch (e) {
      console.log("❌ Auto address failed:", e);
      return null;
    }
  };




  // User click kare enable location
  const handleEnableLocation = async () => {
    await handleAutoLocation();
  };


  useEffect(() => {
    if (!socket) {
      console.log('❌ No socket available for vendors updates');
      return;
    }

    console.log('🎯 Setting up nearby-vendors-update listener...');

    const handleNearbyVendorsUpdate = (data) => {
      console.log('📍 Real-time vendors update received:', data);
      console.log('📊 Vendors count:', data.vendors?.length);
      console.log('📍 Location:', data.location);

      if (!data.vendors || !Array.isArray(data.vendors)) {
        console.error('❌ Invalid vendors data received');
        return;
      }

      dispatch(updateNearbyVendors({
        vendors: data.vendors,
        location: data.location,
        timestamp: new Date().toISOString()
      }));

      setLastUpdateTime(new Date());
    };

    socket.on('nearby-vendors-update', handleNearbyVendorsUpdate);

    return () => {
      if (socket) {
        console.log('🧹 Cleaning up vendors listeners');
        socket.off('nearby-vendors-update', handleNearbyVendorsUpdate);
        socket.offAny();
      }
    };
  }, [socket, dispatch, showToast]);

  const performSearch = useCallback((query) => {
    const trimmedQuery = query.trim();
    const location = getLatLngObject();

    if (!location) {
      showToast('Please enable location to search', 'info');
      return;
    }

    if (trimmedQuery === '') {
      dispatch(clearSearchResults());
      setLocalSearchResults([]);
      setShowSearchLoader(false);
      return;
    }

    if (trimmedQuery.length <= 2) {
      const localResults = vendors.filter(vendor =>
        vendor.businessName?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setLocalSearchResults(localResults);
      return;
    }

    setShowSearchLoader(true);
    dispatch(searchVendors({ searchQuery: trimmedQuery, coordinates: location }));

  }, [vendors, coords, dispatch, showToast]);


  // Debounced search with smart timing
  useEffect(() => {
    // Clear previous timeout
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, searchQuery.length <= 2 ? 300 : 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    if (!searchLoading && searchQuery.trim() !== '') {
      setShowSearchLoader(false);
      console.log("🔄 Search completed, loader hidden");
    }
  }, [searchLoading, searchQuery]);

  // Manual refresh function
  const handleManualRefresh = () => {
    const location = getLatLngObject();
    if (!location) {
      showToast('Location permission required', 'info');
      return;
    }

    dispatch(getNearbyVendors(location));

    if (socket && isConnected) {
      socket.emit('request-vendors-update', {
        timestamp: new Date().toISOString(),
        source: 'manual-refresh'
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedServices([]);      // 🔥 IMPORTANT
    setUseFilteredList(false);
    setFilteredVendors([]);
    setEmptyMessage('');
  };

  const applyFilters = async ({ rating, distance, services, reset }) => {
    const location = getLatLngObject();
    if (!location) {
      showToast('Please enable location to apply filters', 'info');
      return;
    }


    if (reset) {
      setUseFilteredList(false);
      setFilteredVendors([]);
      setEmptyMessage('');
      setShowFilters(false);
      return;
    }

    try {
      console.log('🌐 FILTER API MODE (AXIOS)');

      const params = {
        lat: location.lat,
        lng: location.lng,
      };

      if (services?.length > 0) params.services = services.join(',');
      if (distance > 0) params.maxDistance = distance;

      const response = await axiosInstance.get(GET_NEARBY_VENDORS_FILTER_API, {
        params,
        timeout: 10000,
      });

      const apiVendors = response?.data?.vendors || [];

      if (apiVendors.length === 0) {
        setEmptyMessage(response?.data?.message || 'No vendors found for selected filters');
      } else {
        setEmptyMessage('');
      }

      setFilteredVendors(
        rating > 0 ? apiVendors.filter(v => v.rating >= rating) : apiVendors
      );

      setUseFilteredList(true);
      setShowFilters(false);

    } catch (error) {
      console.error(' FILTER API ERROR:', error);
      setEmptyMessage('Failed to apply filters');
      showToast?.({ type: 'error', message: 'Failed to apply filters' });
    }
  };



  const handleSearchChange = (text) => {
    setSearchQuery(text);

    // Immediate local feedback for very short queries
    if (text.trim().length <= 2) {
      const immediateResults = vendors.filter(vendor =>
        vendor.businessName?.toLowerCase().includes(text.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(text.toLowerCase())
      );
      setLocalSearchResults(immediateResults);
    }
  };

  // Clear search completely
  const handleClearSearch = () => {
    setSearchQuery('');
    setLocalSearchResults([]);
    dispatch(clearSearchResults());
    setShowSearchLoader(false);
    setUseFilteredList(false); // Go back to nearby vendors
  };


  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={{ backgroundColor: '#07172cff', paddingBottom: 20 }}>
            <Header
              containerStyle={{ marginBottom: 5 }}
              iconColor={"#07172cff"}
              title={serviceName ? serviceName : 'Nearby Laundry'}
              onBackPress={() => navigation.goBack()}
              titleStyle={{ marginHorizontal: 20, color: appColors.white }}
            />
          </View>
          <View
            style={[
              styles.container,
              { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <ActivityIndicator color={appColors.darkBlue} size={'small'} />
            <Text style={{ marginTop: 10, color: appColors.darkBlue }}>
              Loading nearby vendors...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {!userLocation || locationPermissionDenied ? (
        <>
          <Header
            containerStyle={{ marginBottom: 5 }}
            iconColor={appColors.darkBlue}
            title={'Nearby Laundry'}
            onBackPress={() => navigation.goBack()}
            titleStyle={{ marginHorizontal: 20, color: appColors.darkBlue }}
          />

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Ionicons name="location-outline" size={50} color="#07172cff" />
            <Text style={styles.emptyStateTitle}>
              Enable location to see nearby vendors
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEnableLocation}
            >
              <Text style={styles.primaryButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <View style={{ backgroundColor: '#07172cff', paddingBottom: 10 }}>
            <Header
              iconColor={appColors.white}
              title={serviceName ? serviceName : 'Nearby Laundry'}
              onBackPress={() => navigation.goBack()}
              titleStyle={{ marginHorizontal: 20, color: appColors.white }}
            />

            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search for services or vendors..."
              onFilterPress={() => setShowFilters(true)}
              showFilter={true}
              searchInputContainerStyle={{
                backgroundColor: appColors.white,
              }}
              inputStyle={{
                fontSize: 12,
                paddingVertical: 0,
              }}
              placeholderTextColor={appColors.black}
              onClear={handleClearSearch}
            />


          </View>

          <View style={styles.main} />

          <ScrollView
            contentContainerStyle={styles.contentContainerStyle}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={vendorsLoading}
                onRefresh={handleManualRefresh}
                colors={[appColors.blue]}
              />
            }
          >
            {sortedDisplayVendors.length > 0 ? (
              // Show actual results
              sortedDisplayVendors.map((vendor, index) => (
                <LaundryCard
                  key={vendor.id || `${vendor.businessName}-${index}`}
                  vendor={vendor}
                  navigation={navigation}
                  index={index}
                />
              ))
            ) : (
              // Show empty state
              <View style={styles.emptyState}>
                <Icon name="search-off" size={60} color={appColors.lightGray} />
                <Text style={styles.emptyStateTitle}>
                  {emptyMessage
                    ? emptyMessage
                    : searchQuery.trim() !== ''
                      ? searchQuery.length <= 2
                        ? 'Type more to search...'
                        : `No results for "${searchQuery}"`
                      : 'No vendors available in your area'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {searchQuery.trim() !== '' && searchQuery.length > 2
                    ? 'Try searching for: dry wash, laundry, ironing, etc.'
                    : 'Check back later or try a different location'
                  }
                </Text>

                {searchQuery.trim() !== '' && searchQuery.length > 2 && (
                  <TouchableOpacity
                    style={styles.suggestSearchButton}
                    onPress={() => setSearchQuery('dry wash')}
                  >
                    <Text style={[styles.suggestSearchText, { color: "white" }]}>Try "dry wash"</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          <FilterModal
            visible={showFilters}
            onClose={() => setShowFilters(false)}
            onApplyFilters={applyFilters}
            initialSelectedServices={selectedServices}
            onResetFilters={handleResetFilters}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default LaundryServiceList;