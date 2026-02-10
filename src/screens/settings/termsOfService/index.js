import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,  
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import Header from "../../../components/header";
import { SafeAreaView } from 'react-native-safe-area-context';
import { windowHeight, windowWidth, fontSizes } from '../../../theme/appConstant';
import appColors from '../../../theme/appColors';

const TermsOfServiceScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();

  const termsContent = `
    <p><strong>Last updated on 27th Nov 2025</strong></p>

    <h2>I. Acceptance of terms</h2>
    <p>Thank you for using ESTREEWALLA. These Terms of Service (the "Terms") are intended to make you aware of your legal rights and responsibilities with respect to your access to and use of the ESTREEWALLA website at www.estreewalla.com (the "Site") and any related mobile or software applications ("ESTREEWALLA Platform") including but not limited to delivery of information via the website whether existing now or in the future that link to the Terms (collectively, the "Services").</p>
    <p>These Terms are effective for all existing and future ESTREEWALLA customers, including but without limitation to users having access to 'business page' to manage their claimed business listings.</p>
    <p>Please read these Terms carefully. By accessing or using the ESTREEWALLA Platform, you are agreeing to these Terms and concluding a legally binding contract with Altivus Services Pvt. Ltd. and/or its affiliates (hereinafter collectively referred to as "ESTREEWALLA"). You may not use the Services if you do not accept the Terms or are unable to be bound by the Terms. Your use of the ESTREEWALLA Platform is at your own risk, including the risk that you might be exposed to content that is objectionable, or otherwise inappropriate.</p>
    <p>In order to use the Services, you must first agree to the Terms. You can accept the Terms by:</p>
    <ul>
      <li>Clicking to accept or agree to the Terms, where it is made available to you by ESTREEWALLA in the user interface for any particular Service; or</li>
      <li>Actually using the Services. In this case, you understand and agree that ESTREEWALLA will treat your use of the Services as acceptance of the Terms from that point onwards.</li>
    </ul>

    <h2>II. Definitions</h2>
    <p><strong>Customer</strong><br>"Customer" or "You" or "Your" refers to you, as a customer of the Services. A customer is someone who accesses or uses the Services for the purpose of sharing, displaying, hosting, publishing, transacting, or uploading information or views or pictures and includes other persons jointly participating in using the Services including without limitation a user having access to 'business page' to manage claimed business listings or otherwise.</p>
    
    <p><strong>Content</strong><br>"Content" will include (but is not limited to) reviews, images, photos, audio, video, location data, nearby places, and all other forms of information or data. "Your content" or "Customer Content" means content that you upload, share or transmit to, through or in connection with the Services, such as likes, ratings, reviews, images, photos, messages, chat communication, profile information, or any other materials that you publicly display or displayed in your account profile. "ESTREEWALLA content" means content that ESTREEWALLA creates and make available in connection with the Services including, but not limited to, visual interfaces, interactive features, graphics, design, compilation, computer code, products, software, aggregate ratings, reports and other usage-related data in connection with activities associated with your account and all other elements and components of the Services excluding Your Content and Third Party Content. "Third Party Content" means content that comes from parties other than ESTREEWALLA or its Customers, such as Service Providers and is available on the Services.</p>

    <p><strong>Laundry Service Provider(s)</strong><br>"Laundry Service Providers" means the Laundry listed on ESTREEWALLA Platform.</p>

    <h2>III. Eligibility to use the services</h2>
    <ol>
      <li>You hereby represent and warrant that you are at least eighteen (18) years of age or above and are fully able and competent to understand and agree the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms.</li>
      <li><strong>Compliance with Laws.</strong> You are in compliance with all laws and regulations in the country in which you live when you access and use the Services. You agree to use the Services only in compliance with these Terms and applicable law, and in a manner that does not violate our legal rights or those of any third party(ies).</li>
    </ol>

    <h2>IV. Changes to the terms</h2>
    <p>ESTREEWALLA may vary or amend or change or update these Terms, from time to time entirely at its own discretion. You shall be responsible for checking these Terms from time to time and ensure continued compliance with these Terms. Your use of ESTREEWALLA Platform after any such amendment or change in the Terms shall be deemed as your express acceptance to such amended/changed terms and you also agree to be bound by such changed/amended Terms.</p>

    <h2>V. Translation of the terms</h2>
    <p>ESTREEWALLA may provide a translation of the English version of the Terms into other languages. You understand and agree that any translation of the Terms into other languages is only for your convenience and that the English version shall govern the terms of your relationship with ESTREEWALLA. Furthermore, if there are any inconsistencies between the English version of the Terms and its translated version, the English version of the Terms shall prevail over others.</p>

    <h2>VI. Provision of the services being offered by ESTREEWALLA</h2>
    <ol>
      <li>ESTREEWALLA is constantly evolving in order to provide the best possible experience and information to its Customers. You acknowledge and agree that the form and nature of the Services which ESTREEWALLA provides, may require affecting certain changes in it, therefore, ESTREEWALLA reserves the right to suspend/cancel, or discontinue any or all products or services at any time without notice, make modifications and alterations in any or all of its contents, products and services contained on the site without any prior notice.</li>
      <li>We, the software, or the software application store that makes the software available for download may include functionality to automatically check for updates or upgrades to the software. Unless your device, its settings, or computer software does not permit transmission or use of upgrades or updates, you agree that we, or the applicable software or software application store, may provide notice to you of the availability of such upgrades or updates and automatically push such upgrade or update to your device or computer from time-to-time. You may be required to install certain upgrades or updates to the software in order to continue to access or use the Services, or portions thereof (including upgrades or updates designed to correct issues with the Services). Any updates or upgrades provided to you by us under the Terms shall be considered part of the Services.</li>
      <li>You acknowledge and agree that if ESTREEWALLA disables access to your account, you may be prevented from accessing the Services, your account details or any files or other content, which is contained in your account.</li>
      <li>You acknowledge and agree that while ESTREEWALLA may not currently have set a fixed upper limit on the number of transmissions you may send or receive through the Services, ESTREEWALLA may set such fixed upper limits at any time, at ESTREEWALLA discretion.</li>
      <li>In our effort to continuously improve the ESTREEWALLA Platform and Services, we undertake research and conduct experiments from time to time on various aspects of the Services and offerings, including our apps, websites, user interface and promotional campaigns. As a result of which, some Customers may experience features differently than others at any given time. This is for making the ESTREEWALLA Platform better, more convenient and easy to use, improving Customer experience, enhancing the safety and security of our services and offerings and developing new services and features.</li>
      <li>By using ESTREEWALLA's Services you agree to the following disclaimers:
        <ul>
          <li>The Content on these Services is for informational purposes only. ESTREEWALLA disclaims any liability for any information that may have become outdated since the last time the particular piece of information was updated. ESTREEWALLA reserves the right to make changes and corrections to any part of the Content on these Services at any time without prior notice. ESTREEWALLA does not guarantee the quality of the Goods / Services, the prices listed or the availability of all items at any Laundry Service Provider. Unless stated otherwise, all pictures and information contained on these Services are believed to be owned by or licensed to ESTREEWALLA.</li>
          <li>Any certification, licenses or permits ("Certification") or information in regard to such Certification that may be displayed on Laundry Service Provider page on the ESTREEWALLA Platform is for informational purposes only. Such Certification is displayed by ESTREEWALLA on an 'as available' basis that is provided to ESTREEWALLA by the Laundry Service Providers. ESTREEWALLA does not make any warranties about the validity, authenticity, reliability and accuracy of such Certification or any information displayed in this regard.</li>
        </ul>
      </li>
      <li>ESTREEWALLA reserves the right to charge a subscription and/or membership fee in respect of any of its product or service and/or any other charge or fee on a per order level from Customers / Laundry Service Providers, in respect of any of its product or service on the ESTREEWALLA Platform anytime in future.</li>
      <li>ESTREEWALLA may from time to time introduce referral and/or incentive based programs. These Program(s) may be governed by their respective terms and conditions.</li>
      <li>ESTREEWALLA may from time to time offer credits, promo codes, vouchers or any other form of cashback that ESTREEWALLA may decide at its discretion. ESTREEWALLA reserves the right to modify, convert, cancel and/or discontinue such credits, promo codes or vouchers, as it may deem fit.</li>
    </ol>

    <h2>VII. Use of services by you or Customer</h2>
    <h3>1. ESTREEWALLA Account</h3>
    <p><strong>a.</strong> You must create an account in order to use some of the features offered by the Services. Use of any personal information you provide to us during the account creation process is governed by our Privacy Policy. You must keep your password confidential and you are solely responsible for maintaining the confidentiality and security of your account, all changes and updates submitted through your account, and all activities that occur in connection with your account.</p>
    <p><strong>b.</strong> In creating an account and/or claiming your business' listing, you represent to us that all information provided to us in such process is true, accurate and correct, and that you will update your information as and when necessary in order to keep it accurate.</p>
    <p><strong>c.</strong> You are also responsible for all activities that occur in your account. You agree to notify us immediately of any unauthorized use of your account in order to enable us to take necessary corrective action.</p>
    <p><strong>d.</strong> By creating an account, you agree to receive certain communications in connection with ESTREEWALLA Platform or Services.</p>

    <h3>2. Others Terms</h3>
    <p><strong>a.</strong> In order to connect you to certain Laundry Service Providers, we provide the direct contact details, which are displayed on the specific listing page on the ESTREEWALLA Platform.</p>
    <p><strong>b.</strong> You agree to use the Services only for purposes that are permitted by (a) the Terms and (b) any applicable law, regulation or generally accepted practices or guidelines in the relevant jurisdictions.</p>
    <p><strong>c.</strong> You agree to use the data owned by ESTREEWALLA only for personal use/purposes and not for any commercial use unless agreed to by/with ESTREEWALLA in writing.</p>
    <p><strong>d.</strong> You agree not to access (or attempt to access) any of the Services by any means other than the interface that is provided by ESTREEWALLA.</p>
    <p><strong>e.</strong> You agree that you will not engage in any activity that interferes with or disrupts the Services (or the servers and networks which are connected to the Services).</p>
    <p><strong>f.</strong> You agree that ESTREEWALLA is a platform which connects Customers and Laundry Service Providers, ESTREEWALLA is not responsible for any disputes arises from any damage/ missing/ mishandling of cloths or other relevant goods, misbehavior etc. by the Customer or the Laundry Service Provider.</p>

    <h2>VIII. Content</h2>
    <h3>1. Ownership of Content and Proprietary Rights</h3>
    <p><strong>a.</strong> We are the sole and exclusive copyright owners of the Services and our Content. We also exclusively own the copyrights, trademarks, service marks, logos, trade names and other intellectual and proprietary rights associated with the Services and ESTREEWALLA Content.</p>
    <p><strong>b.</strong> You agree to protect ESTREEWALLA's proprietary rights and the proprietary rights of all others having rights in the Services during and after the term of this agreement.</p>
    <p><strong>c.</strong> You agree not to use any framing techniques to enclose any trademark or logo or other proprietary information of ESTREEWALLA.</p>
    <p><strong>d.</strong> To the fullest extent permitted by applicable law, we neither warrant nor represent that your use of materials displayed on the Services will not infringe rights of third parties not owned by or affiliated with us.</p>

    <h3>2. Your License to ESTREEWALLA Content</h3>
    <p><strong>a.</strong> We grant you a personal, limited, non-exclusive and non-transferable license to access and use the Services only as expressly permitted in these Terms.</p>
    <p><strong>b.</strong> Any violation by you of the license provisions contained in this Section may result in the immediate termination of your right to use the Services.</p>

    <h3>3. ESTREEWALLA License to Your or Customer Content</h3>
    <p>In consideration of availing the Services on the ESTREEWALLA Platform and by submitting Your Content, you hereby irrevocably grant ESTREEWALLA a perpetual, irrevocable, world-wide, non-exclusive, fully paid and royalty-free, assignable, sub-licensable and transferable license and right to use Your Content.</p>

    <h2>XIV. Disclaimer of warranties, limitation of liability, and Indemnification</h2>
    <h3>1. Disclaimer of Warranties</h3>
    <p>YOU ACKNOWLEDGE AND AGREE THAT THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" AND THAT YOUR USE OF THE SERVICES SHALL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ALTIVUS, ITS AFFILIATES (ESTREEWALLA) AND THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, BRANCHES, SUBSIDIARIES, AND LICENSORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES INCLUDING MOBILE APPS AND YOUR USE OF THEM.</p>

    <h3>2. Limitation of Liability</h3>
    <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE ESTREEWALLA BE LIABLE TO YOU FOR ANY DAMAGES RESULTING FROM ANY (I) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT, AND/OR (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES INCLUDING MOBILE APP.</p>

    <h3>3. Indemnification</h3>
    <p>You agree to indemnify, defend, and hold harmless the ESTREEWALLA affiliates from and against any third party claims, damages (actual and/or consequential), actions, proceedings, demands, losses, liabilities, costs and expenses (including reasonable legal fees) suffered or reasonably incurred by us arising as a result of, or in connection with your use of the Services.</p>

    <h2>XVIII. Contact Us</h2>
    <h3>1. Details of the Company</h3>
    <ul>
      <li><strong>Legal Entity Name:</strong> Altivus Services Pvt. Ltd.</li>
      <li><strong>CIN:</strong> U82990GJ2025PTC166517</li>
      <li><strong>Registered / Corporate Address:</strong> A-501, VINAYAK PARADISE, B/S. PUNIT NAGAR, EME, VADODARA - 390008</li>
      <li><strong>Details of website and Application:</strong> www.estreewalla.com ("Website") and "ESTREEWALLA" application for mobile and handheld devices</li>
      <li><strong>Contact Details:</strong> support@estreewalla.com</li>
    </ul>

    <h3>2. Grievance Redressal Mechanism</h3>
    <p><strong>a. Customer Care Channels</strong><br>You may write to us at support@estreewalla.com and we will strive to resolve your order related grievance within the timelines prescribed under applicable laws.</p>
    
    <p><strong>b. Details of the Grievance Officer</strong><br>
    P Mishra<br>
    Grievance Officer, Altivus Services Pvt. Ltd.<br>
    A-501, VINAYAK PARADISE, B/S. PUNIT NAGAR, EME, VADODARA - 390008<br>
    Email address: grievance@estreewalla.com<br>
    Phone: 0265 352 0733<br>
    Time: Monday - Friday (09:00 am to 5:00 pm.)</p>

    <div style="background-color: #f8f8f8; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <p><strong>Please note:</strong> ESTREEWALLA does not solicit confidential information such as OTP/CVV/PIN NUMBER/Card number either through call or mail or any other means. Please do not reveal these details to fraudsters and imposters claiming to be calling on ESTREEWALLA's behalf. You may report such suspicious activities to support@estreewalla.com</p>
    </div>
  `;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header
          title="Terms of Service"
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: termsContent }}
            tagsStyles={tagsStyles}
            systemFonts={systemFonts}
            enableExperimentalMarginCollapsing={true}
            baseStyle={styles.baseStyle}
          />
        </ScrollView>
      </View>
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
    paddingHorizontal: windowWidth(20),
    paddingVertical: windowHeight(20),
    paddingBottom: windowHeight(40),
    paddingTop: windowHeight(5)
  },
  baseStyle: {
    fontSize: 14,
    lineHeight: windowHeight(22),
  },
});

export default TermsOfServiceScreen;