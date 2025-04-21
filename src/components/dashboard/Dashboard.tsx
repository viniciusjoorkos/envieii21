import React, { useState } from 'react';
import { Home, MessageSquare, Settings, Link, MessageCircle, Trophy } from 'lucide-react';
import { SUP } from '@/components/SUP';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'conectar', label: 'Conectar', icon: Link },
    { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
    { id: 'desafios', label: 'Desafios', icon: Trophy },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'sup', label: 'Sup', icon: MessageSquare },
  ];

  return (
    <div className="flex h-full">
      <div className="w-64 bg-background border-r">
        <nav className="p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && <div>Dashboard Content</div>}
        {activeTab === 'conectar' && <div>Conectar Content</div>}
        {activeTab === 'mensagens' && <div>Mensagens Content</div>}
        {activeTab === 'desafios' && <div>Desafios Content</div>}
        {activeTab === 'configuracoes' && <div>Configurações Content</div>}
        {activeTab === 'sup' && <SUP />}
      </div>
    </div>
  );
};

export default Dashboard; 