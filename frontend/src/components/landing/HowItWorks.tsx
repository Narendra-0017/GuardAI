import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, CheckCircle } from 'lucide-react'

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Shield,
      title: "Threat Received",
      description: "Transaction or email enters the GuardAI pipeline for analysis",
      color: "from-primary-cyan to-blue-500"
    },
    {
      icon: Search,
      title: "Agents Investigate",
      description: "Multiple LangGraph agents analyze and collaborate in real-time",
      color: "from-primary-purple to-pink-500"
    },
    {
      icon: CheckCircle,
      title: "Verdict Delivered",
      description: "Complete fraud investigation report in under 200ms",
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How GuardAI Works
          </h2>
          <p className="text-xl text-dark-muted max-w-3xl mx-auto">
            Our agentic AI pipeline processes threats in milliseconds, not hours
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Lines */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full">
                  <div className="h-0.5 bg-gradient-to-r from-primary-cyan/50 to-primary-purple/50" />
                </div>
              )}

              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-dark-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-cyan text-dark-bg rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
