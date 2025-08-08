import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
}

export function PageLayout({ title, description, children, actions }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">{title}</h1>
                <p className="text-lg" style={{ color: '#887E6F' }}>{description}</p>
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}