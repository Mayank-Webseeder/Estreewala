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
import { windowHeight } from '../../../theme/appConstant';

const AboutUsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();

  const aboutUsContent = `    
    <p>At Altivus, we exist to empower the rise of individuals and communities through purpose-driven innovation. We believe technology should serve humanity — not the other way around.</p>
    
    <p>As a company rooted in empowerment, we uplift both consumers and service providers, creating solutions that help people thrive. Our solutions are built with simplicity at their core — intuitive, accessible, and designed for seamless everyday use.</p>
    
    <p>Guided by a mission larger than ourselves, our work is grounded in purpose-driven innovation— building not just products, but pathways for human evolution. We champion inclusivity, ensuring that our solutions are welcoming to all, regardless of background, ability, or access.</p>
    
    <p>Above all, we see technology as a force for service to society — a tool to elevate lives, support communities, and contribute meaningfully to the greater human journey.</p>
    
    <p>Our flagship app, Estreewalla, is a first-of-its-kind hyperlocal commerce platform — uniting convenience, opportunity, and community in one unified experience.</p>
    
    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 12px; border-left: 4px solid #007AFF; margin: 20px 0;">
      <p style="font-style: italic; font-size: 16px; line-height: 24px; color: #333; margin: 0;">
        "Altivus is a forward-thinking company shaping the next generation of digital living. With Estreewalla, our hyperlocal commerce app, we deliver a seamless, unified platform that brings convenience, community, and commerce together — all at your fingertips."
      </p>
    </div>

    <h2>Estreewalla – Press to Impress</h2>
    
    <p>Our flagship platform, Estreewalla, is the first-of-its-kind hyperlocal laundry commerce app — transforming the way people handle everyday laundry.</p>
    
    <p>Estreewalla connects nearby customers, local laundry service providers, and young delivery partners into one unified, seamless experience. From pickup to drop, Estreewalla offers more than convenience — it creates opportunity, community, and freedom from everyday burdens.</p>
    
    <p>Rooted in empowerment, Altivus uplifts both consumers and service providers. Our solutions are crafted to make life simpler, dignified, and connected. Whether it's access to everyday services or the means to build sustainable livelihoods, we strive to create systems where <strong>everyone has the right to rise.</strong></p>
    
    <p>Whether you're a customer seeking time-saving comfort, a laundry business looking to grow, or a youth seeking dignified work — Estreewalla is your gateway to rise.</p>
    
    <div style="background-color: #e8f4fd; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <p style="font-size: 18px; font-weight: bold; color: #007AFF; margin: 0;">
        Because when life is simplified, people can focus on what truly matters
      </p>
      <p style="font-size: 16px; font-weight: 600; color: #333; margin: 10px 0 0 0;">
        Estreewalla – Press to Impress
      </p>
    </div>

    <h2>OUR VISION</h2>
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 12px; border-left: 4px solid #ffc107; margin: 15px 0;">
      <p style="font-size: 16px; font-weight: 600; color: #856404; margin: 0; line-height: 24px;">
        ALTIVUS prophesies an evolved Earth where every soul rises with purpose, thrives in excellence, and serves the greater human journey.
      </p>
    </div>

    <h2>OUR MISSION</h2>
    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 12px; border-left: 4px solid #17a2b8; margin: 15px 0;">
      <p style="font-size: 16px; font-weight: 600; color: #0c5460; margin: 0; line-height: 24px;">
        Our mission is to cultivate a life of ease and dignity for consumers, while empowering every service provider with the right to rise, thrive in excellence, and serve a greater purpose.
      </p>
    </div>

   <h2 class="our-values-title">Our Values</h2>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 15px 0;">
      <h3 style="color: #007AFF; margin-top: 0; margin-bottom: 15px;">E P S I S</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 12px;">
          <strong style="color: #007AFF;">Empowerment</strong> – Uplifting both consumers and service providers to rise.
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color: #007AFF;">Purpose-Driven Innovation</strong> – Building solutions that serves a deeper human mission.
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color: #007AFF;">Simplicity</strong> – Creating intuitive, easy-to-use solutions
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color: #007AFF;">Inclusivity</strong> – Designing for all, accessible to everyone.
        </li>
        <li style="margin-bottom: 0;">
          <strong style="color: #007AFF;">Service to Society</strong> – Technology as a tool for collective upliftment.
        </li>
      </ul>
    </div>

    <div style="background-color: #007AFF; padding: 25px; border-radius: 12px; margin: 0px 0; text-align: center;">
      <h3 class="our-title" style="color: #fff; margin: 0 0 10px 0; font-size: 20px;">Altivus</h3>
      <p style="color: #fff; margin: 0; font-size: 16px; font-weight: 600;">
        Empowering Rise, Elevating Humanity
      </p>
    </div>

    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <h3 class="title" style="color: #333; margin-top: 0;">ALTIVUS SERVICES PVT. LTD.</h3>
      <p style="margin: 8px 0; color: #666;">
        A 501, Vinayak Paradise, B/S Punit Nagar, EME<br>
        Vadodara – 390008, Gujarat, India
      </p>
      <p style="margin: 8px 0; color: #666;">
        <strong>Email:</strong> altivus2025@gmail.com
      </p>
    </div>
  `;

  const tagsStyles = {
    body: {
      fontSize: 14,
      lineHeight: 22,
      color: '#333',
    },
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 0,
      marginBottom: 20,
      color: '#000',
      textAlign: 'center',
    },
    h2: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 15,
      color: '#000',
    },
    ourvaluestitle: {
      marginBottom: 0,  // override
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: '#000',
    },
    p: {
      marginBottom: 16,
      lineHeight: 22,
    },
    ul: {
      marginBottom: 16,
    },
    li: {
      marginBottom: 8,
      lineHeight: 20,
    },
    strong: {
      fontWeight: 'bold',
    },
  };

  const classesStyles = {
    'our-values-title': {
      marginBottom: 0,
      paddingBottom: 0,
    },
    'our-title': {
      marginTop: 0
    },
    'title': {
      marginTop: 10
    }
  };


  const systemFonts = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header
          title="About Us"
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: aboutUsContent }}
            tagsStyles={tagsStyles}
            classesStyles={classesStyles}
            systemFonts={systemFonts}
            enableExperimentalMarginCollapsing={true}
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
    padding: 20,
    paddingBottom: 40,
    paddingTop: 5
  },
});

export default AboutUsScreen;