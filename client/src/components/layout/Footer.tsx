import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full relative z-10 overflow-hidden bg-bg-primary mt-auto">
      {/* Subtle top gradient separating the page instead of a harsh line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-border-default/30 pb-16">
          <div className="col-span-1 md:col-span-2 pr-0 md:pr-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-text-primary">OmniPool</span>
            </div>
            <p className="text-text-secondary max-w-sm text-sm leading-relaxed mb-8">
              The community-powered platform for sharing hardware, matching with expert mentors, and pushing open-source engineering forward.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo transition-colors" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo transition-colors" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-accent-indigo/10 hover:text-accent-indigo transition-colors" aria-label="Discord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-text-secondary font-medium">
              <li><Link to="/dashboard" className="hover:text-accent-indigo transition-colors">Dashboard</Link></li>
              <li><Link to="/registry" className="hover:text-accent-indigo transition-colors">Hardware Registry</Link></li>
              <li><Link to="/copilot" className="hover:text-accent-indigo transition-colors">AI Copilot</Link></li>
              <li><Link to="/enterprise" className="hover:text-accent-indigo transition-colors">OmniPool Enterprise</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-text-secondary font-medium">
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-6 text-sm text-text-muted font-medium">
          <p>© {new Date().getFullYear()} OmniPool. All rights reserved.</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-emerald/5 border border-accent-emerald/10 text-accent-emerald text-xs tracking-wide">
            <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
