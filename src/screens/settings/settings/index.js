import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from './styles';
import Header from "../../../components/header/index"
import appColors from "../../../theme/appColors";
import { BellIcon } from "../../../assets/Icons/svg/bell";
import {EmailIcon} from '../../../assets/Icons/svg/emailIcon'
// Menu Item Component with optional switch
const MenuItem = ({ 
  icon, 
  label, 
  onPress, 
  hasSwitch = false, 
  isSwitchOn = false, 
  onSwitchChange, 
  isLast = false 
}) => (
  <TouchableOpacity 
    style={[styles.menuItem, isLast && styles.lastMenuItem]} 
    onPress={onPress}
    activeOpacity={0.7}
    disabled={hasSwitch}
  >
    <View style={styles.iconBox}>{icon}</View>
    <Text style={styles.menuText}>{label}</Text>
    {hasSwitch ? (
      <Switch
        value={isSwitchOn}
        onValueChange={onSwitchChange}
        trackColor={{ false: appColors.border, true: appColors.blue }}
        thumbColor={isSwitchOn ? appColors.white : appColors.white}
      />
    ) : (
      <View style={styles.chevron} />
    )}
  </TouchableOpacity>
);

// ==== SETTINGS SCREEN ====
export default function Settings({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [promotional, setPromotional] = useState(false);


  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        onBackPress={() => navigation.goBack()}
        showNotificationIcon={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notification Settings */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <MenuItem 
            icon={<BellIcon size={18} color={appColors.blue} />} 
            label="Push Notifications" 
            hasSwitch 
            isSwitchOn={notifications}
            onSwitchChange={setNotifications}
          />
          <MenuItem 
            icon={<EmailIcon size={18} color={appColors.blue} />} 
            label="Promotional Emails" 
            hasSwitch 
            isSwitchOn={promotional}
            onSwitchChange={setPromotional}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}