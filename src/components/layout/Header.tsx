import { memo } from 'react'
import { Calculator, BarChart3, FileText, Globe, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Header = memo(function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'roi-calculator', label: 'ROI Calculator', icon: Calculator },
    { id: 'ai-dashboard', label: 'AI Dashboard', icon: BarChart3 },
    { id: 'policy-tracker', label: 'Policy Tracker', icon: FileText },
    { id: 'global-comparator', label: 'Global Comparator', icon: Globe },
  ]

  return (
    <header className="glass-card border-b-0 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #98002E 0%, #887E6F 100%)'
              }}
              aria-hidden="true"
            >
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Fertility Benefits Toolkit</h1>
              <p className="text-sm" style={{ color: '#887E6F' }}>
                Fertility Benefits Research • Haotian Bai
              </p>
            </div>
          </div>
          
          <nav className="flex space-x-2" role="navigation" aria-label="Main navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 glass-button transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-800/20 to-red-900/20 text-red-900 border-red-200' 
                      : 'hover:bg-white/30'
                  }`}
                  style={{
                    color: isActive ? '#98002E' : '#887E6F'
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${tab.label}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
})