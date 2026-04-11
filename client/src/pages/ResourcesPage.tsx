import React, { useState } from 'react';

interface ResourceItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  provider: string;
  type: 'community' | 'enterprise';
  status: 'available' | 'low';
}

const DUMMY_RESOURCES: ResourceItem[] = [
  { id: '1', name: 'Raspberry Pi 4 Model B (4GB)', category: 'Microcontrollers', quantity: 2, provider: 'Alex Chen', type: 'community', status: 'available' },
  { id: '2', name: 'NodeMCU ESP32S', category: 'Microcontrollers', quantity: 500, provider: 'ElectroTech Inc.', type: 'enterprise', status: 'available' },
  { id: '3', name: '10k Ohm Resistors (Tape & Reel)', category: 'Passive Components', quantity: 15000, provider: 'Global Circuits Ltd.', type: 'enterprise', status: 'available' },
  { id: '4', name: '0.96 inch OLED Display I2C', category: 'Displays', quantity: 4, provider: 'Sarah Jenkins', type: 'community', status: 'available' },
  { id: '5', name: 'L298N Motor Drive Controller', category: 'Actuators', quantity: 150, provider: 'RoboParts Supplier', type: 'enterprise', status: 'available' },
  { id: '6', name: 'Breadboard Jumper Wires', category: 'Cables & Wire', quantity: 12, provider: 'Mike Ross', type: 'community', status: 'low' },
  { id: '7', name: 'NEMA 17 Stepper Motor', category: 'Actuators', quantity: 400, provider: 'Dynamic Motion Corp.', type: 'enterprise', status: 'available' },
];

const ResourcesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'community' | 'enterprise'>('all');

  const filteredResources = DUMMY_RESOURCES.filter(r => filter === 'all' || r.type === filter);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Surplus <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-text-secondary">
            Browse available electronic components shared by our community and enterprise partners.
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-accent-cyan to-accent-indigo text-white hover:shadow-glow-sm transition-all duration-200 flex items-center gap-2">
          <span>+</span> Add Surplus Component
        </button>
      </div>

      {/* Filters */}
      <div className="flex bg-bg-secondary/50 p-1 rounded-xl w-fit mb-8 border border-border-default">
        {(['all', 'community', 'enterprise'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-bg-card shadow-sm text-text-primary border border-border-default' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((item, i) => (
          <div key={item.id} className="glass-card p-6 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-mono px-2 py-1 rounded-md mb-2 inline-block ${
                item.type === 'enterprise' ? 'bg-accent-indigo/10 text-accent-indigo' : 'bg-accent-emerald/10 text-accent-emerald'
              }`}>
                {item.type.toUpperCase()}
              </span>
              <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                item.status === 'low' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-bg-glass text-text-muted'
              }`}>
                QTY: {item.quantity}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-text-primary mb-1">{item.name}</h3>
            <p className="text-sm text-text-muted mb-6">{item.category}</p>
            
            <div className="mt-auto pt-4 border-t border-border-default/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.type === 'enterprise' ? 'bg-accent-indigo text-white' : 'bg-accent-emerald text-white'
                }`}>
                  {item.provider.charAt(0)}
                </div>
                <span className="text-sm text-text-secondary">{item.provider}</span>
              </div>
              <button className="text-sm text-accent-cyan hover:text-accent-indigo transition-colors font-medium">
                Request
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ResourcesPage;
