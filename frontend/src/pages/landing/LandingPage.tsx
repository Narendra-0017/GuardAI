import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, Mail, Users, BarChart, Lock, Globe, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

// Components
import { Hero } from '../../components/landing/Hero'
import { HowItWorks } from '../../components/landing/HowItWorks'
import { Features } from '../../components/landing/Features'
import { Stats } from '../../components/landing/Stats'
import { Footer } from '../../components/landing/Footer'

export const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-dark-bg">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)
            `
          }}
        />
        <div 
          className="absolute inset-0 bg-grid-pattern bg-grid"
          style={{
            backgroundSize: '50px 50px',
            opacity: 0.1
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark-card/90 backdrop-blur-md border-b border-dark-border' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-lg flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-cyan to-primary-purple bg-clip-text text-transparent">
                GuardAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-dark-muted hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-dark-muted hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#about" className="text-dark-muted hover:text-white transition-colors">
                About
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-dark-muted hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-purple text-white rounded-lg hover:shadow-lg hover:shadow-primary-cyan/25 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Footer />
      </main>
    </div>
  )
}
