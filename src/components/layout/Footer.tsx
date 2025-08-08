import { Building2, Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="glass-card border-t-0 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Institutional Branding */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #98002E 0%, #887E6F 100%)'
                }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gradient">
                  Fertility Benefits Toolkit
                </h3>
                <p className="text-sm" style={{ color: '#887E6F' }}>
                  Research by Haotian Bai
                </p>
              </div>
            </div>
            
            {/* Researcher Information */}
            <div className="mb-4">
              <p className="text-sm font-medium" style={{ color: '#8C1515' }}>
                Independent Research Project
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center text-sm" style={{ color: '#887E6F' }}>
                <Mail className="w-4 h-4 mr-2" />
                <span>contact@haotianbai.com</span>
              </div>
              <p className="text-xs text-gray-600">
                Research Project<br />
                2025
              </p>
            </div>
          </div>

          {/* Research & Resources */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-4" style={{ color: '#98002E' }}>
              Research & Resources
            </h4>
            <div className="space-y-3 text-sm">
              <a 
                href="#about" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                About This Research
              </a>
              <a 
                href="#research" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Research Methodology
              </a>
              <a 
                href="#findings" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Key Findings
              </a>
              <a 
                href="#contact" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Contact Researcher
              </a>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-4" style={{ color: '#98002E' }}>
              Legal Information
            </h4>
            <div className="space-y-3 text-sm">
              <a 
                href="#privacy" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Privacy Policy
              </a>
              <a 
                href="#accessibility" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Accessibility
              </a>
              <a 
                href="#citations" 
                className="block hover:underline" 
                style={{ color: '#887E6F' }}
              >
                Research Citations
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h5 className="font-semibold mb-3" style={{ color: '#98002E' }}>
              Important Disclaimers
            </h5>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Not Professional Advice:</strong> The information and tools provided on this website are for educational and research purposes only. They do not constitute financial, legal, medical, or professional advice. Always consult with qualified professionals before making business decisions or implementing benefit programs.
              </p>
              <p>
                <strong>ROI Calculations:</strong> Return on investment calculations are estimates based on general market data and assumptions. Actual results may vary significantly based on individual company circumstances, implementation approaches, and market conditions.
              </p>
              <p>
                <strong>Data Accuracy:</strong> While we strive to provide accurate and up-to-date information, market conditions and statistics change frequently. Users should verify current data before making decisions.
              </p>
              <p>
                <strong>Research Opinions:</strong> The analysis and opinions expressed on this website are those of Haotian Bai and are based on independent research.
              </p>
            </div>
          </div>
        </div>

        {/* Research Citations */}
        <div id="citations" className="border-t border-gray-200 pt-8">
          <h5 className="font-semibold mb-4" style={{ color: '#98002E' }}>
            Research Citations & Data Sources
          </h5>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium mb-2">All statistics verified as of July 2025:</p>
            
            <p>Carrot Fertility. (2024). <em>State of fertility benefits report 2024</em>. Retrieved from https://www.get-carrot.com</p>
            
            <p>International Foundation of Employee Benefit Plans. (2024). <em>2024 Employee benefits survey results</em>. Retrieved from https://www.ifebp.org</p>
            
            <p>KFF. (2024). <em>2024 Employer health benefits survey</em>. Kaiser Family Foundation. Retrieved from https://www.kff.org</p>
            
            <p>Maven Clinic. (2025). <em>Fertility coverage: What top employers are doing differently in 2025</em>. Retrieved from https://www.mavenclinic.com</p>
            
            <p>Mercer. (2023). <em>National survey of employer-sponsored health plans</em>. Retrieved from https://www.mercer.com</p>
            
            <p>Precedence Research. (2025). <em>Fertility market size and forecast 2025-2034</em>. Retrieved from https://www.precedenceresearch.com</p>
            
            <p>Society for Human Resource Management. (2024). <em>More employers offering fertility, adoption benefits</em>. Retrieved from https://www.shrm.org</p>
            
            <p>Towards Healthcare. (2025). <em>Fertility market soars 9.06% CAGR to hit $87.05 bn by 2034</em>. Retrieved from https://www.towardshealthcare.com</p>
            
            <p className="mt-4 italic">
              Note: All market data and statistics are sourced from reputable industry organizations and research firms. For complete methodologies and detailed citations, please refer to the original source publications.
            </p>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="border-t border-gray-200 pt-6 mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2025 Haotian Bai. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This is an independent research project. All analysis and opinions are those of the researcher.
          </p>
        </div>
      </div>
    </footer>
  )
}