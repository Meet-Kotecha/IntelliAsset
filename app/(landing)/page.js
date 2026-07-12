'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  Sparkles, 
  Package, 
  Bot, 
  Shield, 
  Calendar, 
  Wrench, 
  BarChart, 
  CheckCircle, 
  Users, 
  Briefcase,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.1 });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const features = [
    {
      icon: Package,
      title: 'Asset Management',
      description: 'Track every asset from registration to retirement with complete lifecycle visibility.'
    },
    {
      icon: Bot,
      title: 'AI Asset Copilot',
      description: 'Ask questions in plain English and get instant answers about your assets.'
    },
    {
      icon: Shield,
      title: 'Predictive Maintenance',
      description: 'AI-powered health scores and risk prediction to prevent failures before they happen.'
    },
    {
      icon: Calendar,
      title: 'Resource Booking',
      description: 'Book meeting rooms, vehicles, and shared equipment with real-time availability.'
    },
    {
      icon: Wrench,
      title: 'Maintenance Workflow',
      description: 'Streamlined approval and tracking for all maintenance requests.'
    },
    {
      icon: BarChart,
      title: 'Analytics & Reports',
      description: 'Actionable insights with CSV and PDF export for informed decision-making.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Register & Organize',
      description: 'Add assets, departments, and employees to build your digital inventory.'
    },
    {
      step: '02',
      title: 'Allocate & Book',
      description: 'Assign assets to employees and book shared resources with conflict detection.'
    },
    {
      step: '03',
      title: 'Monitor & Predict',
      description: 'AI continuously analyzes asset health and predicts maintenance needs.'
    },
    {
      step: '04',
      title: 'Analyze & Optimize',
      description: 'Export reports and get AI-powered recommendations to improve efficiency.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CTO, TechFlow Inc.',
      content: 'IntelliAsset transformed how we manage our equipment. The AI copilot alone saves us hours every week.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Director, GlobalServe',
      content: 'Predictive maintenance has reduced our downtime by 40%. This is the future of asset management.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'IT Manager, InnovateLabs',
      content: 'The role-based dashboards make it easy for everyone to see exactly what they need. Brilliant UX.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'What is IntelliAsset?',
      answer: 'IntelliAsset is an AI-powered enterprise asset and resource management platform that helps organizations track, manage, and optimize their physical assets.'
    },
    {
      question: 'How does the AI Copilot work?',
      answer: 'The AI Copilot uses natural language processing to understand your questions and provides instant answers about asset location, ownership, maintenance history, and more.'
    },
    {
      question: 'Is IntelliAsset suitable for small businesses?',
      answer: 'Absolutely. IntelliAsset scales from startups to large enterprises with flexible role-based access and modular features.'
    },
    {
      question: 'Can I try IntelliAsset for free?',
      answer: 'Yes! Sign up for a free demo account and explore all features with our sample data.'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">IntelliAsset</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90" size="sm">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
              <Link href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
              <Link href="#faq" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">AI-Powered Enterprise Asset Management</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Beyond Asset Tracking.
              <span className="gradient-text block">Towards Asset Intelligence.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              IntelliAsset is an AI-powered Enterprise Asset & Resource Management Platform that helps organizations manage assets, maintenance, bookings, audits, and predictive maintenance.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-base px-8 py-6 h-auto">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="text-base px-8 py-6 h-auto">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>14-day free demo</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section ref={statsRef} className="py-16 px-4 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Assets Managed', value: '10K+', icon: Package },
              { label: 'Organizations', value: '500+', icon: Users },
              { label: 'Assets Tracked', value: '99.9%', icon: CheckCircle },
              { label: 'Predictive Accuracy', value: '94%', icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2">
                  <stat.icon className="w-4 h-4 text-purple-400" />
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" ref={featuresRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Manage Assets
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From registration to retirement, IntelliAsset provides complete visibility and control over your enterprise assets.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className="glass p-6 hover:border-purple-500/30 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to intelligent asset management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{item.step}</div>
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose IntelliAsset?</h2>
              <p className="text-muted-foreground mb-6">
                Built for enterprises who need more than just a spreadsheet. IntelliAsset combines powerful asset management with AI-driven insights.
              </p>
              <div className="space-y-3">
                {[
                  'AI-powered predictive maintenance',
                  'Natural language asset queries',
                  'Enterprise-grade role-based access',
                  'Real-time analytics and reporting',
                  'Seamless resource booking'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-border/50 overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Interactive Dashboard Preview</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-12 rounded bg-white/5 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" ref={testimonialsRef} className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Teams Worldwide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about IntelliAsset
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="glass p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" ref={faqRef} className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about IntelliAsset
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="glass rounded-lg p-4 group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Asset Management?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of organizations already using IntelliAsset.
          </p>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-base px-8 py-6 h-auto">
              Start Free Demo <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">IntelliAsset</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-Powered Enterprise Asset Management</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} IntelliAsset. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}