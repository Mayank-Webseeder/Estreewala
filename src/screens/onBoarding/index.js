import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from "react-native";
import { styles } from "./styles";
import {
  onBoardImg,
  onBoardImg1,
  onBoardImg2,
  onBoardImg3,
} from "../../utils/images/images";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Well-Trained Professionals",
    description:
      "A wide range of experienced Service Providers to serve laundry services. We check their backgrounds in detail.",
    image: onBoardImg,
   backgroundColor:"#e5efff"
  },
  {
    id: "2",
    title: "Customizable Service",
    description:
      "You can describe your laundry preferences and we'll return your items exactly as described!",
    image: onBoardImg1,
     backgroundColor:"#fff7ed"

  },
  {
    id: "3",
    title: "Easy Reservation System",
    description:
      "Create an account and get the laundry services as easy as drinking a glass of water.",
    image: onBoardImg2,
  backgroundColor:"#f0ecff"
  },
  {
    id: "4",
    title: "Premium Express Delivery",
    description:
      "Next-day and two-day delivery options so your clothes are delivered when you need.",
    image: onBoardImg3,
     backgroundColor:"#f7f2fa"
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
    const insets = useSafeAreaInsets();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
     await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("PhoneLogin");
   
    }
  };

  const handleSkip = async () => {
   await  AsyncStorage.setItem("hasSeenOnboarding", "true");
navigation.replace("PhoneLogin");
   
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, idx) => {
        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={idx.toString()}
            style={[
              styles.dot,
              idx === currentIndex && styles.activeDot,
              { opacity, width: dotWidth },
            ]}
          />
        );
      })}
    </View>
  );

  // Interpolated background color
  const backgroundColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map((slide) => slide.backgroundColor),
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Skip Button */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Images */}
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />

        {/* Bottom Card */}
         <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 18 }]}>
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.main}>
              <Text style={styles.title}>{slides[currentIndex].title}</Text>
              <Text style={styles.description}>
                {slides[currentIndex].description}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.row}>
            <Pagination />
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default OnboardingScreen;