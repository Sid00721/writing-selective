// src/app/page.tsx (Version: "The Final Touch" - Aiming for World-Class)

import Link from 'next/link';
import { ArrowRight, BarChart2, CheckCircle, Clock, Edit3, Heart, LogIn, MonitorPlay, NotebookPen, Star, TrendingUp, UserPlus, Users, Zap, Quote, Sparkles, Award } from 'lucide-react';

/* ==========================================================================
   COMPONENT: LandingPage
   --------------------------------------------------------------------------
   STRATEGY: Create an emotionally resonant journey for parents and students.
   Hook with aspiration, address pain points, present clear solutions/benefits,
   build trust, and drive conversion (signup) with minimal friction.
   DESIGN INTENT: Modern, clean, trustworthy, slightly playful ("kid-friendly professional").
   Utilizes purple/indigo gradients, dark contrast sections, refined spacing,
   subtle micro-interactions, and placeholders for high-impact custom visuals.
   Prioritizes mobile-first responsiveness and accessibility (focus states).
   ========================================================================== */
export default function LandingPage() {
  return (
    // Base styles with subtle background gradient
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-purple-50 to-indigo-50/60 font-sans antialiased">

      {/* --- Sticky Header w/ Scroll Effect Placeholder --- */}
      {/* TODO (JS Required): Implement scroll detection to add classes like 'bg-white/90 backdrop-blur-lg shadow-md' when scrolled down */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/70 sticky top-0 z-50 transition-all duration-300">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Branding */}
            <Link href="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-sm" aria-label="Selective Writer Home">
              SelectiveWriter {/* Concise & Professional */}
            </Link>

            {/* Auth Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Login Button */}
              <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-purple-700 bg-white hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-all duration-200"
                  title="Login to your account"
              >
                  <LogIn size={16} className="mr-1.5"/> Log In
              </Link>
              {/* Sign Up Button (Primary Header CTA) */}
              <Link
                  href="/signup"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all duration-300 ease-in-out"
                  title="Sign Up and Start Practicing"
              >
                 <UserPlus size={16} className="mr-1.5"/> Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow">

        {/* --- HERO SECTION --- */}
        {/* Intent: Immediately capture attention, convey core value proposition, build aspiration, provide clear primary CTA. */}
        <section className="relative bg-gradient-to-b from-purple-50/60 via-indigo-50/30 to-purple-100/30 overflow-hidden pt-24 pb-28 md:pt-32 md:pb-36 lg:pt-40 lg:pb-44">
           {/* Background Elements Placeholders - Needs CSS Animation Definitions */}
           <div aria-hidden="true" className="absolute inset-0 z-0 opacity-50">
              {/* Placeholder: Very subtle, slow animated gradient mesh */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/50 via-indigo-50/30 to-transparent animate-pulse-slower"></div>
              {/* Placeholder: Abstract SVG Shapes - Replace with actual SVGs */}
              <svg viewBox="0 0 100 100" className="absolute top-10 left-10 w-24 h-24 text-purple-200 animate-spin-slow opacity-60"><path d="M0,50 Q50,-20 100,50 T0,50 Z" fill="currentColor"/></svg>
              <svg viewBox="0 0 100 100" className="absolute bottom-10 right-10 w-32 h-32 text-indigo-200 animate-pulse-slow opacity-50"><path d="M50,0 Q100,50 50,100 Q0,50 50,0 Z" fill="currentColor"/></svg>
           </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
              {/* Text Content */}
              {/* TODO: Add AOS or Framer Motion for entrance animations */}
              <div className="text-center lg:text-left">
                {/* Headline: Benefit-driven, aspirational */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
                  <span className="block bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
                    Unlock Your Child&apos;s Potential.
                  </span>
                   <span className="block text-gray-800 mt-1 md:mt-2">
                      Master the Selective Writing Test.
                   </span>
                </h1>
                {/* Sub-headline: Elaborate on value, address parent/student needs */}
                <p className="mt-5 text-lg md:text-xl lg:text-2xl text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Give your child the ultimate advantage for the NSW Selective Schools Test. Unlimited, realistic practice tailored to the official exam format builds essential skills and unshakeable confidence.
                </p>
                 {/* Primary CTA - Benefit-oriented text */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:justify-center lg:justify-start">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base md:text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all duration-300 ease-in-out group"
                  >
                    Start Mastering Writing Today {/* Changed from "Free Trial" unless applicable */}
                    <ArrowRight size={22} className="ml-2.5 group-hover:translate-x-1.5 transition-transform duration-200"/>
                  </Link>
                </div>
                 {/* Social Proof */}
                 <p className="mt-8 text-sm text-purple-700/90 flex items-center justify-center lg:justify-start gap-1.5 font-medium">
                    <Users size={14}/> Join hundreds of prepared NSW students!
                 </p>
              </div>

              {/* Visual Placeholder - Emphasis on high quality */}
              <div className="mt-10 lg:mt-0">
                 <div className="relative group">
                    {/* Main Visual Container */}
                    <div className="relative aspect-[4/3] bg-white rounded-2xl shadow-2xl border border-purple-100/50 p-4 flex items-center justify-center overflow-hidden transform group-hover:scale-[1.03] transition-transform duration-500 ease-out cursor-pointer">
                        <p className="text-center text-purple-700 font-semibold p-6 z-10">
                           {/* TODO: Replace with HIGH-QUALITY custom asset */}
                           [Graphic Placeholder: Engaging illustration/animation. E.g., A diverse group of smiling, confident students receiving positive feedback on stylized app screens, perhaps with abstract &apos;success&apos; elements like upward arrows or stars integrated.]
                        </p>
                         {/* Subtle overlay effect */}
                         <div className="absolute inset-0 bg-gradient-to-t from-purple-100/30 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                     {/* Decorative element attached to graphic */}
                     {/* TODO: Replace with small, branded graphic element */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                       <Zap size={24}/>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Problem/Agitation + Solution Intro --- */}
        {/* Intent: Validate user concerns, create empathy, smoothly introduce the solution. */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Problem */}
                    {/* TODO: Add AOS or Framer Motion */}
                    <div className="text-center md:text-left">
                        <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">The Challenge</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-5 tracking-tight leading-snug">
                            Feeling the Pressure of the Selective Writing Test?
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            It demands more than just good writing – it requires strategy, speed, and confidence under strict timed conditions. Standard practice often doesn&apos;t replicate this unique pressure, leaving students feeling unsure and potentially losing crucial marks.
                        </p>
                         {/* Placeholder: Subtle graphic element - maybe distressed lines */}
                         <div className="h-1 w-20 bg-red-200 rounded-full mx-auto md:mx-0 mt-4"></div>
                    </div>
                    {/* Solution */}
                    {/* TODO: Add AOS or Framer Motion with delay */}
                    <div className="text-center md:text-left">
                         <div className="p-8 bg-white rounded-xl border border-purple-100 shadow-xl relative transform hover:scale-[1.03] transition-transform duration-300">
                            {/* Decorative element */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-lg transform -rotate-12 flex items-center justify-center text-white shadow-md"><CheckCircle size={24}/></div>
                            <h3 className="text-2xl font-semibold text-purple-700 mb-4 mt-5">
                                The Solution: <span className="block md:inline">Practice That Performs.</span>
                            </h3>
                             <p className="text-gray-700 mb-4 leading-relaxed">
                                Our platform is meticulously designed to mirror the exact NSW Selective Test conditions, providing unlimited, focused practice that builds true exam readiness.
                             </p>
                             <Link href="/#features" className="text-sm font-medium text-purple-600 hover:text-purple-800 inline-flex items-center group">
                                See How It Works <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                             </Link>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Enhanced Features Section (Dark) --- */}
        {/* Intent: Detail the core benefits with visual appeal and micro-interactions. Build desire. */}
        <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-800 to-gray-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div aria-hidden="true" className="absolute inset-0 z-0 mix-blend-soft-light">
              {/* Placeholder: Subtle animated geometric pattern or particle field */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('/path/to/subtle-pattern.svg')]"></div>
            </div>
            {/* Foreground Sparkles - Use actual SVGs */}
            <div className="absolute top-16 left-1/4 w-8 h-8 text-purple-400 opacity-50 animate-pulse-slower"> {/* Placeholder */} <Star strokeWidth={1}/> </div>
            <div className="absolute bottom-16 right-1/4 w-10 h-10 text-indigo-300 opacity-40 animate-pulse-slow animation-delay-500"> {/* Placeholder */} <Sparkles strokeWidth={1}/> </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Core Features</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-indigo-300 mt-2 mb-5">
                Your Toolkit for Writing Success
              </h2>
              <p className="text-lg lg:text-xl text-purple-200 opacity-90">
                 From mastering genres to beating the clock, here’s how we help your child excel.
              </p>
            </div>

            {/* Enhanced Features Grid - AOS placeholders added */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card Template - Apply AOS attributes for staggered entrance */}
              <div className="text-center p-6 bg-gradient-to-br from-gray-700/70 to-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-800/40 hover:border-purple-500/80 hover:bg-gray-700/90 hover:shadow-purple-600/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out group"
                   data-aos="fade-up" data-aos-duration="600">
                {/* Icon with Gradient Border */}
                <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6 shadow-lg p-0.5 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                   <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center"> <Clock size={32} strokeWidth={1.5} className="text-purple-300 group-hover:text-white transition-colors duration-300"/> </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Build Exam Stamina</h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-300"> Master the 30-minute time limit with realistic, timed practice sessions. No more rushing! </p>
              </div>
              {/* Card 2 */}
               <div className="text-center p-6 bg-gradient-to-br from-gray-700/70 to-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-800/40 hover:border-purple-500/80 hover:bg-gray-700/90 hover:shadow-purple-600/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out group"
                    data-aos="fade-up" data-aos-duration="600" data-aos-delay="150">
                 <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6 shadow-lg p-0.5 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-300">
                   <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center"> <Edit3 size={32} strokeWidth={1.5} className="text-purple-300 group-hover:text-white transition-colors duration-300"/> </div>
                 </div>
                 <h3 className="text-xl font-semibold text-white mb-3">Conquer Every Genre</h3>
                 <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors"> Practice Creative, Persuasive, Article, Diary, News Report & more. Be ready for anything. </p>
               </div>
               {/* Card 3 */}
               <div className="text-center p-6 bg-gradient-to-br from-gray-700/70 to-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-800/40 hover:border-purple-500/80 hover:bg-gray-700/90 hover:shadow-purple-600/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out group"
                    data-aos="fade-up" data-aos-duration="600" data-aos-delay="300">
                 <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6 shadow-lg p-0.5 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center"> <BarChart2 size={32} strokeWidth={1.5} className="text-purple-300 group-hover:text-white transition-colors duration-300"/> </div>
                 </div>
                 <h3 className="text-xl font-semibold text-white mb-3">See Real Improvement</h3>
                 <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors"> Review past submissions, understand strengths, and pinpoint areas needing focus. </p>
               </div>
               {/* Card 4 */}
               <div className="text-center p-6 bg-gradient-to-br from-gray-700/70 to-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-800/40 hover:border-purple-500/80 hover:bg-gray-700/90 hover:shadow-purple-600/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out group"
                    data-aos="fade-up" data-aos-duration="600" data-aos-delay="450">
                 <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6 shadow-lg p-0.5 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center"> <Award size={32} strokeWidth={1.5} className="text-purple-300 group-hover:text-white transition-colors duration-300"/> </div>
                 </div>
                 <h3 className="text-xl font-semibold text-white mb-3">Gain Test Day Confidence</h3>
                 <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors"> Familiarize completely with the digital format and timing, reducing exam anxiety. </p>
               </div>
            </div>
          </div>
        </section>

         {/* --- Social Proof / Testimonials Section --- */}
         {/* Intent: Build trust and credibility through relatable experiences. */}
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
                    Trusted by Parents & Students Across NSW
                </h2>
                <p className="text-lg text-center text-gray-500 mb-16 max-w-2xl mx-auto">See how targeted practice makes a difference.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Testimonial Card Template - AOS placeholders added */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl flex flex-col items-start transform hover:scale-[1.03] transition-transform duration-300"
                         data-aos="fade-right" data-aos-duration="700">
                         {/* Avatar Placeholder */}
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4 flex items-center justify-center shadow-inner">
                            {/* TODO: Replace with actual user avatar/photo if possible, or initials */}
                             <span className="text-lg font-semibold text-purple-700">SJ</span>
                         </div>
                         {/* Star Rating */}
                         <div className="flex text-yellow-400 mb-3"> <Star fill="currentColor" size={18}/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> </div>
                        <Quote className="w-8 h-8 text-purple-200 mb-3" strokeWidth={1}/>
                        <p className="text-gray-600 italic mb-5 flex-grow">&quot;The timed practice was a game-changer. My daughter felt so much more prepared on test day!&quot;</p>
                        <p className="font-semibold text-purple-800">- Sarah J. (Parent)</p>
                    </div>
                    {/* Testimonial 2 */}
                     <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl flex flex-col items-start transform hover:scale-[1.03] transition-transform duration-300"
                          data-aos="fade-up" data-aos-duration="700" data-aos-delay="150">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4 flex items-center justify-center shadow-inner"> <span className="text-lg font-semibold text-purple-700">DL</span> </div>
                         <div className="flex text-yellow-400 mb-3"> <Star fill="currentColor" size={18}/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> </div>
                        <Quote className="w-8 h-8 text-purple-200 mb-3" strokeWidth={1}/>
                        <p className="text-gray-600 italic mb-5 flex-grow">&quot;I actually found writing practice fun here! Trying all the different genres really helped me think faster.&quot;</p>
                        <p className="font-semibold text-purple-800">- David L. (Year 6 Student)</p>
                    </div>
                     {/* Testimonial 3 */}
                     <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl flex flex-col items-start transform hover:scale-[1.03] transition-transform duration-300"
                          data-aos="fade-left" data-aos-duration="700" data-aos-delay="300">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4 flex items-center justify-center shadow-inner"> <span className="text-lg font-semibold text-purple-700">MP</span> </div>
                         <div className="flex text-yellow-400 mb-3"> <Star fill="currentColor" size={18}/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star fill="currentColor" size={18} className="ml-0.5"/> <Star className="text-gray-300 w-4 h-4 ml-0.5"/> </div> {/* 4.5 stars example */}
                        <Quote className="w-8 h-8 text-purple-200 mb-3" strokeWidth={1}/>
                        <p className="text-gray-600 italic mb-5 flex-grow">&quot;Seeing the submission history made it easy to track progress. Highly recommend this platform for selective prep.&quot;</p>
                        <p className="font-semibold text-purple-800">- Michael P. (Parent)</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Final CTA Section --- */}
        {/* Intent: Overcome final hesitation, summarize value, provide clear final action. */}
         <section className="bg-gradient-to-tr from-purple-50 via-indigo-100 to-white py-20 md:py-28 relative overflow-hidden">
             {/* Background Elements */}
            <div aria-hidden="true" className="absolute inset-0 z-0 opacity-40">
                <div className="absolute bottom-0 left-1/4 -mb-20 w-64 h-64 bg-purple-100/70 rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-1/4 -mt-20 w-56 h-56 bg-indigo-100/70 rounded-lg transform rotate-12 blur-2xl"></div>
            </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
               data-aos="zoom-in" data-aos-duration="800">
            <div className="max-w-3xl mx-auto">
               {/* Graphic Placeholder - Success/Goal Oriented */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white transform hover:scale-110 transition-transform duration-300">
                         {/* TODO: Replace with a custom "Success" or "Target Achieved" icon/illustration */}
                        <Award size={48} strokeWidth={1.5} />
                    </div>
                </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Give Your Child the Edge They Deserve.
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 mb-10 leading-relaxed">
                 Invest in their confidence and writing mastery. Join SelectiveWriter today and take the stress out of selective test preparation. Unlimited practice awaits.
              </p>
              {/* Final, Strong CTA */}
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1.5 active:scale-95 transition-all duration-300 ease-in-out group"
              >
                Sign Up & Unlock Unlimited Practice
                <ArrowRight size={22} className="ml-2.5 group-hover:translate-x-1.5 transition-transform duration-200"/>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* --- Enhanced Footer --- */}
      <footer className="bg-gray-900 text-gray-400 text-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
               {/* Column 1: Brand & Copyright */}
               <div className="space-y-3">
                   <Link href="/" className="text-xl font-bold text-purple-400 hover:text-purple-300 transition-colors inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 rounded-sm" aria-label="Selective Writer Home">
                     SelectiveWriter
                   </Link>
                   <p className="text-xs text-gray-500 leading-relaxed">
                     &copy; {new Date().getFullYear()} selectivewritingtest.com.au. <br className="hidden sm:inline"/>Focused Practice for NSW Selective Success.
                   </p>
               </div>
                {/* Column 2: Quick Links */}
               <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-xs">Navigation</h4>
                    <ul className="space-y-2">
                        {/* <li><Link href="/#features" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Features</Link></li> */}
                        <li><Link href="/pricing" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Pricing</Link></li>
                        <li><Link href="/signup" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Sign Up</Link></li>
                        <li><Link href="/login" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Log In</Link></li>
                    </ul>
               </div>
                {/* Column 3: Legal */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-xs">Legal</h4>
                    <ul className="space-y-2">
                        <li><Link href="/privacy" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-purple-300 focus:outline-none focus-visible:text-purple-300 focus-visible:underline transition-colors">Terms of Service</Link></li>
                    </ul>
               </div>
           </div>
        </div>
      </footer>
    </div>
  );
}


/* --- CSS Animation & Utility Definitions (Add to globals.css or tailwind.config.js) ---

@layer utilities {
  .animation-delay-150 { animation-delay: 150ms; }
  .animation-delay-200 { animation-delay: 200ms; }
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-400 { animation-delay: 400ms; }
  .animation-delay-450 { animation-delay: 450ms; }
  .animation-delay-500 { animation-delay: 500ms; }
  .animation-delay-600 { animation-delay: 600ms; }
  .animation-delay-700 { animation-delay: 700ms; }
  .animation-delay-1000 { animation-delay: 1000ms; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slower {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.03); }
}
.animate-pulse-slower {
  animation: pulse-slower 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 25s linear infinite;
}

@keyframes spin-gentle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-gentle {
  animation: spin-gentle 40s linear infinite;
}


@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}
// Apply this class directly OR use data-aos="fade-up" if using AOS library
.animate-fade-in-up {
   animation: fade-in-up 0.7s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards; // Smoother ease
   opacity: 0; // Start hidden
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
// Apply this class directly OR use data-aos="fade-in" if using AOS library
.animate-fade-in {
   animation: fade-in 0.9s ease-out forwards;
   opacity: 0;
}

// Example Gradient Border using Pseudo-elements (Add to globals.css)
// Apply the class .gradient-border-hover to the card div
// .gradient-border-hover { position: relative; z-index: 0; }
// .gradient-border-hover::before {
//   content: '';
//   position: absolute;
//   inset: -1px; // Controls border thickness
//   padding: 1px; // Must match inset
//   border-radius: 1.1rem; // Should match parent's rounded-2xl (or slightly larger)
//   background: linear-gradient(to bottom right, theme('colors.purple.500'), theme('colors.indigo.500'));
//   -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
//           mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
//   -webkit-mask-composite: xor;
//           mask-composite: exclude;
//   z-index: -1; // Place behind content
//   opacity: 0;
//   transition: opacity 300ms ease-in-out;
// }
// .gradient-border-hover:hover::before {
//   opacity: 0.7; // Adjust opacity on hover
// }

*/