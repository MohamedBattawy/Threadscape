import ImageWithFallback from "../components/ImageWithFallback";

export const metadata = {
  title: "About Threadscape | Our Story",
  description: "Learn about Threadscape's journey, our values, and our commitment to sustainable and stylish fashion.",
};

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-neutral-100 dark:bg-neutral-900 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
              Discover the passion and purpose behind Threadscape
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  At Threadscape, we believe that fashion is more than just clothing—it&apos;s self-expression, confidence, and the ability to move through the world exactly as you are.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Founded in 2023, we set out with a clear mission: to create thoughtfully designed, high-quality essentials that empower individuals to express their unique style while making responsible choices for our planet.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Every piece in our collection is designed with intention, crafted with care, and created to last—because true style transcends trends and seasons.
                </p>
              </div>
              <div className="relative h-96">
                <ImageWithFallback 
                  src="/about-mission.jpg" 
                  alt="Our mission" 
                  fill 
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 inline-block rounded-lg mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality First</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We believe in creating pieces that stand the test of time, both in design and durability. Every stitch, seam, and material is chosen with care.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900 p-3 inline-block rounded-lg mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We&apos;re committed to minimizing our environmental footprint through responsible sourcing, ethical manufacturing, and thoughtful packaging.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 inline-block rounded-lg mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusivity</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We design for diverse body types, styles, and self-expressions. Our collections are created for everyone who values quality and thoughtful design.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 