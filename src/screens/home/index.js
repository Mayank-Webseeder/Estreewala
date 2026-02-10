import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from '../home/header';
import ServiceList from '../home/serviceList';
import PopularLaundry from '../home/popularLaundry';
import BannerOffers from "../home/offerBanner";
import appColors from "../../theme/appColors";
import { windowHeight } from "../../theme/appConstant";
import { useAuth } from "../../utils/context/authContext";

export const Home = ({ navigation }) => {
  const { userToken, userDetails, userLocation } = useAuth();

  useEffect(() => {
    console.log("🔐 userToken:", userToken);
    console.log("👤 userDetails:", userDetails);
    console.log("📍 userLocation:", userLocation);
  }, [userToken, userDetails, userLocation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainView}>
          <Header navigation={navigation} />
          <ServiceList navigation={navigation} />
        </View>

        <BannerOffers />
        <PopularLaundry navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: "#07172cff",
  },
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  mainView: {
    backgroundColor: "#07172cff",
    marginBottom: windowHeight(12),
  },
  contentContainerStyle: {
    paddingBottom: 120,
  },
});
