'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Scale, 
  Users, 
  BookOpen, 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  ChevronRight,
  Play,
  Quote,
  Clock,
  Award,
  Globe,
  Activity,
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { type MediaAsset } from '@/types/media';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

// Counter animation hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(countRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, countRef };
}

// Components
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/wellness', label: 'Wellness Support', highlight: true },
    { href: '/news', label: 'News' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/cat-logo.jpeg"
              alt="CAT Kenya Logo" 
              style={{ 
                height: '48px',
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
              }}
            />
            <div className="hidden sm:block">
              <span className={`text-lg font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                CAT Kenya
              </span>
              <span className={`block text-xs transition-colors duration-300 ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  link.highlight
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-violet-500/30 hover:scale-105'
                    : isScrolled
                    ? 'text-gray-700 hover:text-violet-600 hover:bg-violet-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/wellness"
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-rose-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Get Support
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${isScrolled ? 'bg-gray-900' : 'bg-white'} ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-900' : 'bg-white'} ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${isScrolled ? 'bg-gray-900' : 'bg-white'} ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden bg-white border-t"
      >
        <div className="px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                link.highlight
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  
  // Background slideshow
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [bgImages, setBgImages] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log('Fetching hero background images...');
        const res = await fetch('/api/admin/media?section=landing');
        const data = await res.json();
        console.log('Hero images response:', data);
        if (data.success && data.assets && data.assets.length > 0) {
          const activeImages = data.assets.filter((img: MediaAsset) => img.isActive !== false);
          console.log('Active hero images:', activeImages);
          if (activeImages.length > 0) {
            setBgImages(activeImages);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hero images:', err);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (bgImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [bgImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {bgImages.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={bgImages[currentBgIndex]?.url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => console.error('Image failed to load:', bgImages[currentBgIndex]?.url, e)}
                />
              </motion.div>
            </AnimatePresence>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </>
        ) : (
          /* Fallback gradient background */
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950" />
        )}
      </div>
      
      {/* Animated Background Elements (subtle overlay) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      </div>

      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 text-center"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <div className="bg-white rounded-full p-4 shadow-2xl">
              <img 
                src="/logo.png.jpg" 
                alt="CAT Kenya Foundation Logo" 
                className="h-32 md:h-40 w-auto object-contain"
                onError={(e) => console.error('Logo failed to load:', e)}
                onLoad={() => console.log('Logo loaded successfully')}
              />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex">
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
              <Award className="w-4 h-4 inline mr-2" />
              Accredited by IRCT - International Rehabilitation Council for Torture Victims
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight"
          >
            Justice for All,
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dignity for Survivors
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
          >
            Centre Against Torture Kenya Foundation provides legal aid, psychosocial support, 
            and advocacy for survivors of torture and human rights violations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/wellness"
              className="group px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <Heart className="w-5 h-5 group-hover:animate-pulse" />
              Access Wellness Support
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
            >
              <Play className="w-5 h-5" />
              Explore Our Services
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} className="pt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">100% Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">24/7 Support Available</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

function ImpactStats() {
  const stats = [
    { icon: Users, value: 5000, suffix: '+', label: 'Survivors Supported', color: 'from-violet-500 to-purple-600' },
    { icon: Scale, value: 1200, suffix: '+', label: 'Legal Cases Handled', color: 'from-blue-500 to-cyan-600' },
    { icon: Globe, value: 47, suffix: '', label: 'Counties Reached', color: 'from-emerald-500 to-teal-600' },
    { icon: Activity, value: 22, suffix: ' yrs', label: 'Years of Service', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const { count, countRef } = useCountUp(stat.value, 2000);
            return (
              <motion.div
                key={index}
                variants={scaleIn}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-violet-200 transition-all duration-500 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div ref={countRef} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                    {count.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// Slideshow Section for Community Images
function SlideshowSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<MediaAsset[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/admin/media?section=landing');
        const data = await res.json();
        console.log('Slideshow images:', data);
        if (data.success && data.assets && data.assets.length > 0) {
          const activeImages = data.assets.filter((img: MediaAsset) => img.isActive);
          console.log('Active images:', activeImages);
          setImages(activeImages);
        }
      } catch (err) {
        console.error('Failed to fetch slideshow images:', err);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Work in Action</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connecting with communities across Kenya to provide support and healing
          </p>
        </motion.div>

        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg border-2 border-dashed border-gray-300"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-violet-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-gray-600 mb-6">
              Upload images to the <strong>Landing Page</strong> section in the Admin Panel
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
            >
              Go to Admin Panel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-white"
        >
          {/* Main Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]?.url}
                alt={images[currentIndex]?.alt || images[currentIndex]?.caption || `Slide ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Overlay with caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Caption */}
            <AnimatePresence mode="wait">
              {images[currentIndex]?.caption && (
                <motion.div
                  key={`caption-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
                >
                  <p className="text-white text-lg md:text-xl font-medium max-w-3xl">
                    {images[currentIndex]?.caption}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 py-4 bg-white">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-violet-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
        )}
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: Scale,
      title: 'Legal Aid',
      description: 'Free legal assistance to survivors of torture and human rights violations. We ensure justice is accessible to all.',
      color: 'from-blue-500 to-cyan-600',
      href: '/services/legal-aid'
    },
    {
      icon: Users,
      title: 'Alternative Justice (AJS)',
      description: 'Traditional and community-based dispute resolution methods that complement the formal justice system.',
      color: 'from-violet-500 to-purple-600',
      href: '/services/ajs'
    },
    {
      icon: Heart,
      title: 'Psychosocial Support',
      description: 'Confidential counseling and mental health services through our digital wellness platform.',
      color: 'from-rose-500 to-pink-600',
      href: '/wellness',
      highlight: true
    },
    {
      icon: BookOpen,
      title: 'Education & Training',
      description: 'Capacity building for human rights defenders, legal practitioners, and community leaders.',
      color: 'from-emerald-500 to-teal-600',
      href: '/services/education'
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm mb-4">
            Our Services
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Support for Survivors
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide holistic care combining legal assistance, psychosocial support, 
            and community-based justice solutions.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group"
            >
              <Link href={service.href} className="block h-full">
                <div className={`relative h-full bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-500 overflow-hidden ${
                  service.highlight 
                    ? 'border-rose-200 hover:border-rose-400 hover:shadow-rose-200/50' 
                    : 'border-transparent hover:border-violet-200 hover:shadow-xl'
                }`}>
                  {service.highlight && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                      RECOMMENDED
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center text-violet-600 font-semibold group-hover:gap-3 transition-all">
                    Learn More 
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WellnessCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-rose-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={slideInLeft} className="text-white">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold mb-6">
              <Activity className="w-4 h-4 inline mr-2" />
              New: Digital Wellness Platform
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Access Confidential Support Anytime, Anywhere
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Our secure digital platform provides psychosocial assessments, coping resources, 
              and personalized support for survivors of online gender-based violence and trauma.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Anonymous and confidential assessments',
                'Evidence-based coping strategies',
                'Track your healing journey',
                'Connect with professional support'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/wellness"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-violet-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              Start Your Wellness Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div variants={slideInRight} className="relative">
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              {/* Mock UI */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">CAT Kenya Wellness</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Welcome back</div>
                      <div className="text-sm text-gray-500">Your progress: 75%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-rose-50 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-rose-600">42</div>
                      <div className="text-xs text-gray-600">PTSD Score</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-600">68</div>
                      <div className="text-xs text-gray-600">Functioning</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-amber-600">85</div>
                      <div className="text-xs text-gray-600">Wellness</div>
                    </div>
                  </div>
                  <div className="bg-violet-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-violet-900 mb-2">↗ Improving</div>
                    <div className="text-xs text-gray-600">Your symptoms are showing positive improvement</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SuccessStories() {
  const stories = [
    {
      quote: "CAT Kenya helped me find justice and healing after years of suffering. Their support was life-changing.",
      author: "A Survivor",
      location: "Nairobi County"
    },
    {
      quote: "The legal aid clinic provided me with representation I could never afford. Today, I have my dignity back.",
      author: "M.K.",
      location: "Eldoret"
    },
    {
      quote: "Through AJS, our community resolved a long-standing dispute peacefully. CAT Kenya brings hope.",
      author: "Community Elder",
      location: "Western Kenya"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-semibold text-sm mb-4">
            Success Stories
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Voices of Hope & Resilience
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {stories.map((story, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-500"
            >
              <Quote className="w-10 h-10 text-violet-300 mb-6" />
              <p className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                &ldquo;{story.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {story.author[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{story.author}</div>
                  <div className="text-sm text-gray-500">{story.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Our Services' },
    { href: '/wellness', label: 'Wellness Support' },
    { href: '/news', label: 'News & Updates' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const services = [
    { href: '/services/legal-aid', label: 'Legal Aid' },
    { href: '/services/ajs', label: 'Alternative Justice' },
    { href: '/wellness', label: 'Psychosocial Support' },
    { href: '/services/education', label: 'Education & Training' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">CAT Kenya</span>
                <span className="block text-xs text-gray-400">Foundation</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Centre Against Torture Kenya Foundation is dedicated to providing justice, 
              support, and dignity for survivors of human rights violations.
            </p>
            <div className="flex items-center gap-4">
              {['twitter', 'facebook', 'linkedin', 'instagram'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com/catkenya`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-violet-600 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-violet-400 mt-0.5" />
                <span className="text-gray-400">
                  2nd Floor, Berur Building<br />
                  Opposite Eastleigh Indian Temple<br />
                  Eldoret, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-violet-400" />
                <span className="text-gray-400">+254 159 449 499</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-violet-400" />
                <span className="text-gray-400">humanrights.catkenya@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CAT Kenya Foundation. All Rights Reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Registered NGO | Accredited by IRCT
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ImpactStats />
      <ServicesSection />
      <WellnessCTA />
      <SuccessStories />
      <Footer />
    </main>
  );
}
