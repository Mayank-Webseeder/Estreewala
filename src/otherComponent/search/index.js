import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {styles} from './styles'
import Header from '../../components/header';
import appColors from '../../theme/appColors';

const SearchScreen = ({navigation}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Sample laundry data with real image URLs
const laundryServices = [
  {
    id: '1',
    name: 'UrbanFresh Laundry',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', // man carrying laundry basket
    services: ['Wash & Fold', 'Dry Cleaning', 'Ironing'],
    deliveryTime: '2 hours',
    price: '₹150/kg'
  },
  {
    id: '2',
    name: 'CrispCloth',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1581574206536-1c0f65d65e19?w=400&h=300&fit=crop', // woman using washing machine
    services: ['Premium Wash', 'Stain Removal', 'Express Service'],
    deliveryTime: '1.5 hours',
    price: '₹180/kg'
  },
  {
    id: '3',
    name: 'SqueeMy Clean',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1615397349754-6d946e1a5aa3?w=400&h=300&fit=crop', // clean clothes folded
    services: ['Eco Wash', 'Fabric Care', 'Bulk Discount'],
    deliveryTime: '3 hours',
    price: '₹130/kg'
  },
  {
    id: '4',
    name: 'Purecare Laundry',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1599577189755-71b0c05093be?w=400&h=300&fit=crop', // detergents & organic cleaning products
    services: ['Organic Cleaning', 'Baby Clothes', 'Special Care'],
    deliveryTime: '4 hours',
    price: '₹200/kg'
  },
  {
    id: '5',
    name: 'PreventRoom',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1588697167327-3a65aa5e1f9e?w=400&h=300&fit=crop', // delivery van for laundry pickup
    services: ['24/7 Service', 'Pickup & Delivery', 'Corporate'],
    deliveryTime: 'Same day',
    price: '₹170/kg'
  }
];


  // Popular search suggestions
  const popularSearches = [
    'Wash & Fold',
    'Dry Cleaning',
    'Ironing Service',
    'Express Delivery',
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = laundryServices.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.services.some(service => service.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={10} color={appColors.white} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesText} numberOfLines={1}>
            {item.services.join(' • ')}
          </Text>
        </View>

        <View style={styles.serviceFooter}>
          <View style={styles.deliveryInfo}>
            <Icon name="time-outline" size={12} color="#666" />
            <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
          {/* Header */}
         <Header
          title="Search Laundry"
          onBackPress={() => navigation.goBack()}
          onRightPress={() => navigation.navigate("Settings")}
          titleStyle={{color:appColors.white}}
          iconColor={appColors.white}
        />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for laundry services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
            
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={appColors.darkBlue} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      </View>
     

      {searchQuery === '' ? (
        /* Popular Searches */
        <ScrollView style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.popularTags}>
            {popularSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularTag}
                onPress={() => handleSearch(search)}
              >
                <Text style={styles.popularTagText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Searches (optional) */}
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.recentSearches}>
            <Text style={styles.noRecentText}>No recent searches</Text>
          </View>
        </ScrollView>
      ) : (
        /* Search Results */
        <View style={styles.resultsContainer}>
      
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          ) : (
            <View style={styles.noResults}>
              <Icon name="search-outline" size={60} color="#ccc" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubText}>
                Try different keywords or check popular searches
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};



export default SearchScreen;