import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import appColors from '../../../theme/appColors';
import LottieView from "lottie-react-native";
import {styles} from './styles'

const SetLocationScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate('MainDrawer')}
      >
        {/* <Text style={styles.skipText}>Skip</Text> */}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
          <LottieView
        source={require("../../../assets/lottie/location.json")} // path to your animation JSON
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <View style={styles.blank}/>
        <Text style={styles.title}>Hello, nice to meet you!</Text>
        
        <Text style={styles.subtitle}>
          Set your current location to start find Laundry services nearest you.
        </Text>

        <TouchableOpacity 
          style={styles.locationButton}
          onPress={() => navigation.navigate('ConfirmLocation')}
        >
          <Icon name="location" size={20} color={appColors.white} style={styles.locationIcon} />
          <Text style={styles.locationButtonText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};



export default SetLocationScreen;