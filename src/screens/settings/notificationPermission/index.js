import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert ,PermissionsAndroid,Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notification } from '../../../utils/images/images';
import { styles } from './styles';
import { useAuth } from '../../../utils/context/authContext';

export default function NotificationPromptScreen({ navigation }) {
  const { login, markAppAsLaunched, isFirstLaunch } = useAuth();
  const [loading, setLoading] = useState(false);
  
const onNotificationClick = async () => {
  setLoading(true);
  try {
    let granted = false;

    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        // Android 13+ requires explicit permission
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 and below auto-grant
        granted = true;
      }
    }

    if (granted) {
      if (isFirstLaunch) {
        await markAppAsLaunched();

        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
          navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } 
    } else {
      Alert.alert(
        "Permission Denied",
        "You can enable notifications later in settings."
      );
    }
  } catch (error) {
    console.log("Notification setup error:", error);
    Alert.alert("Error", "Failed to set up notifications. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Skip notifications
  const skipClick = async () => {
   try {
      if (isFirstLaunch) {
        await markAppAsLaunched();
      }

      // Navigate to appropriate screen based on context
      if (isFirstLaunch) {
        // First launch flow completed - go to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        // Not first launch - normal navigation
       navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }

    } catch (error) {
      console.log('Notification setup error:', error);
      Alert.alert('Error', 'Failed to set up notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Enable notifications to get updates{'\n'}about offers, order status and more
        </Text>

        <View style={styles.illustrationWrap}>
          <Image source={notification} style={styles.illustration} resizeMode="cover" />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onNotificationClick}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Enable Notifications</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={skipClick}
            activeOpacity={0.8}
            disabled={loading} // optional: prevent skipping while loading
          >
            <Text style={styles.ghostBtnText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
