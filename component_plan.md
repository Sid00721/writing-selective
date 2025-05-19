# Component Plan: Selective Writing Test Platform

This document outlines the key UI components for the Selective Writing Test platform, their structure, props, and general styling guidelines. It serves as a reference for maintaining UI consistency and planning new features.

---

## Component: Header (Landing Page)

**Description:** The main navigation header for the public-facing landing page.

**Elements:**
- Brand Name/Logo ("Selective Writing")
- Navigation Links
- Authentication Buttons

**Props:**
- `brandName`: String (default: "Selective Writing")
- `navLinks`: Array of objects (`{ text: String, href: String }`)

**Styling (Tailwind indicative classes):**
- **Container:** `bg-white shadow-sm sticky top-0 z-50`
- **Layout:** `container mx-auto px-6 py-4 md:px-8 lg:px-16 flex items-center justify-between`
- **Brand Name:** `text-2xl font-bold text-gray-800`
- **Nav Links (Desktop):** `hidden md:flex items-center space-x-2 lg:space-x-4`
  - **Individual Link:** `px-3 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-md text-sm lg:text-base`
- **Auth Buttons Container (Desktop):** `hidden md:flex items-center space-x-3`
  - **Primary Button Style (for Log In & Sign Up):** `bg-gray-800 text-white hover:bg-gray-700 transition-colors px-4 py-2 rounded-md text-sm font-medium`
- **Mobile Menu Button:** `md:hidden text-gray-600 hover:text-gray-800 focus:outline-none`
- **Mobile Menu Panel:** `md:hidden border-t border-gray-200`
  - **Mobile Nav Link:** `block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md`
  - **Mobile Auth Buttons:** Stacked, full-width, primary button style.

**Mobile Responsiveness:**
- Navigation links and auth buttons collapse into a hamburger menu.

---

## Component: HeroSection (Landing Page)

**Description:** The main hero section for the landing page, typically appearing below the header.

**Elements:**
- Main Headline
- Sub-headline/Descriptive Text
- Primary Call-to-Action Button
- Optional Secondary Call-to-Action Link/Button
- Main Image
- Optional Badge on Image
- Optional Fine Print Text below CTAs

**Props:**
- `headline`: String
- `subHeadline`: String
- `primaryCta`: Object (`{ text: String, href: String }`)
- `secondaryCta?`: Object (`{ text: String, href: String }`) (optional)
- `image`: Object (`{ src: String, alt: String, width: Number, height: Number }`) (width & height for Next/Image)
- `badgeText?`: String (optional)
- `finePrint?`: String (optional)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-white py-16 md:py-20 lg:py-28`
- **Layout:** Two-column (text left, image right) on `md` and up, stacks on mobile. `container mx-auto px-6 md:px-8 lg:px-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16`
- **Text Column:** `md:w-1/2 lg:w-3/5 text-center md:text-left`
- **Image Column:** `md:w-1/2 lg:w-2/5 mt-10 md:mt-0 w-full`
  - **Image Wrapper:** `relative aspect-[4/3] sm:aspect-[5/3.5] md:aspect-auto md:h-full max-h-[300px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[500px]`
- **Headline:** `text-4xl sm:text-5xl lg:text-[56px] font-bold text-gray-900 leading-tight -tracking-[0.02em]`
- **Sub-headline:** `mt-5 text-lg sm:text-xl text-gray-700 max-w-xl mx-auto md:mx-0`
- **CTA Container:** `mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4`
- **Primary CTA Button:** (Uses primary button style) `inline-block bg-gray-800 text-white hover:bg-gray-700 transition-colors px-8 py-3 rounded-lg text-base sm:text-lg font-medium shadow-md w-full sm:w-auto`
- **Secondary CTA Link:** `inline-flex items-center text-gray-700 hover:text-gray-900 font-medium text-base sm:text-lg group w-full sm:w-auto justify-center`
  - **Arrow on Secondary CTA:** `ml-2 transition-transform group-hover:translate-x-1`
- **Image:** `object-cover rounded-xl shadow-xl` (used with Next/Image `fill`)
- **Badge on Image:** `absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md shadow`
- **Fine Print:** `mt-5 text-xs text-gray-500 text-center md:text-left`

**Mobile Responsiveness:**
- Columns stack. Text content and CTAs may center for mobile in stacked view.

---

## Component: StatsBar (Landing Page)

**Description:** Displays key statistics or social proof in a horizontal bar.

**Elements:**
- Optional Section Title
- Row of individual Stat Items

**Props for `StatsBar`:**
- `title?`: String (default: "Trusted by Students Across NSW")
- `stats?`: Array of `StatItemProps` (defaults to pre-defined static stats if not provided)

**Props for `StatItem` (as part of `stats` array):**
- `id`: String | Number (for React key)
- `icon?`: React.ReactNode (Optional: for an SVG icon component or pre-styled icon component)
- `value`: String (e.g., "5,000+", "92%")
- `label`: String (e.g., "Students Served")

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-slate-50 py-16 md:py-20 lg:py-24`
- **Layout:** `container mx-auto px-6 md:px-8 lg:px-16`
- **Title:** `text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12 md:mb-16`
- **Stats Grid:** `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 lg:gap-x-8`
- **Stat Item Container:** `text-center flex flex-col items-center`
  - **Icon Display Area:** `mb-4 h-16 w-16 flex items-center justify-center` (placeholder styling; actual icon component will define its appearance)
  - **Stat Value:** `text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900`
  - **Stat Label:** `text-sm md:text-base text-gray-600 mt-2`

**Mobile Responsiveness:**
- Grid columns adjust (e.g., 2 columns on small screens, 4 on medium and up).

---

## Component: FeaturesSection (Landing Page)

**Description:** Highlights the key features of the platform, displayed as cards.

**Elements:**
- Section Title
- Section Subtitle
- Grid of Feature Item Cards

**Props for `FeaturesSection`:**
- `title?`: String (default: "Everything You Need to Succeed")
- `subtitle?`: String (default: "Our platform provides comprehensive tools...")
- `features?`: Array of `FeatureItemProps` (defaults to pre-defined static features if not provided)

**Props for `FeatureItem` (as part of `features` array):**
- `id`: String | Number
- `icon?`: React.ReactNode (e.g., an SVG icon component)
- `name`: String
- `description`: String

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-white py-16 md:py-20 lg:py-24` (add `id="features"` for in-page linking)
- **Section Header (Title & Subtitle):** `text-center mb-12 md:mb-16 lg:mb-20`
  - **Title:** `text-3xl sm:text-4xl font-bold text-gray-900`
  - **Subtitle:** `mt-4 text-lg text-gray-700 max-w-3xl mx-auto`
- **Features Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10`
-**Feature Item Card:** `flex flex-col items-start text-left p-6 border-2 border-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out` (Dark prominent border)
  - **Icon Display Area:** `mb-4 h-10 w-10 flex items-center justify-center`
  - **Feature Name (h3):** `text-xl font-semibold text-gray-800`
  - **Feature Description (p):** `mt-1 text-base text-gray-600 leading-relaxed`

**Mobile Responsiveness:**
- Grid columns adjust (e.g., 1 on extra small, 2 on small, 3 on large screens).


## Component: HowItWorksSection (Landing Page)

**Description:** Explains the platform's process in a few simple steps.

**Elements:**
- Section Title
- Section Subtitle (optional)
- A series of Step Items
- Call-to-Action Button

**Props for `HowItWorksSection`:**
- `title?`: String (default: "How It Works")
- `subtitle?`: String (default: "Our simple four-step process...")
- `steps`: Array of `StepItemProps`
- `ctaText?`: String (default: "Get Started Today")
- `ctaLink?`: String (default: "/signup")

**Props for `StepItem` (as part of `steps` array):**
- `id`: String | Number
- `number`: String (e.g., "1", "01")
- `name`: String (e.g., "Sign Up")
- `description`: String
- `icon?`: React.ReactNode (SVG icon component, positioned to the right of the title as per PDF)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-white py-16 md:py-20 lg:py-24`
- **Section Header (Title & Subtitle):** `text-center mb-12 md:mb-16 lg:mb-20`
  - **Title:** `text-3xl sm:text-4xl font-bold text-gray-900`
  - **Subtitle:** `mt-4 text-lg text-gray-600 max-w-3xl mx-auto`
**Steps Container:** `max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-8 md:gap-10` (Wider max-width)
- **Step Item Container:** `flex items-center gap-4 sm:gap-6 md:gap-8 py-2` (No border, layout for [Number] [Text] [Icon])
  - **Step Number Display:** `flex-none w-10 sm:w-12 text-2xl sm:text-3xl font-bold text-gray-700 text-left` (Darker, no background, larger)
  - **Step Text Content:** `flex-1 text-left`
    - **Step Name (h3):** `text-lg sm:text-xl font-semibold text-gray-800`
    - **Step Description (p):** `text-sm sm:text-base text-gray-600 leading-relaxed mt-1`
  - **Step Icon Display:** `flex-none`
    - **Icon:** `text-gray-600` (adjust size, e.g., Lucide `size={28}` or `size={32}`)
- **CTA Button Container:** `mt-12 md:mt-16 text-center`
  - **CTA Button:** (Primary button style) `px-8 py-3 text-lg`

**Visual Connectors (Advanced):**
- The dashed/dotted lines with arrows connecting offset step cards in the PDF are a more complex styling challenge. For this version, we'll focus on clear vertical separation. Implementing exact graphical connectors could be an enhancement using SVGs or pseudo-elements.
---

## Component: TestimonialsSection (Landing Page)

**Description:** Displays testimonials from parents, educators, or students.

**Elements:**
- Section Title
- Section Subtitle (optional)
- Grid of Testimonial Cards

**Props for `TestimonialsSection`:**
- `title?`: String (default: "What Parents & Educators Say")
- `subtitle?`: String (default: "Don't just take our word for it...")
- `testimonials`: Array of `TestimonialItemProps`

**Props for `TestimonialItem` (as part of `testimonials` array):**
- `id`: String | Number
- `quote`: String
- `name`: String
- `role`: String
- `rating`: Number (e.g., 1 to 5)
- `avatar?`: String (Optional URL for an avatar image)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-slate-50 py-16 md:py-20 lg:py-24` (Slightly off-white background for contrast)
- **Section Header (Title & Subtitle):** `text-center mb-12 md:mb-16 lg:mb-20`
  - **Title:** `text-3xl sm:text-4xl font-bold text-gray-900`
  - **Subtitle:** `mt-4 text-lg text-gray-600 max-w-3xl mx-auto`
- **Testimonials Grid:** `grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10`
- **Testimonial Card:** `bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-gray-800 flex flex-col` (Enhanced card style with prominent dark border)
  - **Star Rating Container:** `flex items-center mb-4`
    - **Star Icon (Filled):** `text-yellow-400 h-5 w-5` or `text-amber-400`
    - **Star Icon (Empty):** `text-gray-300 h-5 w-5`
  - **Quote (p or blockquote):** `text-gray-700 italic text-base md:text-lg leading-relaxed flex-grow`
  - **Attribution Container:** `mt-6 pt-4 border-t border-gray-200` (Optional border for separation)
    - **Avatar (img, optional):** `w-10 h-10 rounded-full mr-3`
    - **Name (p):** `font-semibold text-gray-800`
    - **Role (p):** `text-sm text-gray-500`

**Mobile Responsiveness:**
- Grid columns adjust (e.g., 1 column on small screens, 2 on medium and up).

## Component: PricingSection (Landing Page)

**Description:** Displays pricing plans for the platform.

**Elements:**
- Section Title
- Optional Section Subtitle
- Grid of Pricing Plan Cards

**Props for `PricingSection`:**
- `title?`: String (default: "Simple, Transparent Pricing")
- `subtitle?`: String (optional, e.g., "Choose the plan that's right for you.")
- `plans`: Array of `PricingPlanItemProps`

**Props for `PricingPlanItem` (as part of `plans` array):**
- `id`: String | Number
- `name`: String (e.g., "Complete Package")
- `price`: String (e.g., "$19.99")
- `frequency`: String (e.g., "/ month")
- `description?`: String (optional, a short description of the plan)
- `features`: String[] (Array of feature strings included in the plan)
- `ctaText`: String (e.g., "Sign Up Now")
- `ctaLink`: String (e.g., "/signup?plan=complete")
- `isFeatured?`: Boolean (Optional, to highlight a specific plan with different styling)
- `borderColor?`: String (Optional Tailwind class, e.g., `border-gray-800` as per PDF page 5 card which has a prominent dark border, or `border-sky-500` if featured)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-white py-16 md:py-20 lg:py-24`
- **Section Header (Title & Subtitle):** `text-center mb-12 md:mb-16 lg:mb-20`
  - **Title:** `text-3xl sm:text-4xl font-bold text-gray-900`
  - **Subtitle:** `mt-4 text-lg text-gray-600 max-w-xl mx-auto`
- **Pricing Plans Grid:** `grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-md mx-auto` (Starts with layout for a single, centered card. Adjust `md:grid-cols-2 lg:grid-cols-3 max-w-none` if multiple cards)
- **Pricing Card:** `bg-white p-6 md:p-8 rounded-xl shadow-xl border-2 flex flex-col h-full` (Default border, override with `borderColor` if `isFeatured`)
  - **Plan Name (h3):** `text-2xl font-bold text-gray-800 mb-2`
  - **Price Container:** `flex items-end mb-6`
    - **Price (span):** `text-4xl md:text-5xl font-extrabold text-gray-900 leading-none`
    - **Frequency (span):** `text-base text-gray-500 ml-1 self-end pb-1`
  - **Features List (ul):** `space-y-3 mb-8 flex-grow`
    - **Feature Item (li):** `flex items-center text-gray-600`
      - **Checkmark Icon:** `text-green-500 h-5 w-5 mr-2 flex-shrink-0`
  - **CTA Button:** (Primary button style) `w-full py-3 text-lg mt-auto` (mt-auto pushes to bottom if card heights vary due to features list length)

**Mobile Responsiveness:**
- Single card layout centers. Multiple cards would stack on mobile and then form a grid on larger screens.


## Component: FAQSection (Landing Page)

**Description:** Displays a list of frequently asked questions and their answers in an accordion style.

**Elements:**
- Section Title
- Section Subtitle (optional)
- List of FAQ Items (Question + Answer + Expand/Collapse Icon)

**Props for `FAQSection`:**
- `title?`: String (default: "Frequently Asked Questions")
- `subtitle?`: String (default: "Find answers to common questions...")
- `faqs`: Array of `FAQItemProps`

**Props for `FAQItemData` (as part of `faqs` array):**
- `id`: String | Number
- `question`: String
- `answer`: String (can be simple text, or for more complex answers, consider allowing ReactNode)

**Internal State for each FAQ Item:**
- `isOpen`: Boolean (to manage expand/collapse state)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-white py-16 md:py-20 lg:py-24`
- **Section Header (Title & Subtitle):** `text-center mb-12 md:mb-16 lg:mb-20`
  - **Title:** `text-3xl sm:text-4xl font-bold text-gray-900`
  - **Subtitle:** `mt-4 text-lg text-gray-600 max-w-3xl mx-auto`
- **FAQ List Container:** `max-w-3xl mx-auto`
- **FAQ Item:**
  - **Wrapper:** `border-b border-gray-200` (Separator line)
  - **Question Button/Header:** `flex justify-between items-center w-full py-5 text-left cursor-pointer hover:bg-gray-50 transition-colors`
    - **Question Text (span/p):** `text-lg font-medium text-gray-800`
    - **Icon (span/div):** `text-gray-500 transform transition-transform duration-300` (e.g., chevron that rotates)
  - **Answer Panel (div):** `overflow-hidden transition-all duration-500 ease-in-out` (for smooth expand/collapse)
    - **Answer Text (p):** `pt-1 pb-5 text-gray-600 leading-relaxed`

**Accessibility:**
- Use `<button>` for question toggles.
- `aria-expanded` attribute on the button.
- `aria-controls` linking button to answer panel.
- Answer panel `id` matching `aria-controls`.


## Component: FinalCTASection (Landing Page)

**Description:** A final call-to-action section usually placed before the footer.

**Elements:**
- Section Title
- Descriptive Text
- Primary Call-to-Action Button
- Optional Secondary Call-to-Action Link/Button

**Props for `FinalCTASection`:**
- `title?`: String (default: "Ready to Improve Your Writing Skills?")
- `description?`: String (default: "Join thousands of students who have boosted their writing scores...")
- `primaryCta`: Object (`{ text: String, href: String }`)
- `secondaryCta?`: Object (`{ text: String, href: String }`) (optional)

**Styling (Tailwind indicative classes):**
- **Section Container:** `bg-sky-50 py-16 md:py-20 lg:py-24` (Using a light blue background for variation, can be white)
- **Layout:** `container mx-auto px-6 text-center`
- **Title (h2):** `text-3xl sm:text-4xl font-bold text-gray-900`
- **Description (p):** `mt-4 text-lg text-gray-700 max-w-2xl mx-auto`
- **Button Container:** `mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4`
  - **Primary CTA Button:** (Primary button style) `px-8 py-3 text-lg sm:text-xl`
  - **Secondary CTA Link/Button:** (Text link style or outline button) `text-base sm:text-lg font-medium text-gray-700 hover:text-gray-900`

**Mobile Responsiveness:**
- Buttons stack on smaller screens if both are present and layout demands.

## Component: Footer (Landing Page)

**Description:** The main footer for the public-facing landing page.

**Elements:**
- Brand Name / Logo (optional, can be text)
- Copyright Information
- Navigation Links (e.g., Privacy, Terms, Contact)

**Props for `Footer`:**
- `brandName?`: String (default: "Selective Writing")
- `footerNavLinks?`: Array of objects (`{ text: String, href: String }`)
- `startYear?`: Number (Optional, for copyright range e.g., 2023. Defaults to current year if not provided for a single year display)

**Styling (Tailwind indicative classes):**
- **Container:** `bg-gray-800 text-gray-400` (Dark background, light gray text)
- **Layout:** `container mx-auto px-6 py-8 md:py-12`
  - **Content Wrapper:** `flex flex-col md:flex-row items-center justify-between gap-6`
- **Brand & Copyright Block (Left/Top):** `text-center md:text-left`
  - **Brand Name (if text):** `text-lg font-semibold text-white mb-1`
  - **Copyright:** `text-sm`
- **Navigation Links Block (Right/Bottom):** `flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2`
  - **Link:** `hover:text-white transition-colors text-sm`

**Mobile Responsiveness:**
- Stacks elements vertically on smaller screens, horizontal on medium and up.



## Component: AuthPageLayout

**Description:** A simple page layout for authentication pages (Login, Sign Up, Forgot Password, etc.). Features a centered card for the form.

**Elements:**
- Page Container (e.g., `min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4`)
- Brand Name/Logo (Text, centered above the auth card)
- AuthFormCard (see below)

**Styling:**
- Background: `bg-slate-50` or `bg-white`.
- Brand Name: `text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8`.

---

## Component: AuthFormCard

**Description:** The card used to contain authentication forms.

**Elements:**
- Card Title (e.g., "Create Your Account", "Log In")
- Form Input Fields (Label + Input)
- Error/Success Message Area
- Primary Action Button
- Secondary Links (e.g., "Forgot Password?", "Already have an account?")
- Page Container (e.g., `min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 py-12`)
- AuthFormCard (see below)

**Styling (Tailwind indicative classes):**
- Background: `bg-slate-50` or `bg-white`.
- **Card Container:** `w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border-2 border-gray-800`
- **Card Title (h1):** `text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8`
- **Form:** `space-y-5 sm:space-y-6`
- **Input Field Wrapper (div):**
  - **Label:** `block text-sm font-medium text-gray-700 mb-1`
  - **Input:** `block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm text-gray-900`
- **Checkbox Wrapper (for Terms):** `flex items-center gap-2`
  - **Checkbox:** `h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500`
  - **Label:** `text-sm text-gray-600`
- **Message Areas (Success/Error):** `text-sm text-center p-3 rounded-md border`
  - **Success:** `text-green-700 bg-green-50 border-green-200`
  - **Error:** `text-red-700 bg-red-50 border-red-200`
- **Primary Button:** `w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 transition duration-150 ease-in-out`
- **Secondary Link Container:** `text-sm text-center text-gray-600 pt-2 sm:pt-4`
  - **Link:** `font-medium text-indigo-600 hover:text-indigo-500 hover:underline`

  ## Component: AuthenticatedNavbar

**Description:** The sticky top navigation bar for authenticated sections of the application.

**Elements:**
- Brand Name ("Selective Writing")
- Core Navigation Links (e.g., Dashboard, Practice)
- Conditional Admin Link
- User Info (Email)
- Logout Button

**Props:** (Mostly internal state via Supabase auth)

**Styling (Tailwind indicative classes):**
- **Container:** `bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200`
- **Layout:** `container mx-auto px-6 py-4 md:px-8 lg:px-16 flex items-center justify-between h-16` (Matches landing page header)
- **Brand Name:** `text-2xl font-bold text-gray-800 hover:text-gray-600` (Links to `/dashboard`)
- **Nav Links Container:** `flex items-center space-x-2 md:space-x-4`
  - **Individual Link:** `px-3 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-md text-sm lg:text-base`
  - **Admin Link:** `flex items-center text-purple-600 hover:text-purple-800 px-3 py-2 rounded-md text-sm font-medium`
- **User Info & Logout Container:** `flex items-center space-x-3 md:space-x-4`
  - **User Email:** `text-sm text-gray-500 hidden sm:inline`
  - **Logout Button:** `flex items-center text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium` (Icon + Text)

**Mobile Responsiveness:**
- Consider how links will behave on small screens (e.g., hamburger menu or selective visibility). The current code doesn't have a mobile menu for these links; they might wrap or get hidden. This is an area for future refinement.\


## Component: WelcomeHeader (Dashboard)

**Description:** Displays a personalized welcome message on the dashboard.

**Props:**
- `userName?`: String (Optional, for personalization)

**Styling:**
- Main text: `text-2xl sm:text-3xl font-bold text-gray-900`
- Sub-text: `text-md text-gray-600 mt-1`

## Component: OverviewStats (Dashboard)

**Description:** A container for displaying a row of key overview statistics cards.

**Props:**
- `stats`: Array of `StatCardProps`

**Styling:**
- Grid layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

---

## Component: StatCard (Dashboard)

**Description:** A card displaying a single statistic with a title, value, and optional subtext.

**Props:**
- `label`: String (e.g., "Total Practices")
- `value`: String (e.g., "24", "82%")
- `subtext?`: String (e.g., "Great progress!")
- `icon?`: React.ReactNode (Optional)

**Styling:**
- Card: `bg-white p-6 rounded-xl shadow-lg border-2 border-gray-800 flex flex-col`
- Label: `text-sm font-medium text-gray-500 mb-1`
- Value: `text-3xl md:text-4xl font-bold text-gray-900`
- Subtext: `text-xs text-gray-500 mt-1`

## Component: RecentSubmissionsList (Dashboard)

**Description:** Displays a list of the user's recent writing submissions with search and sort capabilities.

**Props:**
- `submissions`: Array of `SubmissionItemData` (defined below)
- `onSearchChange?`: Function (handler for search input)
- `onSortChange?`: Function (handler for sort option change)

**Elements:**
- Section Title & Subtitle
- Search Input
- Sort Dropdown/Button
- List of Submission Items
- Empty State Display
- Search Input (with debouncing)
- Sort Dropdown (Date Newest/Oldest, Score Highest/Lowest)
- Genre Filter Dropdown (All Genres, plus dynamic list)

**Styling:**
- Main Card: `bg-white p-6 rounded-xl shadow-lg border-2 border-gray-800`
- Header (Title, Subtitle, Search/Sort): `flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4`
- Search Input: Standard input styling.
- Sort Control: Standard button/dropdown styling.
- List: `space-y-4` or `divide-y divide-gray-200`
**Internal State:**
- `searchTerm`: String
- `sortOption`: String (e.g., 'date_desc', 'score_asc')
- `selectedGenre`: String (e.g., 'All Genres', 'Creative')
- `displayedSubmissions`: Array<SubmissionItemData>
- `offset`: Number
- `canLoadMore`: Boolean
- `isLoadingMore`: Boolean
---

## Component: SubmissionListItem (Dashboard)

**Description:** An individual item in the Recent Submissions list.

**Props (`SubmissionItemData`):**
- `id`: String | Number
- `genre`: String
- `promptTitle`: String
- `date`: String (formatted)
- `overallScorePercentage`: Number (e.g., 85 for 85%)
- `viewLink`: String (href for the "View" action)

**Styling:**
- Item Container: `flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4`
- **Left Block (Genre):**
  - Genre Badge: `text-xs font-semibold px-3 py-1 rounded-full [dynamic background/text color based on genre or fixed style]` (e.g., `bg-sky-100 text-sky-700`) `w-24 text-center flex-shrink-0` (fixed width for alignment)
- **Center Block (Prompt Title & Date):** `flex-1 flex flex-col items-center md:items-start text-center md:text-left`
  - Prompt Title: `text-md font-semibold text-gray-800 hover:text-sky-600`
  - Date: `text-xs text-gray-500 mt-1 flex items-center gap-1`
- **Right Block (Score & Action):** `flex items-center gap-3 flex-shrink-0`
  - Score Pill: (Dynamic background based on `overallScorePercentage`) `px-3 py-1 rounded-full text-sm font-bold text-white min-w-[50px] text-center` (Larger pill)
  - View Action: `text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center`


  ## Component: GenreSelectionCard (within GenreSelectionGrid)

**Description:** A card representing a selectable writing genre.

**Props (derived from `Genre` type):**
- `name`: String
- `description`: String
- `onSelect`: Function

**Styling:**
- Card: `bg-white p-6 rounded-xl shadow-lg border-2 border-gray-800 flex flex-col justify-between h-full` (Prominent border style, `h-full` for consistent height in a grid row)
- Genre Name (h2): `text-xl font-semibold mb-2 text-gray-800`
- Description (p): `text-gray-700 mb-4 text-sm flex-grow` (`flex-grow` to push button down)
- Select Button: (Primary button style) `w-full mt-auto bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-150 ease-in-out`

---
## Component: GenreSelectionGrid

**Description:** Displays a grid of GenreSelectionCards.

**Props:**
- `genres`: Array of Genre objects (`{ name, dbValue, description }`) - `color` prop might be deprecated or repurposed.

**Styling:**
- Grid Container: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`

## Component: WritingSession

**Description:** The main UI for the timed writing practice session.

**Key Internal Elements:**
- Prompt Display Area (Genre, Full Prompt Text)
- Countdown Timer
- Lexical Rich Text Editor (with Toolbar)
- Word Count Display
- Submit Button

**Styling (Tailwind indicative classes):**
- **Page Layout:** Within a centered `max-w-3xl` or `max-w-4xl` container.
- **Top Bar (Prompt & Timer):** `flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 md:mb-6`
  - **Prompt Info Card:** `flex-1 bg-sky-50 p-4 rounded-lg border border-sky-200`
    - Genre Badge: `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-200 text-sky-800 mb-2`
    - Prompt Text: `text-gray-800 whitespace-pre-wrap`
  - **Timer Display:** `text-right md:text-left md:pl-4` (styling from Timer.tsx)
- **Editor Section:** `my-4` (space around editor)
  - `RichTextEditor` (includes ToolbarPlugin and ContentEditable with its own styling)
- **Bottom Bar (Word Count & Submit):** `flex flex-col sm:flex-row justify-between items-center mt-4 md:mt-6 pt-4 border-t border-gray-200`
  - **Word Count:** `text-sm text-gray-600 mb-2 sm:mb-0`
  - **Submit Button:** (Primary button style) `px-6 py-2.5`