import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Shield, Zap, Users } from 'lucide-react'

export const Stats: React.FC = () => {
  const stats = [
    {
      value: "2.4M+",
      label: "Transactions Analyzed",
      icon: TrendingUp,
      color: "from-primary-cyan to-blue-500"
    },
    {
      value: "99.3%",
      label: "Detection Accuracy",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    },
    {
      value: "<180ms",
      label: "Agent Response",
      icon: Zap,
      color: "from-primary-purple to-pink-500"
    },
    {
      value: "2",
      label: "Threat Detection Modules",
      icon: Users,
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Trusted by Leading Financial Institutions
          </h2>
          <p className="text-xl text-dark-muted max-w-2xl mx-auto">
            Real-time fraud detection powered by autonomous AI agents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/10 to-primary-purple/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-dark-muted bg-clip-text text-transparent">
                    {stat.value}
                  </h3>
                  <p className="text-dark-muted font-medium">
                    {stat.label}
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
