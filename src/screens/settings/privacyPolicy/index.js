import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../../../components/header";
import { windowHeight, windowWidth, fontSizes } from '../../../theme/appConstant';
import appColors from '../../../theme/appColors';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();

  // Your privacy policy content with proper HTML formatting
  const privacyPolicyContent = `
    <p><strong>Last updated on 27th Nov 2025</strong></p>

    <h2>Applicability and Scope</h2>
    <p>Altivus Services Pvt. Ltd. and/or its affiliates ("ESTREEWALLA", "the Company", "we", "us", and "our") respect your privacy and are committed to protecting it. This policy describes:</p>
    <ul>
      <li>the types of information that ALTIVUS may collect from you when you access or use its websites, applications and other online services (collectively, referred as "Services"); and</li>
      <li>its practices for collecting, using, maintaining, protecting and disclosing that information.</li>
    </ul>
    <p>This policy applies only to the information ALTIVUS collects through its Services, in email, text and other electronic communications sent through or in connection with its Services.</p>

    <h2>Information We Collect</h2>
    <p>ALTIVUS and its platforms and affiliate companies collect information from and about users of our Services, which includes:</p>
    <ul>
      <li><strong>Your Personal Information:</strong> Information that relates to an identified or identifiable individual.</li>
      <li><strong>Other Information:</strong> Data related to your use of the Services that may not directly identify you by itself.</li>
    </ul>

    <h3>Information You Provide to Us</h3>
    <p>The information we collect on or through our Services may include:</p>
    <ul>
      <li>Personal information: Name, address, email address, postal code, password and other information you may provide with your account</li>
      <li>Your content: Information you provide through our Services, including your reviews, photographs, comments, lists, followers</li>
      <li>Your orders and preferences: Information provided while utilising the Services</li>
      <li>Your activities: Search terms, how long you used our Services, which features you used</li>
      <li>Your communications: Communications between you and service providers</li>
      <li>Your transactional information: Payment and billing information</li>
    </ul>

    <h3>Information We Collect Through Automatic Data Collection Technologies</h3>
    <p>We may automatically collect certain information about the computer or devices you use to access the Services:</p>
    <ul>
      <li>Service Usage & Activity Data</li>
      <li>Device & Connection Information</li>
      <li>Precise and real-time location information</li>
      <li>Cookies and Other Electronic Tools</li>
    </ul>

    <h3>Information from Third Parties</h3>
    <p>We may also obtain information about you from third-party sources, including:</p>
    <ul>
      <li>Third-Party Account Authentication</li>
      <li>Other Third Parties like laundry service providers, marketing partners</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>We use the information we collect from and about you for a variety of purposes, including to:</p>
    <ul>
      <li>Core Service & Operations</li>
      <li>Platform Maintenance, Security & Compliance</li>
      <li>Service Improvement, Personalization & Research</li>
      <li>Marketing, Advertising & Promotions</li>
      <li>Analytics and advertising</li>
      <li>Social Features</li>
    </ul>

    <h2>How We Share Your Information</h2>
    <p>We may disclose personal information that we collect in the following ways:</p>
    <ul>
      <li>To our affiliates</li>
      <li>To service providers</li>
      <li>To an actual or potential buyer in case of merger</li>
      <li>For Legal Purposes</li>
      <li>For Platform safety</li>
      <li>With your consent</li>
    </ul>

    <h2>Data of Minors</h2>
    <p>Our Services are generally not directed to individuals under the age of 18. If you provide information about a minor, you represent that you are the parent or legal guardian and give explicit consent.</p>

    <h2>Security</h2>
    <p>We have implemented appropriate physical, electronic, and managerial procedures to safeguard and help prevent unauthorized access to your information.</p>

    <h2>Information Pertaining to Service Partners</h2>
    <p>This section applies specifically to individuals who engage with Altivus as independent contractors or partners.</p>

    <h3>Information Collected from Service Partners</h3>
    <ul>
      <li>Identification and Contact Information</li>
      <li>Verification Information</li>
      <li>Financial Information</li>
      <li>Location Information</li>
      <li>Task, Performance, and Usage Data</li>
    </ul>

    <h2>Policy Amendments</h2>
    <p>We reserve the right to amend this Privacy Policy from time to time. Your continued use of the Services following changes constitutes your acceptance.</p>

    <h2>Contact Us</h2>
    <p>If you have any queries relating to the processing/usage of information provided by you or regarding Altivus's Privacy Policy, you may email at <a href="mailto:support@estrewalla.com">support@estrewalla.com</a></p>
  `;

  // Custom HTML styles for better rendering
  const tagsStyles = {
    body: {
      fontSize: fontSizes.FONT14,
      lineHeight: windowHeight(15),
      color: appColors.font,
    },

    h1: {
      fontSize: fontSizes.FONT20,
      fontWeight: '700',
      marginTop: windowHeight(20),
      marginBottom: windowHeight(10),
      color: appColors.black,
    },

    h2: {
      fontSize: fontSizes.FONT20,
      fontWeight: '700',
      marginTop: windowHeight(16),
      marginBottom: windowHeight(8),
      color: appColors.black,
    },

    h3: {
      fontSize: fontSizes.FONT20,
      fontWeight: '700',
      marginTop: windowHeight(12),
      marginBottom: windowHeight(6),
      color: appColors.black,
    },

    p: {
      marginBottom: windowHeight(10),
      lineHeight: windowHeight(20),
      fontSize: fontSizes.FONT17,
      color: appColors.font,
    },

    ul: {
      marginBottom: windowHeight(10),
      paddingLeft: windowWidth(20),
    },

    li: {
      marginBottom: windowHeight(6),
      lineHeight: windowHeight(20),
      fontSize: fontSizes.FONT17,
      color: appColors.font,
    },

    strong: {
      fontWeight: '700',
    },

    a: {
      color: appColors.blue,
      textDecorationLine: 'underline',
    },
  };

  const systemFonts = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'];

  const renderersProps = {
    a: {
      onPress(event, href) {
        // Handle link press - you can add linking logic here
        console.log('Link pressed:', href);
      },
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Privacy Policy"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          <RenderHtml
            contentWidth={width - 40}
            source={{ html: privacyPolicyContent }}
            tagsStyles={tagsStyles}
            systemFonts={systemFonts}
            renderersProps={renderersProps}
            enableExperimentalMarginCollapsing={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 5
  },
});

export default PrivacyPolicyScreen;