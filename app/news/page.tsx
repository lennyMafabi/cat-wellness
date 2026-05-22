'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Calendar, ArrowRight } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const newsItems = [
  {
    title: 'CAT Kenya Launches Digital Wellness Platform',
    excerpt: 'New online platform provides confidential psychosocial support for survivors of online gender-based violence.',
    date: 'January 15, 2026',
    category: 'Technology'
  },
  {
    title: 'Legal Aid Clinic Expands to 5 New Counties',
    excerpt: 'Our mobile legal aid services now reach survivors in remote areas across Kenya.',
    date: 'December 10, 2025',
    category: 'Legal Aid'
  },
  {
    title: 'International Human Rights Day Celebration',
    excerpt: 'CAT Kenya joins global community in commemorating Human Rights Day with survivor stories.',
    date: 'December 8, 2025',
    category: 'Events'
  },
  {
    title: 'Training Workshop for Community Paralegals',
    excerpt: 'Over 50 community paralegals trained in human rights documentation and advocacy.',
    date: 'November 20, 2025',
    category: 'Training'
  }
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">CAT Kenya</span>
                <span className="block text-xs text-gray-500">Foundation</span>
              </div>
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              News & Updates
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              Stay informed about our programs, events, and impact stories.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {newsItems.map((item, index) => (
              <motion.article 
                key={index}
                variants={fadeInUp}
                className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-sm text-violet-600 mb-4">
                  <span className="px-3 py-1 bg-violet-100 rounded-full font-medium">
                    {item.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                  {item.title}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{item.date}</span>
                  </div>
                  <button className="flex items-center gap-1 text-violet-600 font-medium group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} CAT Kenya Foundation. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
