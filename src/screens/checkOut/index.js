import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import ArrowIcon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScheduleModal } from '../../otherComponent/checkout/scheduleModal';
import ConfirmationModal from '../../otherComponent/checkout/confirmationModal';
import EmptyCart from '../../otherComponent/checkout/emptyCart';
import OrderItem from '../../otherComponent/checkout/OrderItem';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import styles
import { styles } from './styles';
import Header from '../../components/header';
import appColors from '../../theme/appColors';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  decrementQty,
  incrementQty,
  removeFromCart,
} from '../../redux/slices/cartSlice';
import { CustomTooltip } from '../../components/tooltip';
import { getAddresses, setSelectedAddress } from '../../redux/slices/addressSlice';
import { placeOrder } from '../../redux/slices/orderSlice';
import { getCustomerDetails } from '../../redux/slices/customerSlice';
import { useToast } from '../../utils/context/toastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearVendors, getNearbyVendors } from '../../redux/slices/nearByVendor';

const TEMP_VENDOR_KEY = 'TEMP_CHECKOUT_VENDOR';

const LaundryCheckoutScreen = ({ navigation, route }) => {
  const scrollRef = useRef(null);
  const contactRef = useRef(null);
  const { showToast } = useToast();
  const [finalVendorId, setFinalVendorId] = useState(null);
  const { laundryName, vendorId } = route.params || {};
  const dispatch = useDispatch();
  const { addresses, selectedAddress } = useSelector(
    state => state.address
  );
  const { customerData } = useSelector(state => state.customer);
  const cartItems = useSelector(state => state.cart.items);
  const [isContactActive, setIsContactActive] = useState(false);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [orderConfirmVisible, setOrderConfirmVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [fullName, setFullName] = useState(customerData?.name || '');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const getLast10Digits = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(-10);
  };
  const [contactNumber, setContactNumber] = useState(
    getLast10Digits(customerData?.phone)
  );
  const shouldShowContactDetails = useMemo(() => {
    return isContactActive || !!selectedPickupSlot;
  }, [isContactActive, selectedPickupSlot]);

  const [selectedDropDate, setSelectedDropDate] = useState(null);
  const [selectedDropSlot, setSelectedDropSlot] = useState(null);

  const [selectedPickupDate, setSelectedPickupDate] = useState(new Date());
  const [selectedPickupSlot, setSelectedPickupSlot] = useState(null);
  const [orderNote, setOrderNote] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);


  const { vendors, vendorsLoading } = useSelector(
    state => state.nearByVendor
  );

  const isVendorAvailable = useMemo(() => {
    if (!finalVendorId) return false;
    return vendors?.some(v => v.id === finalVendorId);
  }, [vendors, finalVendorId]);

  console.log("customerData in checkout screen", vendorId);

  const effectiveAddress = useMemo(() => {
    if (selectedAddress && typeof selectedAddress === 'object') {
      return selectedAddress;
    }

    // 2️⃣ Agar selectedAddress null hai → default address dikhao
    const defaultAddr = addresses?.find(a => a.isDefault);

    if (defaultAddr) {
      return defaultAddr;
    }

    // 3️⃣ Kuch bhi nahi mila
    return null;
  }, [addresses, selectedAddress]);


  console.log("effectiveAddress", effectiveAddress);

  const timeSlots = [
    { id: '1', time: '09:00 AM - 11:00 AM' },
    { id: '2', time: '11:00 AM - 01:00 PM' },
    { id: '3', time: '01:00 PM - 03:00 PM' },
    { id: '4', time: '03:00 PM - 05:00 PM' },
    { id: '5', time: '05:00 PM - 07:00 PM' },
    { id: '6', time: '07:00 PM - 09:00 PM' },
  ];

  // Helper function to format cart items for display
  // Update formatCartItemsForDisplay function
  const formatCartItemsForDisplay = useMemo(() => {
    if (!cartItems || typeof cartItems !== 'object') return [];

    console.log("🛒 Raw cart items:", cartItems);
    console.log("🔑 Cart item keys:", Object.keys(cartItems));

    // Convert cart items object to array for display
    const cartItemsArray = Object.values(cartItems);

    // Format for display in OrderItem components
    const formattedItems = cartItemsArray.map((item, index) => {

      const cartKeys = Object.keys(cartItems);
      const uniqueKey = cartKeys[index];

      return {
        id: uniqueKey, // Use the actual Redux key as ID
        uniqueKey: uniqueKey, // Pass the actual Redux key
        name: item.name || item.itemName || item.itemId || 'Unknown Item',
        price: item.price || 0,
        service: item.service || 'Unknown Service',
        quantity: item.qty || 0,
        category: item.category || 'general',
        itemId: item.itemId, // Original item ID
        serviceName: item.service // Service name
      };
    });

    console.log("📦 Formatted display items with keys:", formattedItems.map(item => item.uniqueKey));
    return formattedItems;
  }, [cartItems]);

  // Helper function to format cart items for API
  const formatCartItemsForAPI = useMemo(() => {
    if (!cartItems || typeof cartItems !== 'object') return [];

    const cartItemsArray = Object.values(cartItems);

    // Format for API payload
    const apiFormattedItems = cartItemsArray.map(item => ({
      item: item.name || item.itemName || item.itemId, // Item name
      category: item.category || 'general',
      service: item.service, // Service name
      quantity: item.qty,    // Quantity
      price: item.price      // Price per item
    }));

    console.log("📡 API formatted items:", apiFormattedItems);
    return apiFormattedItems;
  }, [cartItems]);

  // Calculate delivery date based on pickup date (2 days later)
  const calculateDeliveryDate = pickupDate => {
    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    return deliveryDate;
  };

  // Update delivery date when pickup date changes

  useEffect(() => {
    if (vendorId) {
      setFinalVendorId(vendorId);
      AsyncStorage.setItem(TEMP_VENDOR_KEY, vendorId);
    }
  }, [vendorId]);

  useEffect(() => {
    const loadVendorFromStorage = async () => {
      if (!vendorId) {
        const storedVendor = await AsyncStorage.getItem(TEMP_VENDOR_KEY);
        if (storedVendor) {
          setFinalVendorId(storedVendor);
        }
      }
    };

    loadVendorFromStorage();
  }, []);

  useEffect(() => {
    dispatch(getAddresses());
    dispatch(getCustomerDetails());
  }, []);

  useEffect(() => {
    if (!effectiveAddress?.location?.coordinates?.coordinates) return;

    const [lng, lat] = effectiveAddress.location.coordinates.coordinates;

    dispatch(clearVendors());
    dispatch(getNearbyVendors({ lng, lat }));
  }, [effectiveAddress]);

  useEffect(() => {
    if (customerData?.name && !fullName) {
      setFullName(customerData.name);
    }

    if (customerData?.phone) {
      setContactNumber(getLast10Digits(customerData.phone));
    }

  }, [customerData]);

  useEffect(() => {
    // Default address
    // if (!selectedAddress && addresses?.length) {
    //   const defaultAddr =
    //     addresses.find(a => a.isDefault) || addresses[0];
    //   dispatch(setSelectedAddress(defaultAddr));
    // }

    // Pickup → Delivery calculation
    if (selectedPickupDate && selectedPickupSlot) {
      const newDeliveryDate = calculateDeliveryDate(selectedPickupDate);
      setSelectedDropDate(newDeliveryDate);
      setSelectedDropSlot(timeSlots[2]);
    } else {
      setSelectedDropDate(null);
      setSelectedDropSlot(null);
    }

    // Auto show + scroll contact details
    if (selectedPickupSlot) {
      setIsContactActive(true);
      setTimeout(() => focusOnContactDetails(), 200);
    }

  }, [
    addresses,
    selectedAddress,
    selectedPickupDate,
    selectedPickupSlot,
    customerData
  ]);


  useEffect(() => {
    if (isContactActive && contactRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: contactRef.current - 30,
        animated: true,
      });
    }
  }, [isContactActive]);


  // Load addresses from AsyncStorage and current location
  // useEffect(() => {
  //   loadAddresses();
  //   loadCurrentLocation();
  // }, []);

  // Debug cart state
  useEffect(() => {
    console.log("📊 Cart state update:", {
      totalItems: Object.keys(cartItems || {}).length,
      formattedItems: formatCartItemsForDisplay,
      apiItems: formatCartItemsForAPI
    });
  }, [cartItems, formatCartItemsForDisplay, formatCartItemsForAPI]);

  // const loadAddresses = async () => {
  //   try {
  //     const savedAddresses = await AsyncStorage.getItem('userAddresses');
  //     if (savedAddresses) {
  //       const addressesData = JSON.parse(savedAddresses);
  //       setAddresses(addressesData);

  //       const defaultAddress = addressesData.find(addr => addr.isDefault);
  //       if (defaultAddress) {
  //         setSelectedAddress(defaultAddress);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error loading addresses:', error);
  //   }
  // };

  // const loadCurrentLocation = async () => {
  //   try {
  //     const currentLocation = await AsyncStorage.getItem('currentLocation');
  //     if (currentLocation) {
  //       const locationData = JSON.parse(currentLocation);

  //       const currentLocationAddress = {
  //         id: 'current',
  //         name: 'Current Location',
  //         address: locationData.address,
  //         isCurrent: true,
  //         isDefault: !selectedAddress,
  //       };

  //       setAddresses(prev => {
  //         const exists = prev.find(addr => addr.id === 'current');
  //         if (!exists) {
  //           return [currentLocationAddress, ...prev];
  //         }
  //         return prev;
  //       });

  //       if (!selectedAddress) {
  //         setSelectedAddress(currentLocationAddress);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error loading current location:', error);
  //   }
  // };

  const updateQuantity = (uniqueKey, change) => {
    console.log("🔄 Updating quantity:", { uniqueKey, change });

    if (change === 1) {
      dispatch(incrementQty(uniqueKey)); // Pass the actual Redux key
    } else {
      dispatch(decrementQty(uniqueKey)); // Pass the actual Redux key
    }
  };

  const removeItem = uniqueKey => {
    console.log("🗑️ Removing item with key:", uniqueKey);
    dispatch(removeFromCart(uniqueKey));
  };

  const confirmClearCart = () => {
    dispatch(clearCart());
    setConfirmationModalVisible(false);
  };

  // Calculate totals
  const { subtotal, total } = useMemo(() => {
    let calculatedSubtotal = 0;

    if (cartItems && typeof cartItems === 'object') {
      Object.values(cartItems).forEach(item => {
        calculatedSubtotal += (item.price || 0) * (item.qty || 0);
      });
    }

    return {
      subtotal: calculatedSubtotal.toFixed(2),
      total: calculatedSubtotal.toFixed(2) // No delivery fee for now
    };
  }, [cartItems]);

  const totals = {
    subtotal: subtotal,
    total: total,
  };

  const handlePlaceOrderNow = () => {
    const apiFormattedItems = formatCartItemsForAPI;

    if (apiFormattedItems.length === 0) {
      setTooltipText('Your cart is empty. Please add items first.');
      setTooltipVisible(true);
      return;
    }

    if (!selectedAddress || !selectedAddress._id) {
      showToast('Please select a delivery address', 'error');

      setTimeout(() => {
        navigation.navigate('Main', {
          screen: 'ManageAddress',
          params: { from: 'checkout' },
        });
      }, 800);

      return;
    }

    setSelectedDeliveryType('now'); // ⭐ highlight this option

    const now = new Date();
    setSelectedPickupDate(now);

    const currentHour = now.getHours();
    let closestSlot = timeSlots[0];

    for (const slot of timeSlots) {
      const slotStartHour = parseInt(slot.time.split(':')[0]);
      if (slotStartHour >= currentHour) {
        closestSlot = slot;
        break;
      }
    }

    setSelectedPickupSlot(closestSlot);
  };


  const handleContactFocus = (field) => {
    setFocusedField(field);
    setIsContactActive(true);
  };


  const handleContactBlur = () => {
    setFocusedField(null);
  };


  const handleBrowseServices = () => {
    navigation.navigate('Main');
  };

  const focusOnContactDetails = () => {
    if (scrollRef.current && contactRef.current !== null) {
      scrollRef.current.scrollTo({
        y: contactRef.current - 20,
        animated: true,
      });
    }
  };

  const isCartEmpty = formatCartItemsForDisplay.length === 0;

  const confirmOrder = async () => {
    setOrderConfirmVisible(false);

    if (!selectedAddress || !selectedAddress._id) {
      setTooltipText('Please select a delivery address');
      setTooltipVisible(true);
      return;
    }

    if (!fullName || !contactNumber) {
      setTooltipText('Please enter your name and mobile number');
      setTooltipVisible(true);
      return;
    }

    if (!finalVendorId) {
      showToast('Vendor not found. Please reselect laundry.', 'error');
      navigation.navigate('Main');
      return;
    }

    const orderPayload = {
      vendorId: finalVendorId,
      items: formatCartItemsForAPI,
      pickupDate: selectedPickupDate.toISOString().split('T')[0],
      pickupTime: selectedPickupSlot?.time || '',
      deliveryDate: selectedDropDate?.toISOString().split('T')[0],
      deliveryTime: selectedDropSlot?.time || timeSlots[2]?.time || '',
      instructions: orderNote,
      totalPrice: parseFloat(total),
      addressId: effectiveAddress._id,
      contactDetails: {
        fullName: fullName,
        mobile: contactNumber.startsWith('+91') ? contactNumber : `+91${contactNumber}`,
      },
    };


    console.log('📦 FINAL ORDER PAYLOAD:', orderPayload);

    try {
      const result = await dispatch(placeOrder(orderPayload)).unwrap();
      dispatch(clearCart());
      await AsyncStorage.removeItem(TEMP_VENDOR_KEY);
      navigation.replace('OrderConfirmation', { orderData: result });
    } catch (error) {
      console.error('❌ Place order failed:', error);
      setTooltipText('Failed to place order. Please try again.');
      setTooltipVisible(true);
    }
  };

  const handleContinuePress = () => {
    if (!selectedPickupSlot) {
      setTooltipText("Please schedule a delivery or click on order now to proceed.");
      setTooltipVisible(true);
      return;
    }
    setOrderConfirmVisible(true);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: appColors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={{ backgroundColor: appColors.darkBlue }}>
            <Header
              onBackPress={() => {
                if (showScheduleOptions) {
                  setShowScheduleOptions(false);
                } else {
                  navigation.goBack();
                }
              }}
              iconColor={appColors.white}
              title={'Cart'}
              titleStyle={styles.titleStyle}
              containerStyle={{ justifyContent: 'flex-start' }}
            />
          </View>
          <View style={styles.border} />

          {isCartEmpty ? (
            <EmptyCart onBrowseServices={handleBrowseServices} />
          ) : (
            <>
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.contentContainerStyle}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.section, { marginTop: 10 }]}>
                  <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    Delivery Options
                  </Text>

                  <View>
                    <TouchableOpacity
                      style={[styles.deliveryOption, styles.primaryOption]}
                      onPress={() => setPickupModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Icon name="schedule" size={20} color={appColors.blue} />

                      <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Schedule Pickup</Text>
                        <Text
                          style={[
                            styles.optionSubtitle,
                            selectedPickupSlot && styles.optionSubtitleActive,
                          ]}
                        >
                          {selectedPickupSlot
                            ? `${selectedPickupDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}, ${selectedPickupSlot.time}`
                            : 'Choose date and time for pickup'}
                        </Text>

                      </View>

                      <Icon name="chevron-right" size={20} color={appColors.blue} />
                    </TouchableOpacity>
                    {/* {selectedPickupSlot && (
                      <View style={[styles.deliveryOption, styles.deliveryCard]}>
                        <ArrowIcon
                          name="arrow-down-left"
                          size={20}
                          color={appColors.blue}
                        />

                        <View style={styles.optionTextContainer}>
                          <Text style={styles.optionTitle}>Expected Delivery </Text>

                          <Text style={styles.optionSubtitle}>
                            {selectedDropDate
                              ? `${selectedDropDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })} · Estimated delivery in 2–3 days`
                              : 'Calculating delivery date'}
                          </Text>
                        </View>
                      </View>
                    )} */}
                    <TouchableOpacity
                      style={[
                        styles.deliveryOption,
                        selectedDeliveryType === 'now' && styles.selectedOption
                      ]}
                      onPress={handlePlaceOrderNow}
                    >
                      <Icon
                        name="shopping-cart-checkout"
                        size={20}
                        color={selectedDeliveryType === 'now' ? 'green' : appColors.darkBlue}
                      />

                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionTitle,
                            selectedDeliveryType === 'now' && styles.selectedText
                          ]}
                        >
                          Place Order Now
                        </Text>

                        <Text
                          style={[
                            styles.optionSubtitle,
                            selectedDeliveryType === 'now' && styles.selectedText
                          ]}
                        >
                          We'll pickup as soon as possible
                        </Text>
                      </View>
                    </TouchableOpacity>

                  </View>
                </View>

                <View style={styles.addressCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    {effectiveAddress ? (
                      <View style={styles.addressRow}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={appColors.darkBlue}
                          style={{ marginTop: 5 }}
                        />
                        <View>
                          <Text numberOfLines={2} style={styles.addressText}>
                            {effectiveAddress.addressLine1} {effectiveAddress.city} {effectiveAddress.state} {effectiveAddress.pincode}
                          </Text>
                          {vendorsLoading ? (
                            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                              <ActivityIndicator size="small" color={appColors.darkBlue} />
                              <Text style={{ marginLeft: 8, fontSize: 13, color: appColors.darkBlue }}>
                                Checking service availability...
                              </Text>
                            </View>
                          ) : (
                            effectiveAddress && !isVendorAvailable && (
                              <Text style={{ color: 'red', marginTop: 6, fontSize: 13 }}>
                                This laundry is unavailable for the selected address.
                              </Text>
                            )
                          )}

                        </View>

                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addAddressBtn}
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate('ManageAddress', {
                            from: 'checkout',
                          })
                        }
                      >
                        <Ionicons name="add-circle-outline" size={18} color={appColors.darkBlue} />
                        <Text style={styles.addAddressText}>Add Delivery Address</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {effectiveAddress && (
                    <TouchableOpacity
                      style={styles.changeBtn}
                      onPress={() =>
                        navigation.navigate('ManageAddress', {
                          from: 'checkout',
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.section, { paddingVertical: 4 }]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={[styles.sectionTitle, { marginHorizontal: 10 }]}>
                      Order Items ({formatCartItemsForDisplay.length})
                    </Text>
                    <TouchableOpacity
                      onPress={confirmClearCart}
                      style={styles.clearAllButton}
                    >
                      <Icon name="delete" size={18} color="#e53935" />
                    </TouchableOpacity>
                  </View>

                  {formatCartItemsForDisplay.map(item => (
                    <OrderItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={(change) => updateQuantity(item.uniqueKey, change)}
                      onRemoveItem={() => removeItem(item.uniqueKey)}
                      category={item.category}
                    />
                  ))}
                </View>

                {shouldShowContactDetails && (
                  <View style={[styles.section, { marginHorizontal: 10 }]}>
                    <Text style={styles.contactTitle}>Contact Details</Text>
                    <View
                      ref={contactRef}
                      onLayout={(e) => {
                        contactRef.current = e.nativeEvent.layout.y;
                      }}
                      style={styles.contactCard}
                    >
                      {/* Full Name */}
                      <View
                        style={[
                          // styles.inputWrapper,
                          focusedField === 'name' && styles.inputFocused,
                        ]}
                      >
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter your full name"
                          value={fullName}
                          onChangeText={setFullName}
                          onFocus={() => handleContactFocus('name')}
                          onBlur={handleContactBlur}
                          returnKeyType="next"
                          placeholderTextColor="#999"
                        />
                      </View>

                      {/* Contact Number */}
                      <View
                        style={[
                          // styles.inputWrapper,
                          focusedField === 'phone' && styles.inputFocused,
                        ]}
                      >
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter mobile number"
                          value={contactNumber}
                          onChangeText={setContactNumber}
                          keyboardType="phone-pad"
                          maxLength={10}
                          onFocus={() => handleContactFocus('phone')}
                          onBlur={handleContactBlur}
                          placeholderTextColor="#999"
                        />
                      </View>

                      {/* <View
                        style={[
                          // styles.inputWrapper,
                          focusedField === 'email' && styles.inputFocused,
                        ]}
                      >
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter Your Email (Optional) "
                          value={Email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          onFocus={() => handleContactFocus('email')}
                          onBlur={handleContactBlur}
                          placeholderTextColor="#999"
                        />
                      </View> */}

                      {/* Instructions */}
                      <View
                        style={[
                          // styles.inputWrapper,
                          focusedField === 'note' && styles.inputFocused,
                        ]}
                      >
                        <TextInput
                          style={[styles.textInput]}
                          placeholder="Add Instructions (Optional)"
                          value={orderNote}
                          onChangeText={setOrderNote}
                          multiline
                          onFocus={() => handleContactFocus('note')}
                          onBlur={handleContactBlur}
                          // textAlignVertical="top"
                          placeholderTextColor="#888"
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.horizontalBorder} />
              </ScrollView>
              <View>
                <View
                  style={[styles.section, { marginHorizontal: 10 }]}
                >
                  <View style={[styles.priceRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      ₹{totals.total}
                    </Text>
                  </View>
                </View>

                {!isCartEmpty && (
                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={[
                        styles.payButton,
                        (!isVendorAvailable || isCartEmpty || vendorsLoading) && { opacity: 0.5 }
                      ]}
                      disabled={!isVendorAvailable || isCartEmpty || vendorsLoading}
                      onPress={handleContinuePress}
                    >
                      <Text style={styles.payButtonText}>
                        {vendorsLoading ? 'Please wait...' : 'Continue'}
                      </Text>
                    </TouchableOpacity>

                  </View>
                )}
              </View>
            </>
          )}

          <ScheduleModal
            visible={pickupModalVisible}
            onClose={() => setPickupModalVisible(false)}
            type="pickup"
            selectedDate={selectedPickupDate}
            onDateChange={setSelectedPickupDate}
            selectedSlot={selectedPickupSlot}
            onSlotSelect={setSelectedPickupSlot}
            timeSlots={timeSlots}
            minDate={new Date()}
          />
          <ConfirmationModal
            visible={orderConfirmVisible}
            onClose={() => setOrderConfirmVisible(false)}
            onConfirm={confirmOrder}
            title="Confirm Order"
            message="Do you want to confirm your order?"
          />
          <CustomTooltip
            visible={tooltipVisible}
            message={tooltipText}
            onClose={() => setTooltipVisible(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LaundryCheckoutScreen;