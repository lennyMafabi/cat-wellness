'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Users, Check } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const benefits = [
  'Culturally appropriate dispute resolution',
  'Community-led peace building',
  'Faster resolution compared to formal courts',
  'Restorative justice approach',
  'Reduced cost for community members',
  'Preservation of community relationships'
];

export default function AJSPage() {
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
              href="/services" 
              className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Services
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-violet-900 via-purple-950 to-violet-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-block p-4 rounded-full bg-white/10 mb-6">
              <Users className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Alternative Justice System (AJS)
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              Traditional and community-based dispute resolution methods that complement 
              the formal justice system.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="prose prose-lg max-w-none mb-12">
              <p className="text-gray-600 leading-relaxed">
                The Alternative Justice System (AJS) is an approach that recognizes and incorporates 
                traditional dispute resolution mechanisms within the formal justice framework. 
                CAT Kenya works with community elders, religious leaders, and local structures to 
                provide accessible, culturally appropriate justice solutions.
              </p>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Benefits of AJS
            </motion.h2>
            <motion.div variants={staggerContainer} className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="flex items-center gap-4 p-6 bg-violet-50 rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-gray-800">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-6">
              Interested in learning more about AJS? Contact us for more information.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Contact Us
            </Link>
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
