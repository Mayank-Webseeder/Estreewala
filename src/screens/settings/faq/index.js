import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import Header from "../../../components/header";
import appColors from '../../../theme/appColors';
import { SafeAreaView } from 'react-native-safe-area-context';

const FAQS = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
    const faqs = [
    {
      question: "What is Estreewalla?",
      answer: "Estreewalla is an first online platform of India that connects customers with laundry service providers in their area. You can schedule pickups, track your order, and get clean laundry delivered to your door—all through just one app."
    },
    {
      question: "How does it work?",
      answer: "It's simple:\n1. Register on Esterrwalla App\n2. You can either select specific service to avail, then select service provider and place order or you can select service provider in your area / nearest location, scroll the services and select the service you want to avail.\n3. Schedule a pickup time and location.\n4. Service picks up your laundry.\n5. Service providers completes the service\n6. You can pay directly to service provider by any means i.e. cash or UPI payment directly to service provider."
    },
    {
      question: "What if don't find any service provider on Estreewalla App near my location?",
      answer: "You may search locally or may ask your neighbour for any laundry service provider in your location, you can request or make them aware about this app and encourage them to register on Estreewalla App."
    },
    {
      question: "Does Estreewalla App charges any commission from Customer or Service Provider?",
      answer: "No, Estreewalla App does not charge any commission from laundry Service Provider or Customer. Service provider directly list the charges for the laundry service they provide, customer may select based on the rate chart and pay directly to service provider."
    },
    {
      question: "What laundry services Estreewalla App offers?",
      answer: "Estreewalla App does not provide any laundry service, Estreewalla app provides an E Platform for customers and laundry service providers. Laundry service providers can register on Estreewalla App and select the services they offer along with charges / rate chart. The customer may select any laundry service provider near their location or as per their choice. It is sole discretion of Laundry Service Provider to accept the order or provide pickup / delivery services."
    },
    {
      question: "Anyone who provides Laundry Service can register on Estreewala App?",
      answer: "Yes, anyone who provides the Laundry Services i.e. Ironing, Dry Cleaning etc. can register on Estreewalla App. They just need to register via mobile number and uploading the government issued ID, select the services they offer, charges / rates etc. Once verification by Estreewalla is completed, they start visible over the app for the respective area and can accept the orders."
    },
    {
      question: "Do you offer pickup and delivery?",
      answer: "Estreewalla App provides E plateform to laundry service providers & customers. The services offered including pickup / drop and order acceptance is sole discretion of laundry service provider. Yes, our laundry service providers will provide free pickup and delivery within our service areas. You can choose your preferred time slots during booking."
    },
    {
      question: "Which areas do we serve?",
      answer: "Our app is available for download via Android or iOS across India, You may search for your nearest laundry service provider over Estreewalla App. We currently operate in India. Enter your location on the app or website to see availability."
    },
    {
      question: "Can I reschedule or cancel a pickup?",
      answer: "Yes. You can reschedule or cancel up to 3 hrs before the scheduled pickup time via your account dashboard. However the rescheduling the pickup is subjected to acceptance by the service provider."
    },
    {
      question: "How long does it take to get my laundry back?",
      answer: "Estreewalla App provides the plateform for placing the order and scheduling the pickup, however please confirm with your laundry service provider for the expected completion & order delivery."
    },
    {
      question: "Anyone who provides Laundry Service can register on Estreewala App?",
      answer: "Yes, anyone who provides the Laundry Services i.e. Ironing, Dry Cleaning etc. can register on Estreewalla App.  They just need to register via mobile number and uploading the government issued ID, select the services they offer, charges / rates etc. Once verification by Estreewalla is completed, they start visible over the app for the respective area and can accept the orders. "
    },
     {
      question: "Do you offer pickup and delivery?",
      answer: "Estreewalla App provides E plateform to laundry service providers & customers. The services offered including pickup / drop and order acceptance is sole discretion of laundry service provider. "
    },
     {
      question: "Which areas do we serve?",
      answer: "Our app is available for download via Android or iOS across India, You may search for your nearest laundry service provider over Estreewalla App."
    },
     {
      question: "Can I reschedule or cancel a pickup?",
      answer: ": Yes. You can reschedule or cancel up to 3 hrs before the scheduled pickup time via your account dashboard. However the rescheduling the pickup is subjected to acceptance by the service provider."
    },
     {
      question: "How long does it take to get my laundry back?",
      answer: "Estreewalla App provides the plateform for placing the order and scheduling the pickup, however please confirm with your laundry service provider for the expected completion & order delivery."
    },
     {
      question: "How much do your services cost?",
      answer: "Pricing depends on the type and quantity of items. You can view the detailed pricing list in the app before confirming your order."
    },
    {
      question: "How much do your services cost?",
      answer: "Pricing depends on the type and quantity of items. You can view the detailed pricing list in the app before confirming your order."
    },
    {
      question: "How do I pay?",
      answer: "You can pay to service providers by using digital wallets, UPI or Cash on delivery directly to the laundry service provider."
    },
    {
      question: "Can I request special handling for certain clothes?",
      answer: "Absolutely. You can leave specific instructions when placing your order—like air drying, low-heat ironing, or special detergents."
    },
    {
      question: "What if something gets lost or damaged?",
      answer: "If something lost or damaged, service provider is responsible to compensate. Estreewalla App will not responsible for any losses or damages."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via for feedback and support:\n• Email: support@estreewalla.com"
    },
    {
      question: "Do you offer services for businesses or bulk orders?",
      answer: "All types of orders can be placed on Estreewalla App, which is subjected to acceptance by the laundry service provider."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // ✅ Filter FAQs based on search input
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
   <SafeAreaView style={styles.container}>
     <View style={styles.container}>
       <Header
        title="FAQ"
        onBackPress={() => navigation.goBack()}
        onRightPress={() => console.log("Settings pressed")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.faqContainer}>
          {filteredFaqs.length === 0 ? (
            <Text style={{ color: appColors.font, marginTop: 10 }}>No FAQs found.</Text>
          ) : (
            filteredFaqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Icon
                    name={activeIndex === index ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={22}
                    color={appColors.font}
                  />
                </TouchableOpacity>

                {activeIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpText}>Contact our 24/7 customer support</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ContactSupport')}
            style={styles.helpButton}
          >
            <Text style={styles.helpButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
   </SafeAreaView>
  );
};

export default FAQS;
