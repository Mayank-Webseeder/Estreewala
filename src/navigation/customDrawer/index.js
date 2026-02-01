import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from './styles';
import appColors from "../../theme/appColors";
import { BellIcon } from '../../assets/Icons/svg/bell'
import HelpSupportIcon from '../../assets/Icons/svg/helpSupport'
import { useAuth } from "../../utils/context/authContext"
import { useSelector } from "react-redux";
import { useToast } from "../../utils/context/toastContext";

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const { user, logout, userToken, token } = useAuth();
  const { customerData } = useSelector(state => state.customer);
  const { showToast } = useToast();
  const unreadCount = useSelector(
    state => state.notification?.unreadCount ?? 0
  );

  const handleRateApp = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.estreewala&pcampaignid=web_share');
  };

  const handleLogout = async () => {
    try {
      props.navigation.closeDrawer();

      await logout();

      showToast('Logged out successfully', 'success');

      console.log("HANDLE LOGOUT CALL");
    } catch (error) {
      console.log("Logout error:", error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };


  const handleNavigation = (screenName, params = {}) => {
    props.navigation.navigate(screenName, params);
  };

  return (
    <View style={[styles.container, { elevation: 5 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
        style={[styles.container]}
      >
        {/* User Info Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatar}>
            <Icon name="shirt-outline" size={28} color={appColors.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userNameText}>
              Welcome {user?.name || customerData?.name}
            </Text>
            {/* <Text style={styles.detailText}>
              Customer ID: {user?.customerId || '735625674'}
            </Text> */}
            {user?.phone && (
              <Text style={styles.detailText}>
                Phone: {user.phone}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.main}>
          {/* Main Navigation */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.closeDrawer(); // use props.navigation
                props.navigation.navigate("Tabs", { screen: "Home" });
              }}
            >
              <Icon name="home-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.closeDrawer();
                props.navigation.navigate("Tabs", { screen: "Orders" });
              }}
            >
              <Icon name="document-text-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>My Orders</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("ManageAddress")}
            >
              <Icon name="location-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>Manage Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("Notification")}
            >
              <BellIcon color={appColors.font} />
              <Text style={styles.menuText}>Notification</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>


            {/* Profile Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("LoginSecurity")}
            >
              <Icon name="person-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>Personal Information</Text>
            </TouchableOpacity>
          </View>

          {/* Support & Information */}
          <View style={styles.supportSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("ContactSupport")}
            >
              <HelpSupportIcon color={appColors.font} />
              <Text style={styles.menuText}>Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("PrivacyPolicy")}
            >
              <Icon name="shield-checkmark-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("AboutUs")}
            >
              <Icon name="information-circle-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>About Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("Faqs")}
            >
              <Icon name="help-circle-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("TermsOfServiceScreen")}
            >
              <Icon name="document-text-outline" size={20} color={appColors.font} />
              <Text style={styles.menuText}>Terms Of Service</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRateApp}
            >
              <Icon name="star-outline" size={16} color={appColors.font} />
              <Text style={styles.menuText}>Rate Our App</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.signOut}>
            <Icon name="log-out-outline" size={20} color="#E74C3C" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 10 }}>
        <View style={styles.serviceStatus}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, styles.statusOnline]} />
            <Text style={styles.statusText}>Service Available</Text>
          </View>
          <Text style={styles.statusSubText}>Open 24/7 for pickups</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomDrawerContent;