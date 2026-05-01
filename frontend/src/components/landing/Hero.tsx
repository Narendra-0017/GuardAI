import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-cyan/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-primary-cyan/10 border border-primary-cyan/30 rounded-full px-4 py-2 mb-8"
        >
          <Zap className="w-4 h-4 text-primary-cyan" />
          <span className="text-sm font-medium text-primary-cyan">
            Powered by LangGraph Agentic AI
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="block">
            Fraud Detection That
          </span>
          <span className="block bg-gradient-to-r from-primary-cyan to-primary-purple bg-clip-text text-transparent">
            Thinks Like an Investigator
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl text-dark-muted max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          GuardAI deploys autonomous AI agents that investigate transactions and detect phishing threats — 
          in milliseconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            to="/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary-cyan to-primary-purple text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-primary-cyan/25 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Start Detecting</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="group px-8 py-4 bg-dark-card border border-dark-border text-white font-semibold rounded-xl hover:bg-dark-border transition-all duration-300 flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-6 text-sm text-dark-muted"
        >
          <span className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-success" />
            <span>No credit card required</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Free forever</span>
          <span className="hidden sm:inline">•</span>
          <span>Deployed on cloud</span>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 lg:right-20">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 bg-gradient-to-br from-primary-cyan/20 to-primary-purple/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-cyan/30"
        >
          <Shield className="w-8 h-8 text-primary-cyan" />
        </motion.div>
      </div>

      <div className="absolute bottom-20 left-10 lg:left-20">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 bg-gradient-to-br from-primary-purple/20 to-primary-cyan/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-purple/30"
        >
          <Zap className="w-10 h-10 text-primary-purple" />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-6 h-10 border-2 border-primary-cyan/50 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-primary-cyan rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  )
}
