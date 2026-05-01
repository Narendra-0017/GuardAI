import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    organization: 'GuardAI Inc.',
    role: 'Administrator'
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: '30'
  })

  const [notificationData, setNotificationData] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    fraudAlerts: true,
    systemUpdates: false
  })

  const [systemData, setSystemData] = useState({
    timezone: 'UTC',
    language: 'en',
    theme: 'dark',
    autoRefresh: '30',
    logLevel: 'info'
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Settings }
  ]

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully')
  }

  const handleSaveSecurity = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    toast.success('Security settings updated')
    setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated')
  }

  const handleSaveSystem = () => {
    toast.success('System settings updated')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-dark-muted">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20'
                  : 'text-dark-muted hover:text-white hover:bg-dark-bg'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization</label>
                    <input
                      type="text"
                      value={profileData.organization}
                      onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-6">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveSecurity}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-6">Security Options</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-dark-muted">Add an extra layer of security to your account</div>
                    </div>
                    <button
                      onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securityData.twoFactorEnabled ? 'bg-primary-cyan' : 'bg-dark-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                    <select
                      value={securityData.sessionTimeout}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive important updates via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Get instant notifications in your browser' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly fraud detection summaries' },
                  { key: 'fraudAlerts', label: 'Fraud Alerts', description: 'Immediate alerts for suspicious activities' },
                  { key: 'systemUpdates', label: 'System Updates', description: 'Notifications about system maintenance' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-dark-muted">{item.description}</div>
                    </div>
                    <button
                      onClick={() => setNotificationData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notificationData] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationData[item.key as keyof typeof notificationData] ? 'bg-primary-cyan' : 'bg-dark-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationData[item.key as keyof typeof notificationData] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-6">System Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select
                      value={systemData.timezone}
                      onChange={(e) => setSystemData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={systemData.language}
                      onChange={(e) => setSystemData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={systemData.theme}
                      onChange={(e) => setSystemData(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto Refresh (seconds)</label>
                    <select
                      value={systemData.autoRefresh}
                      onChange={(e) => setSystemData(prev => ({ ...prev, autoRefresh: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                    >
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Log Level</label>
                  <select
                    value={systemData.logLevel}
                    onChange={(e) => setSystemData(prev => ({ ...prev, logLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSystem}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
