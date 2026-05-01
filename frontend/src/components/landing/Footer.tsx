import React from 'react'
import { Shield, Github, Twitter, Linkedin } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-card border-t border-dark-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">GuardAI</span>
            </div>
            <p className="text-dark-muted max-w-sm">
              Complete Fraud & Threat Detection Platform powered by Agentic AI
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-dark-muted">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-dark-muted">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-dark-muted text-sm">
              © 2024 GuardAI. Final Year Project — B.E Information Technology
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-dark-muted text-sm">Built with:</span>
              <div className="flex items-center space-x-4 text-sm text-dark-muted">
                <span className="text-primary-cyan">LangGraph</span>
                <span>•</span>
                <span className="text-primary-purple">Groq</span>
                <span>•</span>
                <span>Supabase</span>
                <span>•</span>
                <span>FastAPI</span>
                <span>•</span>
                <span>React</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a href="https://github.com" className="text-dark-muted hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="text-dark-muted hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-dark-muted hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
