import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  TextInput,
  ScrollView,
} from 'react-native';
import { styles } from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from "../../../components/header";
import appColors from '../../../theme/appColors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactSupport({ navigation }) {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  const openEmail = () => {
    Linking.openURL('mailto:support@estreewalla.com');
  };

  const openDialer = () => {
    Linking.openURL('tel:+919557919140');
  };

  const handleMessageChange = (text) => {
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSubmit = () => {
    navigation.goBack()
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header
          title="Contact Support"
          onBackPress={() => navigation.goBack()}
          onRightPress={() => console.log("Settings pressed")}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.helpTitle}>Need Help? We're just a tap away.</Text>
          <Text style={styles.helpSubText}>
            Reach out via call or email, or send us a quick message. Our support team is always here to assist you.
          </Text>

          <TouchableOpacity style={styles.cardBox} onPress={openEmail}>
            <View style={styles.row}>
              <Ionicons name="mail" size={20} color={appColors.black} />
              <Text style={styles.cardTitle}> Email Us</Text>
            </View>
            <Text style={styles.cardValue}>support@estreewalla.com</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.cardBox} onPress={openDialer}>
          <View style={styles.row}>
            <Ionicons name="call" size={20} color={appColors.black} />
            <Text style={styles.cardTitle}> Call Us</Text>
          </View>
          <Text style={styles.cardValue}>+91 12356</Text>
        </TouchableOpacity>

        <View style={styles.messageRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#000" />
          <Text style={styles.messageLabel}> Send us a message</Text>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          multiline
          numberOfLines={5}
          maxLength={500}
          textAlignVertical="top"
          value={message}
          onChangeText={handleMessageChange}
          placeholderTextColor={appColors.font}
        />
        <Text style={styles.charCount}>{charCount}/500</Text> */}


        </ScrollView>
        {/* <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
         
        >
          <Text style={styles.submitText}>
            {'Submit'}
          </Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}