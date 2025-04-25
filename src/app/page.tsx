// src/app/page.tsx (Hiroshi Nagai Inspired Landing Page)
import Link from 'next/link';
// Simple, clean icons. Consider replacing with custom Nagai-style SVGs later.
import { Clock, Edit3, ListChecks, Award, LogIn, UserPlus, ArrowRight, BookOpen, Sun } from 'lucide-react';

export default function LandingPage() {
  // Define base colors (Tailwind classes) - Adjust specific shades as needed
  const colors = {
    skyBlue: 'bg-gradient-to-b from-sky-400 to-sky-500', // For Hero background
    lightBlue: 'bg-sky-50', // For alternating sections
    white: 'bg-white',
    accentPink: 'bg-pink-400',
    accentYellow: 'bg-yellow-300',
    textDark: 'text-slate-800', // Dark text for light backgrounds
    textLight: 'text-white', // Light text for colored backgrounds
    buttonPrimaryBg: 'bg-pink-400 hover:bg-pink-500', // Example accent
    buttonPrimaryText: 'text-white',
    buttonSecondaryBg: 'bg-white',
    buttonSecondaryText: 'text-sky-600',
    iconColor: 'text-sky-600', // Color for icons on white cards
  };

  return (
    // Use a clean white base, sections will provide color blocks
    <div className={`flex flex-col min-h-screen ${colors.white} font-sans`}> {/* Ensure a clean sans-serif font is set globally */}

      {/* --- Header --- */}
      {/* Style: Minimalist, clean, sharp lines */}
      <header className={`${colors.white} border-b border-slate-200 sticky top-0 z-50`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* Logo/Brand Text - Simple & Clean */}
            <Link href="/" className={`text-2xl font-bold ${colors.buttonSecondaryText} hover:opacity-80 transition-opacity`}>
              SelectiveWriter {/* Or your chosen name */}
            </Link>

            {/* Auth Links - Simple Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                  href="/login"
                  className={`hidden sm:inline-flex items-center px-4 py-1.5 border border-slate-300 text-sm font-medium rounded-md ${colors.buttonSecondaryText} ${colors.buttonSecondaryBg} hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sky-400 transition-colors`}
              >
                  <LogIn size={16} className="mr-1"/> Log In
              </Link>
              <Link
                  href="/signup"
                  className={`inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${colors.buttonPrimaryText} ${colors.buttonPrimaryBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500 transition-colors`}
              >
                 <UserPlus size={16} className="mr-1"/> Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow">

        {/* --- Hero Section --- */}
        {/* Style: Expansive blue sky, clean text, central graphic, high contrast */}
        <section className={`relative ${colors.skyBlue} overflow-hidden py-28 md:py-40 lg:py-48 text-center`}>
           {/* Placeholder: Subtle geometric lines or sun rays in background */}
           <div aria-hidden="true" className="absolute inset-0 z-0 opacity-10">
                {/* Example: faint grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.white/0.1)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.white/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
           </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Headline: Clean, bold, white text */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold ${colors.textLight} tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm`}>
              Unlimited Selective Writing Practice
            </h1>
            {/* Sub-headline: Concise, clear */}
            <p className={`mt-5 text-lg md:text-xl ${colors.textLight} opacity-90 max-w-2xl mx-auto`}>
              Master every genre and build confidence with realistic, timed exercises for the NSW Selective Test.
            </p>
            {/* Graphic Placeholder: Central, clean, stylized */}
            <div className="mt-10 mb-10 max-w-xl mx-auto">
               {/* TODO: Replace with a custom Hiroshi Nagai -style illustration */}
               {/* Style Suggestion: Clean vector art of a student at a minimalist desk looking towards a bright window/sky, or a symbolic 'path to success' graphic using clean lines and the core color palette. */}
              <div className={`aspect-video ${colors.white}/30 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center border border-white/20`}>
                <p className={`${colors.textLight} font-medium opacity-75`}>[Graphic Placeholder: Nagai-Style Illustration]</p>
              </div>
            </div>
             {/* Primary CTA Button */}
            <Link
              href="/signup"
              className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md ${colors.buttonPrimaryText} ${colors.accentYellow} hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-500 focus-visible:ring-white transition active:scale-95`} // Yellow button example
            >
              Start Practicing Now <ArrowRight size={20} className="ml-2"/>
            </Link>
          </div>
        </section>

        {/* --- Features Section --- */}
        {/* Style: Clean white cards, alternating light blue/white backgrounds, simple icons */}
        <section id="features" className={`py-16 md:py-24 ${colors.lightBlue}`}> {/* Light blue background */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold ${colors.textDark} mb-4`}>
                Designed for Success
              </h2>
              <p className={`text-lg text-slate-600`}>
                Focused features to help you excel in the specific demands of the NSW selective writing exam.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Feature Card Template (Apply to all 4) */}
              <div className={`${colors.white} p-6 rounded-lg shadow-sm border border-slate-100 transition-shadow hover:shadow-md`}>
                 {/* Icon Placeholder: Use simple, clean Lucide icons or custom Nagai-style SVGs */}
                 <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${colors.accentPink}/20`}>
                    {/* TODO: Replace with consistent custom icons if possible */}
                    <Clock size={28} className={`${colors.buttonSecondaryText}`} strokeWidth={2}/>
                 </div>
                 <h3 className={`text-lg font-semibold ${colors.textDark} mb-2`}>Timed Conditions</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Practice under the official 30-min limit to build speed, focus, and exam endurance.
                 </p>
              </div>
              {/* Card 2 */}
              <div className={`${colors.white} p-6 rounded-lg shadow-sm border border-slate-100 transition-shadow hover:shadow-md`}>
                 <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${colors.accentPink}/20`}>
                    <Edit3 size={28} className={`${colors.buttonSecondaryText}`} strokeWidth={2}/>
                 </div>
                 <h3 className={`text-lg font-semibold ${colors.textDark} mb-2`}>All Official Genres</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Master Creative, Persuasive, Article, Diary, and News Report formats specified by NSW tests.
                 </p>
              </div>
              {/* Card 3 */}
              <div className={`${colors.white} p-6 rounded-lg shadow-sm border border-slate-100 transition-shadow hover:shadow-md`}>
                 <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${colors.accentPink}/20`}>
                   <ListChecks size={28} className={`${colors.buttonSecondaryText}`} strokeWidth={2}/>
                 </div>
                 <h3 className={`text-lg font-semibold ${colors.textDark} mb-2`}>Review & Improve</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Access your submission history to track progress and identify areas for refinement.
                 </p>
              </div>
               {/* Card 4 */}
               <div className={`${colors.white} p-6 rounded-lg shadow-sm border border-slate-100 transition-shadow hover:shadow-md`}>
                 <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${colors.accentPink}/20`}>
                   <BookOpen size={28} className={`${colors.buttonSecondaryText}`} strokeWidth={2}/>
                 </div>
                 <h3 className={`text-lg font-semibold ${colors.textDark} mb-2`}>Unlimited Prompts</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Never run out of practice with our large and growing library of unique writing tasks.
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        {/* Style: Simple, clean, maybe sunset gradient or solid color block */}
        <section className={`py-16 md:py-24 ${colors.white}`}> {/* White background */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
             {/* Graphic Placeholder */}
             <div className="mb-8">
                 {/* TODO: Replace with custom Nagai-style graphic */}
                 {/* Style Suggestion: Minimalist illustration of a diploma or upward graph with clean lines/colors */}
                 <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colors.accentYellow}/30 mb-4`}>
                    <Award size={40} className={`${colors.buttonSecondaryText}`} strokeWidth={1.5}/>
                 </div>
             </div>
            <h2 className={`text-3xl md:text-4xl font-bold ${colors.textDark} max-w-2xl mx-auto mb-5`}>
              Start Your Path to Writing Success Today
            </h2>
            <p className={`text-lg text-slate-600 max-w-xl mx-auto mb-8`}>
               Gain the confidence and skills needed to excel. Sign up now for unlimited practice.
            </p>
            <Link
              href="/signup"
              className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md ${colors.buttonPrimaryText} ${colors.buttonPrimaryBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500 transition active:scale-95`}
            >
              Sign Up & Start Practicing
            </Link>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      {/* Style: Minimalist, clean lines */}
      <footer className={`${colors.lightBlue} border-t border-slate-200`}> {/* Light background */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-sm ${colors.buttonSecondaryText} opacity-80`}>
                &copy; {new Date().getFullYear()} SelectiveWriter (selectivewritingtest.com.au)
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                 <Link href="/privacy" className={`text-xs ${colors.buttonSecondaryText} hover:underline opacity-70 hover:opacity-100 transition-opacity`}>Privacy Policy</Link>
                 <Link href="/terms" className={`text-xs ${colors.buttonSecondaryText} hover:underline opacity-70 hover:opacity-100 transition-opacity`}>Terms of Service</Link>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --- Notes for Asset Creation ---
1.  Hero Graphic: Needs a clean, vector illustration. Focus on clarity, path, success, maybe a stylized student. Use bright blues, white, maybe pink/yellow accents. Flat style, minimal detail.
2.  Feature Icons: Create simple, custom SVG icons for Clock, Edit3, ListChecks, BookOpen in a consistent Nagai-esque style (clean lines, minimal form, maybe filled shapes with accent colors).
3.  CTA Graphic: Another simple, symbolic graphic like a certificate, star, or upward trend arrow, matching the style.
4.  Favicon/Logo: Create a simple, clean logo/favicon reflecting the brand name and style.
5.  Font: Consider using 'Poppins', 'Montserrat', or 'Lato' via next/font in layout.tsx for the clean sans-serif feel.
*/