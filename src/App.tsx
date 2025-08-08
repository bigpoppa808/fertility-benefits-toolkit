import { useState, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { LoadingSpinner } from '@/components/layout/LoadingSpinner'
import { Calculator, BarChart3, FileText, Globe, ArrowRight, TrendingUp, Cpu } from 'lucide-react'
import { Toaster } from 'sonner'

// Lazy load main components
const ROICalculator = lazy(() => import('@/components/roi/ROICalculator').then(m => ({ default: m.ROICalculator })))
const AIDashboard = lazy(() => import('@/components/dashboard/AIDashboard').then(m => ({ default: m.AIDashboard })))
const PolicyTracker = lazy(() => import('@/components/policy/PolicyTracker').then(m => ({ default: m.PolicyTracker })))
const GlobalComparator = lazy(() => import('@/components/global/GlobalComparator').then(m => ({ default: m.GlobalComparator })))
const AgentMonitor = lazy(() => import('@/components/agents/AgentMonitor').then(m => ({ default: m.AgentMonitor })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  const [activeTab, setActiveTab] = useState('roi-calculator')
  const [showHero, setShowHero] = useState(true)

  const features = [
    {
      icon: Calculator,
      title: "ROI Calculator",
      description: "Calculate return on investment for fertility benefit programs with real-time customization",
      image: "/roi-abstract.png",
      id: "roi-calculator"
    },
    {
      icon: BarChart3,
      title: "AI Dashboard",
      description: "Advanced analytics and benchmarking data with AI-powered insights",
      image: "/dashboard-mockup.png",
      id: "ai-dashboard"
    },
    {
      icon: FileText,
      title: "Policy Tracker",
      description: "Monitor fertility-related legislation and policy changes in real-time",
      image: "/institution-building.png",
      id: "policy-tracker"
    },
    {
      icon: Globe,
      title: "Global Comparator",
      description: "International fertility benefits comparison and market analysis",
      image: "/pattern-bg.png",
      id: "global-comparator"
    }
  ]

  const stats = [
    { label: "Employer Adoption Rate", value: "42%", trend: "+12%" },
    { label: "Large Employer IVF Coverage", value: "45%", trend: "+23%" },
    { label: "Would Switch Jobs for Benefits", value: "65%", trend: "+5%" },
    { label: "Market Size (2025)", value: "$39.9B", trend: "+9.1%" }
  ]

  const renderActiveComponent = () => {
    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading component..." />
      </div>
    )

    switch (activeTab) {
      case 'roi-calculator':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ROICalculator />
          </Suspense>
        )
      case 'ai-dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AIDashboard />
          </Suspense>
        )
      case 'policy-tracker':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PolicyTracker />
          </Suspense>
        )
      case 'global-comparator':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <GlobalComparator />
          </Suspense>
        )
      case 'agent-monitor':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AgentMonitor />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ROICalculator />
          </Suspense>
        )
    }
  }

  const handleGetStarted = () => {
    setShowHero(false)
    setActiveTab('roi-calculator')
  }

  const handleFeatureClick = (featureId: string) => {
    setShowHero(false)
    setActiveTab(featureId)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen">
          {showHero ? (
            <>
              {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div 
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url('/hero-meeting.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70 z-10" />
                
                {/* Research Branding */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                  <div className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: '#887E6F' }}>
                    FERTILITY BENEFITS RESEARCH
                  </div>
                  <div className="text-xs sm:text-sm italic" style={{ color: '#98002E' }}>
                    Haotian Bai
                  </div>
                </div>

                <div className="container mx-auto px-4 z-20 text-center lg:text-left pt-20 sm:pt-24 md:pt-0">
                  <div className="max-w-4xl mx-auto lg:mx-0">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-6 text-gradient leading-tight">
                      Fertility Benefits Toolkit
                    </h1>
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 font-medium" style={{ color: '#887E6F' }}>
                      Independent Research by Haotian Bai
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                      Comprehensive tools for analyzing, implementing, and optimizing fertility benefit programs 
                      for employers. Supporting veteran families and advancing economic opportunity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                      <Button 
                        size="lg" 
                        onClick={handleGetStarted}
                        className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-800 to-red-900 text-white border-none hover:from-red-900 hover:to-red-950 shadow-lg w-full sm:w-auto"
                      >
                        Get Started <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="glass-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                        style={{ borderColor: '#887E6F', color: '#887E6F' }}
                      >
                        View Research
                      </Button>
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {stats.map((stat, index) => (
                        <Card key={index} className="glass-card text-center">
                          <CardContent className="p-2 sm:p-3 md:p-4">
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-gradient">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</div>
                            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {stat.trend}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Overview */}
              <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Comprehensive Business Development Suite</h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                      Professional-grade tools designed for HR leaders, policy makers, and fertility benefit consultants
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {features.map((feature, index) => (
                      <Card 
                        key={index} 
                        className="glass-card overflow-hidden group cursor-pointer"
                        onClick={() => handleFeatureClick(feature.id)}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={feature.image} 
                            alt={feature.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <feature.icon className="w-8 h-8 text-white mb-2" />
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                          <CardDescription className="text-gray-600">
                            {feature.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url('/military-families.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="container mx-auto px-4 text-center relative z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Benefits Strategy?</h2>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-gray-300">
                    Join leading employers who are using fertility benefits to attract, retain, and support their workforce—especially our nation's veterans.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted}
                      className="bg-red-800 hover:bg-red-900 text-white px-8 py-4"
                    >
                      Start Analysis
                    </Button>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4">
                      Download Research
                    </Button>
                  </div>
                </div>
              </section>
              <Footer />
            </>
          ) : (
            <>
              <Header activeTab={activeTab} onTabChange={setActiveTab} />
              <main className="pt-4">
                <div className="container mx-auto px-4 mb-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowHero(true)}
                    className="mb-4"
                  >
                    ← Back to Overview
                  </Button>
                </div>
                {renderActiveComponent()}
              </main>
              <Footer />
            </>
          )}
          <Toaster position="top-right" richColors />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App