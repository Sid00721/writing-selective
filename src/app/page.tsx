// src/app/page.tsx

import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar'; // Import the StatsBar component
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'; // Import the new component
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'; 
import { PricingSection } from '@/components/landing/PricingSection'; // Import the new component
import { FAQSection } from '@/components/landing/FAQSection'; // Import the new component
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

// Data for the Hero Section
const heroData = {
  headline: "Unlimited Practice for NSW Selective Schools Writing Tests",
  subHeadline: "Improve your writing skills with hundreds of practice prompts, detailed feedback, and personalized analytics designed specifically for the NSW Selective Schools Test.",
  primaryCta: { text: "Get Started", href: "/signup" }, // Updated CTA text
  secondaryCta: { text: "Learn More", href: "#features" },
  image: {
    // IMPORTANT: Replace with your actual image path in the /public directory
    src: "/images/landingpage.png", // <<--- UPDATE THIS
    alt: "Students preparing for NSW Selective Schools writing tests",
    width: 800, // <<--- UPDATE THIS to your image's actual width
    height: 800, // <<--- UPDATE THIS to your image's actual height
  },
  badgeText: "Students Helped 5,000+",
  finePrint: undefined, // Trial fine print removed
};

// Data for the Stats Bar (using default from StatsBar.tsx component, but could be defined here)
// If you fetch dynamic data for one of these, you'd construct this array with the fetched value.
// For example:
// const dynamicStatsData = [
//   { id: 1, icon: <UsersIconPlaceholder />, value: fetchedUserCount + "+", label: "Students Served" },
//   { id: 2, icon: <CheckIconPlaceholder />, value: "92%", label: "Success Rate" },
//   // ... etc.
// ];

export default function LandingPage() {
  return (
    <div>
      <Header />

      <HeroSection
        headline={heroData.headline}
        subHeadline={heroData.subHeadline}
        primaryCta={heroData.primaryCta}
        secondaryCta={heroData.secondaryCta}
        image={heroData.image}
        badgeText={heroData.badgeText}
        finePrint={heroData.finePrint}
      />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection subtitle="One simple plan with all the features you need." /> {/* Render the PricingSection; uses default plan or pass custom 'plans' prop */}
      <FAQSection /> 
      <FinalCTASection />   
      <Footer brandName="Selective Writing" startYear={2024} /> 
    </div>
  );
}

