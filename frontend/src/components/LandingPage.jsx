import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Presentation, 
  Zap, 
  RefreshCw, 
  Download,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Let advanced AI create professional content for your documents in seconds using Google Gemini."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Word Documents",
      description: "Generate structured Word documents with custom sections, perfect for reports and proposals."
    },
    {
      icon: <Presentation className="w-6 h-6" />,
      title: "PowerPoint Slides",
      description: "Create compelling presentations with AI-generated content for each slide automatically."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Smart Refinement",
      description: "Refine any section with custom prompts. Make it formal, add examples, or simplify language."
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Instant Export",
      description: "Export your finished documents to DOCX or PPTX with one click, ready to use."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Generate entire documents in minutes instead of hours. Focus on editing, not writing."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Document Type",
      description: "Select between Word document or PowerPoint presentation"
    },
    {
      number: "02",
      title: "Define Structure",
      description: "Set your topic and define sections or slides"
    },
    {
      number: "03",
      title: "Generate Content",
      description: "AI creates professional content for each section"
    },
    {
      number: "04",
      title: "Refine & Export",
      description: "Polish with AI refinement, then download your document"
    }
  ];

  const stats = [
    { number: "10x", label: "Faster" },
    { number: "100+", label: "Documents" },
    { number: "AI", label: "Powered" },
    { number: "2", label: "Formats" }
  ];

  return (
    <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-mocha-mantle/95 dark:bg-mocha-mantle/95 light:bg-latte-mantle/95 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-mocha-crust dark:text-mocha-crust light:text-latte-base" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender bg-clip-text text-transparent">
                DocAI
              </span>
            </div>

            {/* Desktop Navigation */}
            
<div className="hidden md:flex items-center space-x-8">
  <a href="#features" className="px-2 py-2 text-mocha-text hover:text-mocha-mauve transition-colors">
    Features
  </a>
  <a href="#how-it-works" className="px-2 py-2 text-mocha-text hover:text-mocha-mauve transition-colors">
    How It Works
  </a>
  <a href="#pricing" className="px-2 py-2 text-mocha-text hover:text-mocha-mauve transition-colors">
    Pricing
  </a>

  <button onClick={() => navigate('/login')}
    className="px-4 py-2 text-mocha-text hover:text-mocha-mauve transition-colors">
    Login
  </button>

  <button onClick={() => navigate('/register')}
    className="px-6 py-2 bg-gradient-to-r from-mocha-mauve to-mocha-lavender text-mocha-crust rounded-lg transition-all font-semibold">
    Get Started
  </button>
</div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-mocha-text dark:text-mocha-text light:text-latte-text"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-t border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block py-2 text-mocha-text dark:text-mocha-text light:text-latte-text">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 text-mocha-text dark:text-mocha-text light:text-latte-text">
                How It Works
              </a>
              <a href="#pricing" className="block py-2 text-mocha-text dark:text-mocha-text light:text-latte-text">
                Pricing
              </a>
              <button
                onClick={() => navigate('/login')}
                className="block w-full text-left py-2 text-mocha-text dark:text-mocha-text light:text-latte-text"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="block w-full px-6 py-2 bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-mocha-lavender/10 dark:bg-mocha-lavender/10 light:bg-latte-lavender/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 rounded-full border border-mocha-mauve/30 dark:border-mocha-mauve/30 light:border-latte-mauve/30 mb-8">
              <Sparkles className="w-4 h-4 text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve" />
              <span className="text-sm text-mocha-text dark:text-mocha-text light:text-latte-text font-medium">
                Powered by Google Gemini AI
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-mocha-text dark:text-mocha-text light:text-latte-text">Create Documents</span>
              <br />
              <span className="bg-gradient-to-r from-mocha-mauve via-mocha-lavender to-mocha-blue dark:from-mocha-mauve dark:via-mocha-lavender dark:to-mocha-blue light:from-latte-mauve light:via-latte-lavender light:to-latte-blue bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-10 leading-relaxed">
              Generate professional Word documents and PowerPoint presentations with AI.
              <br className="hidden md:block" />
              From outline to export in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-4 bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-xl hover:shadow-2xl hover:shadow-mocha-mauve/50 dark:hover:shadow-mocha-mauve/50 light:hover:shadow-latte-mauve/50 transition-all duration-300 font-semibold text-lg flex items-center space-x-2"
              >
                <span>Start Creating Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
              Powerful features to streamline your document creation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-mocha-base dark:bg-mocha-base light:bg-latte-base rounded-xl border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 hover:border-mocha-mauve dark:hover:border-mocha-mauve light:hover:border-latte-mauve transition-all duration-300 hover:shadow-lg hover:shadow-mocha-mauve/20 dark:hover:shadow-mocha-mauve/20 light:hover:shadow-latte-mauve/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender rounded-lg flex items-center justify-center text-mocha-crust dark:text-mocha-crust light:text-latte-base mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-4">
              How It Works
            </h2>
            <p className="text-xl text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
              Four simple steps to create amazing documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender opacity-30"></div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender rounded-2xl shadow-lg mb-6">
                    <span className="text-3xl font-bold text-mocha-crust dark:text-mocha-crust light:text-latte-base">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-mocha-mauve via-mocha-lavender to-mocha-blue dark:from-mocha-mauve dark:via-mocha-lavender dark:to-mocha-blue light:from-latte-mauve light:via-latte-lavender light:to-latte-blue rounded-3xl p-12 shadow-2xl">
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-mocha-crust dark:text-mocha-crust light:text-latte-base mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-mocha-crust/80 dark:text-mocha-crust/80 light:text-latte-base/80 mb-8">
                Join thousands creating documents faster with AI
              </p>
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-mocha-crust dark:bg-mocha-crust light:bg-latte-base text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve rounded-xl hover:bg-mocha-mantle dark:hover:bg-mocha-mantle light:hover:bg-latte-mantle transition-all duration-300 font-bold text-lg shadow-lg"
              >
                Get Started for Free
              </button>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-mocha-crust/10 dark:bg-mocha-crust/10 light:bg-latte-base/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-mocha-crust/10 dark:bg-mocha-crust/10 light:bg-latte-base/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-t border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-mocha-crust dark:text-mocha-crust light:text-latte-base" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-mocha-mauve to-mocha-lavender dark:from-mocha-mauve dark:to-mocha-lavender light:from-latte-mauve light:to-latte-lavender bg-clip-text text-transparent">
                DocAI
              </span>
            </div>
            <div className="flex space-x-8 text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
              <a href="#" className="hover:text-mocha-mauve dark:hover:text-mocha-mauve light:hover:text-latte-mauve transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-mocha-mauve dark:hover:text-mocha-mauve light:hover:text-latte-mauve transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-mocha-mauve dark:hover:text-mocha-mauve light:hover:text-latte-mauve transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 text-sm">
            © 2025 DocAI. Powered by Google Gemini. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
