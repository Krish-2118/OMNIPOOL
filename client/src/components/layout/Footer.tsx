import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-bg-primary pt-12 pb-8 px-4 border-t border-border-default">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-2xl font-bold tracking-tight text-text-primary mb-2">OmniPool</div>
          <p className="text-sm text-text-muted max-w-xs text-center md:text-left leading-relaxed">
             The community-powered platform for sharing hardware and finding expert mentors.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-text-secondary">
           <Link to="/dashboard" className="hover:text-text-primary transition-colors">Platform</Link>
           <span className="hover:text-text-primary transition-colors cursor-pointer">Resources</span>
           <span className="hover:text-text-primary transition-colors cursor-pointer">Community</span>
           <span className="hover:text-text-primary transition-colors cursor-pointer">GitHub</span>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-4">
         <span>© {new Date().getFullYear()} OmniPool. Built with ❤️ for makers.</span>
         <div className="flex gap-4">
           <span className="cursor-pointer hover:text-text-primary">Privacy</span>
           <span className="cursor-pointer hover:text-text-primary">Terms</span>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
