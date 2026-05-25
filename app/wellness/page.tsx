'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Lock, 
  Clock, 
  Activity, 
  Users, 
  FileText, 
  TrendingUp,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Brain,
  Scale,
  ArrowLeft
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
              Back to CAT Kenya
            </span>
          </Link>
          
          <Link href="/wellness" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Wellness</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-rose-900 py-20 lg:py-28 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Confidential & Secure
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Your Journey to
            <span className="block bg-gradient-to-r from-violet-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
              Healing Starts Here
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Access confidential psychosocial assessments, evidence-based coping strategies, 
            and personalized support for survivors of online gender-based violence.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/app"
              className="px-8 py-4 bg-white text-violet-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <Activity className="w-5 h-5" />
              Start Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Learn How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Available 24/7</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Users,
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up anonymously with a username. No personal information required. Your identity remains completely confidential.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: FileText,
      number: '02',
      title: 'Complete Assessment',
      description: 'Answer questions about your experiences and current wellbeing. The assessment covers PTSD, anxiety, depression, and daily functioning.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Brain,
      number: '03',
      title: 'Receive Your Analysis',
      description: 'Get immediate insights into your mental health status with personalized recommendations and coping resources.',
      color: 'from-rose-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      number: '04',
      title: 'Track Your Progress',
      description: 'Monitor your healing journey over time. Regular follow-ups help measure improvement and adjust your care plan.',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm mb-4">
            Simple Process
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to access confidential support and begin your healing journey
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" />
              )}
              
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-violet-200 transition-all duration-500 h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-200 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Evidence-Based Assessment',
      description: 'Clinically validated screening tools for PTSD, anxiety, depression, and functional impairment.'
    },
    {
      icon: MessageCircle,
      title: 'Coping Resources',
      description: 'Access personalized strategies, grounding techniques, and self-care recommendations.'
    },
    {
      icon: Activity,
      title: 'Progress Tracking',
      description: 'Visual charts and reports showing your improvement over time with trend analysis.'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Separate pathways for survivors, practitioners, and advocates with tailored content.'
    },
    {
      icon: Scale,
      title: 'Legal Integration',
      description: 'Connect with CAT Kenya legal aid services directly through the platform.'
    },
    {
      icon: Clock,
      title: 'Follow-Up Care',
      description: 'Regular check-ins and extended assessments to monitor long-term recovery.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-semibold text-sm mb-4">
            Platform Features
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Support Tools
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PrivacySection() {
  const commitments = [
    'No personal identification required',
    'End-to-end encryption for all data',
    'Data stored securely on local servers',
    'No sharing with third parties',
    'You control your data and can delete anytime',
    'Compliant with data protection laws'
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Lock className="w-4 h-4" />
              Your Privacy Matters
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Privacy & Security Commitment
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
              We understand the sensitive nature of your experiences. Our platform is designed 
              with your safety and confidentiality as the highest priority.
            </motion.p>

            <motion.div variants={fadeInUp} className="space-y-3">
              {commitments.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Security Badge</h3>
                  <p className="text-white/60">IRCT Accredited Platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/80">Encryption</span>
                  <span className="text-emerald-400 font-semibold">AES-256</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/80">Data Storage</span>
                  <span className="text-emerald-400 font-semibold">Local Servers</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/80">Access Control</span>
                  <span className="text-emerald-400 font-semibold">Role-Based</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-white/80">Compliance</span>
                  <span className="text-emerald-400 font-semibold">GDPR + Kenya DPA</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is the wellness platform really anonymous?',
      answer: 'Yes. You only need to create a username - no email, phone number, or personal information is required. Your identity remains completely confidential.'
    },
    {
      question: 'Who can access my assessment results?',
      answer: 'Only you and authorized CAT Kenya practitioners can view your results. Practitioners only see aggregated data for research and service improvement purposes.'
    },
    {
      question: 'What types of assessments are available?',
      answer: 'The platform includes evidence-based screenings for PTSD, anxiety, depression, functional impairment, and overall wellness. Extended follow-up assessments track your progress over time.'
    },
    {
      question: 'Can I connect with a counselor through the platform?',
      answer: 'Yes. The platform includes a secure chat feature to connect with CAT Kenya support staff. You can also request referrals to partner mental health professionals.'
    },
    {
      question: 'Is there a cost to use the wellness platform?',
      answer: 'No. All services on the wellness platform are completely free for survivors of torture and human rights violations, funded by CAT Kenya and our partners.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm mb-4">
            FAQ
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-4">
            Common Questions
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronRight 
                  className={`w-5 h-5 text-violet-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-violet-600 to-purple-700 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Begin Your Healing Journey?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Take the first step towards recovery. Access confidential support, 
            track your progress, and connect with caring professionals.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/app"
              className="px-8 py-4 bg-white text-violet-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <Heart className="w-5 h-5" />
              Start Your Assessment
            </Link>
            <Link 
              href="/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Contact Support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold">CAT Kenya Wellness</span>
              <span className="block text-xs text-gray-400">Part of CAT Kenya Foundation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} CAT Kenya Foundation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function WellnessPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <PrivacySection />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
