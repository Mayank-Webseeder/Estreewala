import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import ProductItem from './productItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import { styles } from './styles';
import fonts from '../../../theme/appFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import appColors from '../../../theme/appColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { windowHeight } from '../../../theme/appConstant';
import FilterIcon from '../../../assets/Icons/svg/filter';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorCatalog } from '../../../redux/slices/nearByVendor';
import {
  addToCart,
  changeService,
  decrementQty,
  incrementQty,
} from '../../../redux/slices/cartSlice';
import { clearCart } from '../../../redux/slices/cartSlice';
import { transformCatalogData } from "../../../utils/data/imageMapping"
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LaundryScreen({ navigation, route }) {
  const { title, vendorId, address } = route.params || {};
  const dispatch = useDispatch();

  // console.log("🎯 VENDOR ID RECEIVED:", vendorId, address);

  const cart = useSelector(state => state.cart.items);
  const { vendorCatalog, vendorCatalogLoading, vendorCatalogError } =
    useSelector(state => state.nearByVendor);


  // const parts = address?.split(',').map(s => s.trim());
  // const area = parts?.length > 1 ? parts[1] : parts[0];

  console.log("📦 vendor catalog raw data:", vendorCatalog);

  // ✅ FIX: Better data transformation with comprehensive logging
  const transformedCatalog = React.useMemo(() => {
    if (!vendorCatalog?.catalog) {
      console.log("📭 No catalog data available yet");
      return {};
    }

    console.log("🔄 Starting catalog transformation...");
    const transformed = transformCatalogData(vendorCatalog.catalog);

    console.log("✅ Transformed catalog structure:", {
      keys: Object.keys(transformed),
      hasData: Object.keys(transformed).length > 0,
      sample: Object.keys(transformed).length > 0 ? transformed[Object.keys(transformed)[0]] : 'No data'
    });

    return transformed;
  }, [vendorCatalog]);

  const catalog = transformedCatalog || {};

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  useEffect(() => {
    if (vendorId) {
      console.log("🔄 Fetching catalog for vendor:", vendorId);
      dispatch(getVendorCatalog(vendorId));
    }
  }, [vendorId, dispatch]);

  const [category, setCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const filterIconRef = useRef(null);
  const insets = useSafeAreaInsets();


  // ✅ UPDATED: Calculate totals with new cart structure
  const cartItems = Object.values(cart); // Use Object.values instead of Object.keys
  const totalItems = cartItems.reduce((sum, it) => sum + it.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.qty);
  }, 0);

  // ✅ FIX: Get ALL service categories with better error handling
  const serviceCategories = Object.keys(catalog);
  console.log("🔧 Available service categories:", serviceCategories);

  // ✅ FIX: Set selected service category only when categories are available
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('');

  useEffect(() => {
    if (serviceCategories.length > 0 && !selectedServiceCategory) {
      console.log("🎯 Setting initial service category:", serviceCategories[0]);
      setSelectedServiceCategory(serviceCategories[0]);
    }
  }, [serviceCategories, selectedServiceCategory]);

  console.log("🎯 Current selectedServiceCategory:", selectedServiceCategory);

  // ✅ UPDATED: Change selectedService to support multiple services per item
  const [selectedServices, setSelectedServices] = useState({}); // { [itemId]: [service1, service2, ...] }

  // Generate unique key for item + category
  const getItemCategoryKey = (itemId, category) => {
    const cleanItemName = itemId.split('_')[0]; // ✅ Clean it
    return `${cleanItemName}_${category}`;
  };

  // ✅ FIX: Build dynamic CATEGORIES with better empty state handling
  const availableCategoryKeys = React.useMemo(() => {
    const categorySet = new Set();

    Object.values(catalog).forEach(serviceData => {
      Object.keys(serviceData || {}).forEach(catKey => {
        categorySet.add(catKey);
      });
    });

    return Array.from(categorySet);
  }, [catalog]);

  console.log("👕 Available category keys:", availableCategoryKeys);

  const dynamicCategories = [
    { label: 'All', value: 'all' },
    ...availableCategoryKeys.map(k => ({
      label:
        k === 'man'
          ? "Men's Wear"
          : k === 'woman'
            ? "Women's Wear"
            : k === 'kids'
              ? 'Kids Wear'
              : k.charAt(0).toUpperCase() + k.slice(1), // Capitalize first letter
      value: k,
    })),
  ];

  console.log("🏷️ Dynamic categories:", dynamicCategories);

  const selectedProducts = React.useMemo(() => {
    if (!catalog || Object.keys(catalog).length === 0) return [];

    const productMap = {}; // key = item + category

    Object.keys(catalog).forEach(serviceName => {
      const serviceData = catalog[serviceName] || {};

      Object.keys(serviceData).forEach(catKey => {
        // 🔴 FILTER APPLY HERE
        if (category !== 'all' && category !== catKey) {
          return;
        }

        const items = serviceData[catKey] || [];

        items.forEach(item => {
          const key = `${item.item}_${catKey}`;

          if (!productMap[key]) {
            productMap[key] = {
              ...item,
              category: catKey,
              services: {},
            };
          }

          // Store price per service
          productMap[key].services[serviceName] = item.price;
        });
      });
    });

    const result = Object.values(productMap);
    console.log("✅ FILTERED PRODUCTS:", result);
    return result;
  }, [catalog, category]); // 👈 category dependency MUST

  const dynamicServices = serviceCategories?.map(s => ({
    label: s,
    value: s,
  }));

  console.log("🔄 Dynamic services:", dynamicServices);

  useEffect(() => {
    if (Object.keys(catalog).length > 0) {
      console.log("=== CATALOG STRUCTURE DEBUG ===");
      Object.keys(catalog).forEach(serviceKey => {
        console.log(`Service: ${serviceKey}`, {
          categories: Object.keys(catalog[serviceKey] || {}),
          totalProducts: Object.values(catalog[serviceKey] || {}).flat().length
        });
      });
      console.log("=== END DEBUG ===");
    }
  }, [catalog]);

  // ✅ FIXED: useCallback to prevent unnecessary re-renders
  // ✅ FIXED: useCallback to prevent unnecessary re-renders - MAKE IT CATEGORY-SPECIFIC
  const getPriceForServiceAndItem = useCallback((serviceName, itemName, category) => {
    console.log('🔍 Looking up price:', { serviceName, itemName, category });

    if (!catalog[serviceName] || !catalog[serviceName][category]) {
      console.log('❌ Service or category not found in catalog:', serviceName, category);
      return 0;
    }

    const categoryItems = catalog[serviceName][category];
    console.log('📊 Items in category', category, ':', categoryItems.map(i => i.item));

    // ✅ FIXED: Exact match with category filtering
    const item = categoryItems.find(product => {
      // Compare item names (case insensitive)
      const nameMatch = product.item.toLowerCase() === itemName.toLowerCase();
      console.log(`🔎 Checking "${product.item}" vs "${itemName}": ${nameMatch}`);
      return nameMatch;
    });

    if (!item) {
      console.log('❌ Item not found in category:', itemName, 'in category:', category);

      // Debug: Check if item exists in wrong category
      Object.keys(catalog[serviceName] || {}).forEach(cat => {
        if (cat !== category) {
          const wrongCatItems = catalog[serviceName][cat] || [];
          const foundInWrongCat = wrongCatItems.find(p =>
            p.item.toLowerCase() === itemName.toLowerCase()
          );
          if (foundInWrongCat) {
            console.log(`⚠️ Item found in WRONG category ${cat}: ${foundInWrongCat.price}`);
          }
        }
      });

      return 0;
    }

    console.log('✅ Price found for', itemName, 'in category', category, ':', item.price);
    return item.price;
  }, [catalog]);

  const handleFilterPress = () => {
    if (filterIconRef.current) {
      filterIconRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 5,
          left: x + width - 160,
        });
        setShowDropdown(true);
      });
    }
  };


  const handleAdd = useCallback((product, service) => {
    const price = getPriceForServiceAndItem(
      service,
      product.item,
      product.category
    );

    console.log('🛒 Adding to cart with category:', {
      item: product.item,
      service: service,
      category: product.category,
      price: price
    });

    dispatch(
      addToCart({
        id: product.item, // ✅ Keep clean item name (backend requirement)
        service: service,
        price: price,
        name: product.item,
        image: product.image,
        category: product.category // ✅ But store category separately
      }),
    );
  }, [getPriceForServiceAndItem, dispatch]);

  // ✅ UPDATED: Handle increment for specific service
  const handleIncrement = useCallback((itemId, service, category) => {
    // ✅ Create unique key with category: "T Shirt_man_Washing"
    const uniqueKey = `${itemId}_${category}_${service}`;
    console.log("🔼 Incrementing with category-key:", uniqueKey);
    dispatch(incrementQty(uniqueKey));
  }, [dispatch]);

  const handleDecrement = useCallback((itemId, service, category) => {
    // ✅ Create unique key with category: "T Shirt_man_Washing"
    const uniqueKey = `${itemId}_${category}_${service}`;
    console.log("🔽 Decrementing with category-key:", uniqueKey);
    dispatch(decrementQty(uniqueKey));
  }, [dispatch]);
  // ✅ UPDATED: Handle service change (add/remove service)

  // ✅ UPDATED: Handle service change with better sync
  const handleChangeService = useCallback((itemId, serviceValue, category) => {
    console.log(`🟢 Changing service for ${itemId} in category ${category} → ${serviceValue}`);

    const itemCategoryKey = getItemCategoryKey(itemId, category);

    setSelectedServices(prev => {
      const currentServices = prev[itemCategoryKey] || [];

      // Check if service already exists for this item in this category
      const serviceExists = currentServices.includes(serviceValue);

      let newServices;
      if (serviceExists) {
        // Remove the service
        newServices = currentServices.filter(s => s !== serviceValue);

        // Find if this service is in cart and remove it
        const cartItem = cartItems.find(item =>
          getItemCategoryKey(item.itemId, item.category) === itemCategoryKey &&
          item.service === serviceValue
        );

        if (cartItem) {
          // Remove from cart via decrement
          const uniqueKey = `${itemId}_${category}_${serviceValue}`;
          dispatch(decrementQty(uniqueKey));
        }
      } else {
        // Add the service
        newServices = [...currentServices, serviceValue];
      }

      return {
        ...prev,
        [itemCategoryKey]: newServices
      };
    });
  }, [dispatch, cartItems]); // Add cartItems as dependency


  const handleCategorySelect = value => {
    console.log("🎯 Category selected:", value);
    setCategory(value);
    setShowDropdown(false);
  };


  useEffect(() => {
    // Create a new selectedServices map based on cart items
    const newSelectedServices = {};

    cartItems.forEach(cartItem => {
      const itemId = cartItem.itemId; // This is the clean item name
      const category = cartItem.category;
      const service = cartItem.service;

      // Only include items with quantity > 0
      if (cartItem.qty > 0) {
        const itemCategoryKey = getItemCategoryKey(itemId, category);

        if (!newSelectedServices[itemCategoryKey]) {
          newSelectedServices[itemCategoryKey] = [];
        }

        // Add service if not already included
        if (!newSelectedServices[itemCategoryKey].includes(service)) {
          newSelectedServices[itemCategoryKey].push(service);
        }
      }
    });

    // Compare and update if different
    if (JSON.stringify(newSelectedServices) !== JSON.stringify(selectedServices)) {
      console.log("🔄 Syncing selectedServices with cart:", newSelectedServices);
      setSelectedServices(newSelectedServices);
    }
  }, [cartItems]); // Run whenever cartItems changes


  // ✅ FIXED: Get cart items for a specific item IN SPECIFIC CATEGORY
  const getCartItemsForItem = useCallback((itemId, itemCategory) => {
    return cartItems.filter(item => {
      // Match by itemId AND category
      return item.itemId === itemId && item.category === itemCategory;
    });
  }, [cartItems]);



  // Update the renderProductItem function:
  const renderProductItem = useCallback(({ item }) => {
    const itemCategoryKey = getItemCategoryKey(item.item, item.category);
    const itemServices = selectedServices[itemCategoryKey] || [];

    const cartItemsForThisItem = getCartItemsForItem(item.item, item.category);

    const availableServicesForItem = dynamicServices.filter(
      s => item.services?.[s.value] > 0
    );

    return (
      <ProductItem
        product={{
          id: item.item,
          name: item.item,
          image: item.image,
          category: item.category
        }}
        selectedServices={itemServices}
        cartItems={cartItemsForThisItem}
        services={availableServicesForItem}
        onAdd={(service) => handleAdd(item, service)}
        onIncrement={(service) =>
          handleIncrement(item.item, service, item.category)
        }
        onDecrement={(service) =>
          handleDecrement(item.item, service, item.category)
        }
        onChangeService={(itemId, serviceValue) => {
          handleChangeService(itemId, serviceValue, item.category);
        }}
      />
    );
  }, [
    selectedServices,
    getCartItemsForItem,
    dynamicServices,
    handleAdd,
    handleIncrement,
    handleDecrement,
    handleChangeService
  ]);


  // ✅ FIX: Improved loading and empty states (NO CHANGES NEEDED)
  const renderContent = () => {
    if (vendorCatalogLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.darkBlue} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    if (vendorCatalogError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{vendorCatalogError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => vendorId && dispatch(getVendorCatalog(vendorId))}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ✅ NEW: Handle vendor with no active subscription
    if (vendorCatalog?.message && vendorCatalog.message.includes("no active subscription")) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="error-outline" size={50} color={appColors.darkBlue} />
          <Text style={[styles.emptyText, { marginTop: 10 }]}>
            {vendorCatalog.message}
          </Text>
        </View>
      );
    }


    // ✅ FIX: Show empty state only when catalog is loaded but no products
    if (!vendorCatalogLoading && selectedProducts.length === 0 && Object.keys(catalog).length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="inventory" size={50} color={appColors.lightGray} />
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      );
    }

    // ✅ FIX: Show initial loading while waiting for service category to be set
    if (!selectedServiceCategory && Object.keys(catalog).length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.darkBlue} />
          <Text style={styles.loadingText}>Preparing products...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={selectedProducts}
        keyExtractor={(item) => `${item.item}_${item.category}`}
        renderItem={renderProductItem}
        contentContainerStyle={{ paddingBottom: windowHeight(80) }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          backgroundColor: appColors.darkBlue,
          paddingBottom: 5,
          marginBottom: 20,
        }}
      >
        <Header
          iconColor={appColors.white}
          title={vendorCatalog?.vendor?.businessName || title || 'Laundry'}
          titleStyle={{ color: appColors.white }}
          containerStyle={{ paddingVertical: 10 }}
          onBackPress={() => navigation.goBack()}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 5
          }}
        >
          <View style={{ paddingRight: 50 }}>
            <View style={styles.header}>
              {/* <Text style={styles.title}>
                {vendorCatalog?.vendor?.businessName || title || 'Laundry'}
              </Text> */}
              <View style={{ flexDirection: 'row', alignItems: "flex-end", alignItems: "center" }}>
                <Ionicons name="location-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.sub}>{address}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            ref={filterIconRef}
            style={styles.filterButton}
            onPress={handleFilterPress}
            activeOpacity={0.7}
          >
            <FilterIcon size={20} color={appColors.darkBlue} />
          </TouchableOpacity>
        </View>
        <View style={styles.dashedLine} />
        {/* <View style={styles.metaRow}>
          <Text style={styles.meta}>⭐ 4.0</Text>
          <Text style={styles.meta}>🕒 9 AM - 11 PM</Text>
        </View> */}
      </View>

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.dropdownContainer,
            { top: dropdownPosition.top, left: dropdownPosition.left },
          ]}
        >
          {dynamicCategories.map((cat, index) => (
            <View key={cat.value}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  category === cat.value && styles.dropdownItemSelected,
                ]}
                onPress={() => handleCategorySelect(cat.value)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    category === cat.value && styles.dropdownItemTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
              {index < dynamicCategories.length - 1 && (
                <View style={styles.dropdownDivider} />
              )}
            </View>
          ))}
        </View>
      </Modal>

      {renderContent()}

      {/* Bottom Cart Bar */}
      {totalItems > 0 && (
        <View style={[styles.cartBar, { marginBottom: insets.bottom || -4 }]}>
          <View>
            <Text style={styles.cartTitle}>
              {totalItems} Item{totalItems > 1 ? 's' : ''} •{' '}
              <Text style={{ fontFamily: fonts.InterRegular }}>
                <Icon name="currency-rupee" size={13} color={appColors.white} />
              </Text>
              {totalPrice.toFixed(2)}
            </Text>
            <Text style={styles.cartSub}>Extra charges may apply</Text>
          </View>

          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("LaundryCheckout", {
                laundryName: vendorCatalog?.vendor?.businessName || title || "Laundry",
                vendorId: vendorId
              })
            }
          >
            <Text style={styles.cartBtnText}>View Cart</Text>
          </TouchableOpacity>

        </View>
      )}
    </SafeAreaView>
  );
}