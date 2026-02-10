import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import appColors from "../../../theme/appColors";
import documentIcon from "../../../assets/Icons/svg/documentIcon";
import deliveryIcon from "../../../assets/Icons/svg/deliveryIcon";
import OrderOnWayIcon from "../../../assets/Icons/svg/orderway";
import PickupOrderIcon from "../../../assets/Icons/svg/pickupOrder";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/header";
import CancelOrder from "../../../otherComponent/cancelOrderModal";
import { getStatusSteps } from "../../../utils/statusUtils";
import InvoiceModal from "../../../otherComponent/invoiceModal";
import moment from "moment";
import { windowHeight } from "../../../theme/appConstant";
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder } from "../../../redux/slices/orderSlice";
import { getItemImage } from "../../../utils/data/imageMapping"
import { updateOrderStatus } from "../../../redux/slices/myOrderSlice";
import { useToast } from "../../../utils/context/toastContext";
import { clearOrderDetail, fetchOrderDetail } from "../../../redux/slices/orderDetailSlice";

const OrderDetails = ({ navigation, route }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { order: currentOrder, loading, error } = useSelector(state => state.orderDetail);
  // const [currentOrder, setCurrentOrder] = useState(order || {});
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [isInvoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const { showToast } = useToast();
  const { cancellingOrder } = useSelector(state => state.order);
  const orderedItemCount = currentOrder?.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  // Update currentOrder when route params change

  useEffect(() => {
    console.log("currentOrder", currentOrder);

    if (orderId) {
      dispatch(fetchOrderDetail(orderId));
    }

    return () => {
      dispatch(clearOrderDetail());
    };
  }, [dispatch, orderId]);



  const handleCancelOrder = () => {
    setCancelModalVisible(true);
  };

  const handleDownloadInvoice = () => {
    setInvoiceModalVisible(true);
  };

  // Updated handleDownloadPDF for Android download
  const handleDownloadPDF = async () => {
    try {
      setDownloadingInvoice(true);

      if (Platform.OS === 'android') {
        // For Android, we'll use the WebView print functionality
        // The actual download will be handled in the InvoiceModal

      } else {
        // For iOS, show message

      }
    } catch (error) {
      console.error('PDF download failed:', error);

    } finally {
      setDownloadingInvoice(false);
    }
  };

  const confirmCancel = async (reason) => {
    try {
      console.log('🔄 Cancelling order with reason:', reason);

      // 1. API call to cancel
      await dispatch(cancelOrder({
        orderId: currentOrder?.id,
        reason: reason
      })).unwrap();

      // 2. Update Redux state IMMEDIATELY
      dispatch(updateOrderStatus({
        orderId: currentOrder?.id,
        newStatus: "cancelled" // Use whatever status your API returns
      }));

      // 3. Update local UI
      // setCurrentOrder((prev) => ({
      //   ...prev,
      //   status: "cancelled",
      // }));

      // 4. Close modal
      setCancelModalVisible(false);
      setSelectedReason('');
      setOtherReason('');

      showToast("Cancelled Order successfully!", "success");

      // 5. Go back after brief delay for smooth UX
      setTimeout(() => {
        navigation.goBack();
      }, 800);

    } catch (error) {
      console.log('Order cancellation error:', error);
    }
  };

  const getLast10Digits = (phone = '') => {
    return phone.replace(/\D/g, '').slice(-10);
  };

  const customerPhone = getLast10Digits(currentOrder?.contactDetails?.mobile);
  const vendorPhone = getLast10Digits(currentOrder?.vendor?.phone);

  const handleCall = () => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone}`);
    }
  };

  const handleVendorCall = () => {
    if (vendorPhone) {
      Linking.openURL(`tel:${vendorPhone}`);
    }
  };

  const getIconComponent = (title, color) => {
    switch (title) {
      case "Order is Placed":
        return <Ionicons name="document-text-outline" size={24} color={color} />;
      case "Order is Being Processed":
        return <Ionicons name="time-outline" size={24} color={color} />;
      case "Order is Completed":
        return <Ionicons name="checkmark-done-circle-outline" size={24} color={color} />;
      case "Order Cancelled":
        return <Ionicons name="close-circle-outline" size={26} color={color} />;
      case "Order Rejected":
        return <Ionicons name="alert-circle-outline" size={26} color={color} />;
      default:
        return <Ionicons name="alert-circle-outline" size={24} color={color} />;
    }
  };



  // Use currentOrder.status for timeline and UI updates
  const statusSteps = getStatusSteps(currentOrder);

  // Check if order is cancelled
  const isOrderCancelled = currentOrder?.status === "CANCELLED";
  const isOrderCompleted = currentOrder?.status === "completed";

  // Get status display text and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Pending", color: "#FF9800" };
      case "accepted":
        return { text: "Accepted", color: "#2196F3" };
      case "completed":
        return { text: "Completed", color: "#4CAF50" };
      case "cancelled":
        return { text: "Cancelled", color: "#FF3B30" };
      case "rejected":
        return { text: "Rejected", color: "#FF3B30" };
      default:
        return { text: status || "Unknown", color: appColors.gray };
    }
  };

  const statusDisplay = getStatusDisplay(currentOrder?.status?.toLowerCase());


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.container}
      >
        <Header onBackPress={() => navigation.goBack()} title={"Order Details"} />

        {/* Order Timeline */}
        <View style={styles.timeline}>
          {statusSteps.map((step, index, arr) => {
            return (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.iconColumn}>
                  <View style={[styles.imageView, { backgroundColor: step.bgColor }]}>
                    {getIconComponent(step.title, step.iconColor)}
                  </View>
                </View>

                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>

                  <Text style={styles.stepDate}>
                    {step.label ? `${step.label} · ` : ""}
                    {step.date || "-"}
                  </Text>
                </View>

                <View style={styles.rightColumn}>
                  <Ionicons
                    style={{ marginTop: -8 }}
                    name={step.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={step.completed ? "green" : "gray"}
                  />
                  {index !== arr.length - 1 && (
                    <View style={styles.dottedLine} />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <View style={styles.driverRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {currentOrder?.contactDetails?.fullName || "Unknown"}
              </Text>

              <View style={styles.addressBlock}>
                <Ionicons name="location-outline" size={18} color={appColors.darkBlue} />
                <Text style={styles.addressText}>
                  {currentOrder?.deliveryAddress?.fullAddress || "No address available"}
                </Text>
              </View>

              {/* 📞 Phone Row */}
              <View style={styles.phoneRow}>
                <Text style={styles.driverPhone}>{customerPhone}</Text>

                <TouchableOpacity
                  style={styles.callCircle}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.horizontalLine} />

          {/* Laundry Details */}
          <Text style={styles.sectionTitle}>Laundry Details</Text>

          <View style={styles.driverRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.addressBlock}>
                <MaterialIcons
                  name="local-laundry-service"
                  size={18}
                  color={appColors.darkBlue}
                />
                <Text style={styles.addressText}>
                  {currentOrder?.vendor?.name || "Unknown Laundry"}
                </Text>
              </View>

              <View style={styles.addressBlock}>
                <Ionicons name="location-outline" size={18} color={appColors.darkBlue} />
                <Text style={styles.addressText}>
                  {currentOrder?.vendor?.address || ""}
                </Text>
              </View>

              {/* 📞 Phone Row */}
              <View style={styles.phoneRow}>
                <Text style={styles.driverPhone}>{vendorPhone}</Text>

                <TouchableOpacity
                  style={styles.callCircle}
                  onPress={handleVendorCall}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>



        <View style={styles.card}>
          <View style={styles.orderItemHeader}>
            <Text style={styles.sectionTitle}>
              Ordered Items ({orderedItemCount})
            </Text>
          </View>

          {currentOrder?.items?.map((item, index) => {
            const itemImage = getItemImage(item?.item);

            return (
              <View key={index} style={styles.itemRow}>
                <Image source={itemImage} style={styles.itemImage} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item?.item}</Text>

                  <Text style={styles.itemService}>
                    {item?.service} · x{item?.quantity}
                  </Text>
                </View>

                <Text style={styles.itemPrice}>
                  ₹{item?.unitPrice} / item
                </Text>
              </View>
            );
          })}

          {currentOrder?.instructions ? (
            <Text style={styles.instruction}>
              {currentOrder.instructions}
            </Text>
          ) : null}
        </View>


        {/* Invoice Section */}
        <View style={[styles.card, styles.summeryStyle]}>
          <Text style={styles.invoiceId}>Order Id: {currentOrder?.orderId}</Text>



          {/* Status Display with Color */}
          <Text style={[styles.invoiceStatus, { color: statusDisplay.color }]}>
            {statusDisplay.text}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.text}>Date & Time</Text>
            <Text style={styles.subTitle}>
              {moment(currentOrder?.createdAt)
                .utcOffset("+05:30")
                .format("DD MMM, hh:mm A")}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.text}>Status</Text>
            <Text style={[styles.subTitle, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.text}>Pickup</Text>
            <Text style={styles.subTitle}>
              {moment(currentOrder?.pickupDate).format("DD MMM YYYY")} {currentOrder?.pickupTime}
            </Text>
          </View>

          {!["rejected", "cancelled"].includes(currentOrder?.status) && (
            <View style={styles.summaryRow}>
              <Text style={styles.text}>
                {currentOrder?.status === "completed"
                  ? "Delivered"
                  : "Expected Delivery"}
              </Text>

              <Text style={styles.subTitle}>
                {currentOrder?.status === "completed"
                  ? moment(currentOrder?.timeline?.completedAt).format("DD MMM YYYY")
                  : moment(currentOrder?.timeline?.deliveryDateTime).format("DD MMM YYYY")}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.horizontalLine,
              {
                marginTop: 15,
                borderBottomColor: appColors.font,
                marginBottom: 13,
              },
            ]}
          />
          <View style={styles.summaryRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>₹{currentOrder?.totalAmount}</Text>
          </View>
        </View>

        {/* Cancel Button - Only show if order is NOT cancelled and NOT completed */}
        {currentOrder?.status === "pending" && (
          <TouchableOpacity
            style={[styles.cancelButton, cancellingOrder && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancellingOrder}
          >
            {cancellingOrder ? (
              <ActivityIndicator size="small" color={appColors.white} />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}


        {/* Cancelled Order Message */}
        {isOrderCancelled && (
          <View style={styles.cancelledMessage}>
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
            <Text style={styles.cancelledText}>This order has been cancelled</Text>
          </View>
        )}

        <CancelOrder
          visible={isCancelModalVisible}
          onClose={() => {
            setCancelModalVisible(false);
            setSelectedReason('');
            setOtherReason('');
          }}
          onConfirm={confirmCancel}
          orderId={currentOrder?.orderId}
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          otherReason={otherReason}
          setOtherReason={setOtherReason}
          isLoading={cancellingOrder}
        />

        <InvoiceModal
          visible={isInvoiceModalVisible}
          onClose={() => setInvoiceModalVisible(false)}
          order={currentOrder}
          onDownload={handleDownloadPDF}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;