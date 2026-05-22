'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Scale, Users, BookOpen, Heart, ArrowRight } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const services = [
  {
    icon: Scale,
    title: 'Legal Aid',
    description: 'Free legal assistance to survivors of torture and human rights violations.',
    color: 'from-blue-500 to-cyan-600',
    href: '/services/legal-aid'
  },
  {
    icon: Users,
    title: 'Alternative Justice (AJS)',
    description: 'Traditional and community-based dispute resolution methods.',
    color: 'from-violet-500 to-purple-600',
    href: '/services/ajs'
  },
  {
    icon: Heart,
    title: 'Psychosocial Support',
    description: 'Confidential counseling and mental health services.',
    color: 'from-rose-500 to-pink-600',
    href: '/wellness'
  },
  {
    icon: BookOpen,
    title: 'Education & Training',
    description: 'Capacity building for human rights defenders.',
    color: 'from-emerald-500 to-teal-600',
    href: '/services/education'
  }
];

export default function ServicesPage() {
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
              Our Services
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              Comprehensive support combining legal assistance, psychosocial care, 
              and community-based justice solutions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {services.map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Link href={service.href} className="group block h-full">
                  <div className="h-full bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="flex items-center text-violet-600 font-semibold">
                      Learn More <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
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
