import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gradient-hero">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
    </div>
  );
};

/* ===== Hero Section ===== */
const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-indigo/10 rounded-full blur-3xl animate-float" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-violet/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} 
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          The Community{' '}
          <span className="gradient-text">Hardware & Skill</span>{' '}
          Exchange
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Describe your project in plain English. Our AI extracts exactly what hardware you need,
          finds it in your community, and connects you with expert mentors — all in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/dashboard">
            <Button size="lg" variant="primary">
              Start Building
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link to="/registry">
            <Button size="lg" variant="secondary">
              Explore Registry
            </Button>
          </Link>
        </motion.div>

        {/* Preview badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16"
        >
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3 text-sm text-text-secondary">
            <span className="text-accent-emerald font-mono font-bold">✓</span>
            <span>Works without sign-up in development mode</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ===== Features Section ===== */
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🔧',
      title: 'Share Hardware',
      description: 'List your idle Raspberry Pis, Arduinos, sensors, and tools for your community to borrow.',
      color: 'from-accent-cyan to-accent-emerald',
    },
    {
      icon: '🧠',
      title: 'AI-Powered Matching',
      description: 'Describe your project in natural language. Our AI generates a complete BOM and matches resources instantly.',
      color: 'from-accent-indigo to-accent-violet',
    },
    {
      icon: '👥',
      title: 'Find Mentors',
      description: 'Connect with nearby experts who have the exact skills your project needs. Learn while you build.',
      color: 'from-accent-violet to-accent-rose',
    },
  ];

  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Build Faster</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            OmniPool brings together hardware sharing, AI project analysis, and community mentorship in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3, margin: "100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="glass-card p-8 text-center group hover:border-accent-indigo/50 transition-colors"
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                flex items-center justify-center text-2xl mx-auto mb-5
                group-hover:scale-110 group-hover:shadow-glow-md transition-all duration-300
              `}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===== How It Works Section ===== */
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Describe Your Project',
      description: 'Type what you want to build in plain English. "I want to build a weather station with a temperature sensor and display."',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'AI Analyzes & Matches',
      description: 'Gemini AI extracts a complete Bill of Materials, identifies required skills, and searches your community for matching resources.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      step: '03',
      title: 'Connect & Build',
      description: 'Borrow available hardware from neighbors, team up with skilled mentors, and bring your project to life.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll within the "How It Works" container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"] // The animation triggers precisely as the block crosses the middle of the screen
  });

  // Spring physical physics for smooth scrolling reaction
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="py-24 px-4 bg-bg-secondary/30 relative" ref={containerRef}>
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            From idea to reality in three simple steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Base Desktop Horizontal Line (Faded) */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-slate-800 rounded z-0" />
          
          {/* Animated Glow Line Progress (Desktop) */}
          <motion.div 
            className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-indigo to-accent-violet rounded z-0 origin-left"
            style={{ scaleX: lineProgress }} 
          />

          {/* Base Mobile Vertical Line (Faded) */}
          <div className="block md:hidden absolute top-0 bottom-0 left-8 w-1 bg-slate-800 rounded z-0" />
          
          {/* Animated Glow Line Progress (Mobile) */}
          <motion.div 
            className="block md:hidden absolute top-0 bottom-0 left-8 w-1 bg-gradient-to-b from-accent-cyan via-accent-indigo to-accent-violet rounded z-0 origin-top"
            style={{ scaleY: lineProgress }} 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 w-full">
            {steps.map((step, index) => {
              // Create local intersections to ping pong bubbles
              const stepRef = useRef(null);
              const isInView = useInView(stepRef, { margin: "-20% 0px -20% 0px", once: true });
              
              return (
                <div 
                  key={step.step}
                  ref={stepRef} 
                  className={`
                    relative flex flex-col items-center md:text-center text-left md:items-center
                    flex-row md:flex-col gap-6 md:gap-0 pl-20 md:pl-0
                  `}
                >
                  {/* Step bubble */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                    className={`
                      absolute md:relative left-0 md:left-auto top-0 md:top-auto
                      inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                      transition-colors duration-500
                      ${isInView ? 'shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-slate-900 border-accent-indigo text-accent-indigo' : 'bg-bg-tertiary border-border-default text-text-muted'}
                      border-2 z-10 mb-5 
                    `}
                  >
                    {step.icon}
                  </motion.div>

                  <div>
                    <div className="text-xs font-mono text-accent-violet mb-2 hidden md:block">{step.step}</div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== Stats Section ===== */
const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Hardware Items Shared', value: 2847, suffix: '+' },
    { label: 'Projects Matched', value: 1203, suffix: '+' },
    { label: 'Community Mentors', value: 456, suffix: '' },
    { label: 'Cities Connected', value: 89, suffix: '' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="glass-card p-10 md:p-14 border border-accent-indigo/10 shadow-[0_0_60px_rgba(99,102,241,0.05)]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <AnimatedCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

const AnimatedCounter: React.FC<{ stat: StatItem }> = ({ stat }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const start = performance.now();
      
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * stat.value));
        
        if (progress < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView, stat.value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-sm text-text-muted">{stat.label}</div>
    </div>
  );
};

export default LandingPage;
