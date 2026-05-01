import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Eye, Mail, Users, BarChart, Lock } from 'lucide-react'

export const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Agentic AI Pipeline",
      description: "Multiple LangGraph agents collaborate autonomously to investigate transactions like human fraud teams",
      color: "from-primary-cyan to-blue-500"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Process thousands of transactions per second with sub-200ms response times",
      color: "from-primary-purple to-pink-500"
    },
    {
      icon: Eye,
      title: "Explainable Decisions",
      description: "SHAP-powered feature importance shows exactly why transactions are flagged",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Mail,
      title: "Phishing Detection",
      description: "Advanced LLM analysis detects email threats with 99%+ accuracy",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Human-in-the-Loop",
      description: "Seamless escalation to human analysts for complex cases",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: BarChart,
      title: "Live Dashboard",
      description: "Real-time analytics and monitoring with customizable alerts",
      color: "from-teal-500 to-cyan-500"
    }
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Features for Modern Fraud Detection
          </h2>
          <p className="text-xl text-dark-muted max-w-3xl mx-auto">
            Enterprise-grade security powered by cutting-edge AI technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-cyan/25">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-dark-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
