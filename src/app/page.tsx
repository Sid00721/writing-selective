// src/app/page.tsx
import Link from 'next/link';
import { Clock, Edit3, ListChecks, Award } from 'lucide-react'; // Example icons

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Simple version for landing page */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0">
            {/* You could replace text with a logo */}
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Writing Practice
            </Link>
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Master the NSW Selective Schools Writing Test
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Prepare effectively with timed practice sessions across all key genres, designed to simulate the real exam environment. Track your progress and build confidence.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started for Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                  <Clock size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Timed Practice</h3>
                <p className="text-sm text-gray-500">
                  Experience the pressure of the 30-minute time limit, just like the real selective test.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                  <Edit3 size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diverse Genres</h3>
                <p className="text-sm text-gray-500">
                  Practice creative, persuasive, articles, diary entries, news reports, and more.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                  <ListChecks size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission History</h3>
                <p className="text-sm text-gray-500">
                  Review your past attempts, track your progress, and identify areas for improvement.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                  <Award size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Realistic Simulation</h3>
                <p className="text-sm text-gray-500">
                  Our interface mimics exam conditions to help you prepare effectively for test day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
         <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Boost Your Writing Score?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join other NSW students preparing for the selective schools test. Sign up today and start practicing!
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign Up Now
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Writing Practice App. All rights reserved.
          {/* Add other footer links if needed */}
        </div>
      </footer>
    </div>
  );
}