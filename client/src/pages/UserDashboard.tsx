import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardProvider, useDashboardContext } from '../context/DashboardContext';
import { LayoutDashboard, FolderKanban, Component, Settings, Sparkles, Cpu, Code2, Users, Search, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SIDEBAR COMPONENT ---
const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/dashboard' },
    { icon: Component, label: 'Registry', path: '/registry' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/50 backdrop-blur-xl border-r border-border-default p-6 z-10 sticky top-[64px] h-[calc(100vh-64px)]">
      <div className="mb-10 mt-2">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Workspace</h2>
      </div>
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          
          return (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo ${
                isActive 
                ? 'bg-accent-indigo/10 text-accent-indigo font-semibold' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-bg-secondary to-white border border-border-default">
          <p className="text-xs text-text-muted mb-3">Enterprise Plan Active</p>
          <div className="flex items-center gap-2 text-accent-emerald text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            System Online
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- SKELETON LOADER ---
const BentoSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-bg-tertiary rounded-md w-1/3 mb-6" />
    <div className="space-y-3">
      <div className="h-10 bg-bg-secondary rounded-lg w-full" />
      <div className="h-10 bg-bg-secondary rounded-lg w-full" />
      <div className="h-10 bg-bg-secondary rounded-lg w-3/4" />
    </div>
  </div>
);

// --- MAIN DASHBOARD CONTENT ---
const DashboardContent = () => {
  const { projectPrompt, setProjectPrompt, isLoading, hasLoaded, aiResult, matchedHardware, matchedMentors, submitPrompt } = useDashboardContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      submitPrompt();
    }
  };

  return (
    <main className="flex-1 bg-bg-primary bg-grid-texture p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Center AI Input */}
        <section className="max-w-3xl mx-auto text-center" aria-label="AI Project Builder">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-xs font-mono mb-6">
            <Sparkles className="w-3 h-3" /> AI Builder
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-6 tracking-tight">
            Describe Your Next <span className="text-accent-indigo">Innovation</span>
          </h1>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-indigo to-accent-violet rounded-2xl blur-md opacity-15 group-focus-within:opacity-30 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white/80 backdrop-blur-xl border border-border-default rounded-2xl shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-indigo transition-all">
              <textarea
                value={projectPrompt}
                onChange={(e) => setProjectPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="E.g., I want to build a self-watering smart planter using an ESP32 and soil sensors..."
                className="w-full h-32 md:h-40 bg-transparent text-text-primary placeholder-text-muted p-6 resize-none outline-none text-lg"
                aria-label="Project Description"
              />
              <div className="flex justify-between items-center p-4 border-t border-border-default bg-bg-secondary/30">
                <span className="text-xs text-text-muted hidden sm:inline-block">Press <kbd className="font-mono bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary">Cmd+Enter</kbd> to build</span>
                <button
                  onClick={submitPrompt}
                  disabled={isLoading || !projectPrompt.trim()}
                  className="flex items-center gap-2 bg-accent-indigo hover:bg-accent-violet disabled:bg-bg-tertiary disabled:text-text-muted text-white font-medium px-6 py-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate Resources <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid layout */}
        {(isLoading || hasLoaded) && (
          <section
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
            aria-live="polite"
            aria-atomic="true"
            aria-busy={isLoading}
          >
            <AnimatePresence mode="popLayout">
              {/* 1. Bill of Materials */}
              <motion.article 
                key="bom-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-[1.5rem] relative overflow-hidden focus-within:ring-2 focus-within:ring-accent-indigo"
                tabIndex={0}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-accent-indigo/10 rounded-xl text-accent-indigo">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">Bill of Materials</h3>
                </div>
                {isLoading ? <BentoSkeleton /> : (
                  <ul className="space-y-3">
                    {aiResult?.extrapolated_BOM?.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-bg-secondary/60 p-3.5 rounded-xl border border-border-default/50">
                        <span className="text-sm font-medium text-text-primary">{item.hardware_name}</span>
                        <span className="text-xs font-mono font-bold bg-accent-indigo/10 text-accent-indigo px-2.5 py-1 rounded-lg">x{item.quantity}</span>
                      </li>
                    ))}
                    {!aiResult?.extrapolated_BOM?.length && <p className="text-text-muted text-sm">No hardware detected.</p>}
                  </ul>
                )}
              </motion.article>

              {/* 2. Required Technical Skills */}
              <motion.article 
                key="skills-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-[1.5rem] relative overflow-hidden focus-within:ring-2 focus-within:ring-accent-cyan"
                tabIndex={0}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-accent-cyan/10 rounded-xl text-accent-cyan">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">Required Skills</h3>
                </div>
                {isLoading ? <BentoSkeleton /> : (
                  <div className="flex flex-wrap gap-2">
                    {aiResult?.required_skills?.map((skill, idx) => (
                      <span key={idx} className="text-xs font-medium bg-bg-secondary border border-border-default text-text-secondary px-3 py-1.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {!aiResult?.required_skills?.length && <p className="text-text-muted text-sm">No specific skills parsed.</p>}
                  </div>
                )}
              </motion.article>

              {/* 3. Matched Local Hardware */}
              <motion.article 
                key="hardware-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-[1.5rem] relative overflow-hidden focus-within:ring-2 focus-within:ring-accent-emerald"
                tabIndex={0}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-accent-emerald/10 rounded-xl text-accent-emerald">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">Local Hardware Matches</h3>
                </div>
                {isLoading ? <BentoSkeleton /> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedHardware?.length > 0 ? matchedHardware.map((hw, idx) => (
                      <div key={idx} className="bg-bg-secondary/60 p-3.5 rounded-xl border border-border-default/50 flex flex-col">
                        <span className="text-sm font-medium text-text-primary truncate">{hw.name}</span>
                        <span className="text-xs text-accent-emerald mt-1">{hw.status}</span>
                      </div>
                    )) : (
                      <p className="text-text-muted text-sm col-span-2">No local community hardware available for these parts yet.</p>
                    )}
                  </div>
                )}
              </motion.article>

              {/* 4. Matched Mentors */}
              <motion.article 
                key="mentors-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-[1.5rem] relative overflow-hidden focus-within:ring-2 focus-within:ring-accent-rose"
                tabIndex={0}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-accent-rose/10 rounded-xl text-accent-rose">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">Expert Mentors</h3>
                </div>
                {isLoading ? <BentoSkeleton /> : (
                  <ul className="space-y-3">
                    {matchedMentors?.length > 0 ? matchedMentors.map((mentor, idx) => (
                      <li key={idx} className="flex items-center gap-3 bg-bg-secondary/60 p-3.5 rounded-xl border border-border-default/50">
                        <div className="w-9 h-9 rounded-full bg-accent-indigo/10 flex items-center justify-center text-xs font-bold text-accent-indigo">
                          {mentor.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-primary">{mentor.name}</span>
                          <span className="text-xs text-text-muted truncate">{(mentor.expertise ?? (mentor as any).skills ?? []).slice(0,2).join(', ')}</span>
                        </div>
                      </li>
                    )) : (
                      <p className="text-text-muted text-sm">No matched mentors nearby.</p>
                    )}
                  </ul>
                )}
              </motion.article>
            </AnimatePresence>
          </section>
        )}
      </div>
    </main>
  );
};

// --- ROOT PAGE COMPONENT ---
const UserDashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <div className="flex min-h-[calc(100vh-64px)] bg-bg-primary font-sans">
        <Sidebar />
        <DashboardContent />
      </div>
    </DashboardProvider>
  );
};

export default UserDashboard;
