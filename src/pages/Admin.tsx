
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, CreditCard, MessageSquare, BarChart3, LogOut, Search, Filter, Check, X, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UsageChart from '@/components/UsageChart';

const Admin = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("todos");
  
  // Sample dummy data for the admin dashboard
  const stats = {
    activeUsers: 24,
    activeToday: 12,
    purchases: 18,
    totalMessages: 256789
  };
  
  const mockUsers = [
    { id: "1", name: "João Silva", email: "joao@email.com", address: "Av. Paulista, 1000", plan: "Premium", status: "Ativo", paymentMethod: "Cartão", envieiiToken: "ENV-123456", openaiStatus: true, whatsappStatus: true, messagesUsed: 24650, limit: 100000 },
    { id: "2", name: "Maria Oliveira", email: "maria@email.com", address: "Rua Augusta, 500", plan: "Avançado", status: "Ativo", paymentMethod: "Boleto", envieiiToken: "ENV-234567", openaiStatus: true, whatsappStatus: true, messagesUsed: 38421, limit: 40000 },
    { id: "3", name: "Carlos Santos", email: "carlos@email.com", address: "Rua Oscar Freire, 200", plan: "Básico", status: "Pendente", paymentMethod: "Pix", envieiiToken: "ENV-345678", openaiStatus: false, whatsappStatus: true, messagesUsed: 2133, limit: 10000 },
    { id: "4", name: "Ana Pereira", email: "ana@email.com", address: "Alameda Santos, 800", plan: "Premium", status: "Ativo", paymentMethod: "Cartão", envieiiToken: "ENV-456789", openaiStatus: true, whatsappStatus: false, messagesUsed: 72105, limit: 100000 },
    { id: "5", name: "Marcos Almeida", email: "marcos@email.com", address: "Rua Haddock Lobo, 300", plan: "Básico", status: "Pendente", paymentMethod: "Pix", envieiiToken: "ENV-567890", openaiStatus: false, whatsappStatus: false, messagesUsed: 9876, limit: 10000 }
  ];
  
  const activityChartData = [
    { name: "Seg", value: 1200 },
    { name: "Ter", value: 1400 },
    { name: "Qua", value: 2000 },
    { name: "Qui", value: 1800 },
    { name: "Sex", value: 2400 },
    { name: "Sab", value: 1500 },
    { name: "Dom", value: 1000 }
  ];
  
  const handleLogout = () => {
    navigate('/');
  };

  const filteredUsers = mockUsers.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPlan !== "todos" && user.plan !== filterPlan) {
      return false;
    }
    if (selectedUser !== "todos" && user.id !== selectedUser) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <header className="bg-card-bg border-b border-matrix-green/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold text-matrix-green" style={{ textShadow: '0 0 10px #00FF41' }}>
            ENVIEII ADMIN
          </h1>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="text-matrix-green border-matrix-green/50 hover:bg-matrix-green/10"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-matrix-green border-matrix-green/50 hover:bg-matrix-green/10"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-mono">Usuários Ativos</CardTitle>
              <Users className="h-5 w-5 text-matrix-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-matrix-green">{stats.activeUsers}</div>
              <p className="text-foreground/60 text-sm mt-1">Total de contas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-mono">Ativos Hoje</CardTitle>
              <User className="h-5 w-5 text-matrix-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-matrix-green">{stats.activeToday}</div>
              <p className="text-foreground/60 text-sm mt-1">Usuários online</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-mono">Compras</CardTitle>
              <CreditCard className="h-5 w-5 text-matrix-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-matrix-green">{stats.purchases}</div>
              <p className="text-foreground/60 text-sm mt-1">Total de vendas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-mono">Mensagens</CardTitle>
              <MessageSquare className="h-5 w-5 text-matrix-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-matrix-green">{stats.totalMessages.toLocaleString()}</div>
              <p className="text-foreground/60 text-sm mt-1">Mensagens enviadas</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-card-bg border-matrix-green/20 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-matrix-green" />
                Atividade da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart data={activityChartData} color="#00FF41" />
            </CardContent>
          </Card>
          
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader>
              <CardTitle className="font-mono">Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-foreground/80">Plano Premium</p>
                    <p className="text-sm text-foreground/80">40%</p>
                  </div>
                  <div className="w-full h-2 bg-dark-bg rounded-full">
                    <div className="w-[40%] h-full bg-matrix-green rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-foreground/80">Plano Avançado</p>
                    <p className="text-sm text-foreground/80">35%</p>
                  </div>
                  <div className="w-full h-2 bg-dark-bg rounded-full">
                    <div className="w-[35%] h-full bg-matrix-green rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-foreground/80">Plano Básico</p>
                    <p className="text-sm text-foreground/80">25%</p>
                  </div>
                  <div className="w-full h-2 bg-dark-bg rounded-full">
                    <div className="w-[25%] h-full bg-matrix-green rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card className="bg-card-bg border-matrix-green/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono flex items-center gap-2">
                <Users className="h-5 w-5 text-matrix-green" />
                Gerenciamento de Usuários
              </CardTitle>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60 h-4 w-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="bg-dark-bg border-matrix-green/30 pl-10 text-foreground w-[250px]"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="text-foreground/60 h-4 w-4" />
                  <Select value={filterPlan} onValueChange={setFilterPlan}>
                    <SelectTrigger className="w-[150px] border-matrix-green/30 text-foreground">
                      <SelectValue placeholder="Filtrar por plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-matrix-green/30">
                      <SelectItem value="todos">Todos os planos</SelectItem>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const usagePercent = Math.round((user.messagesUsed / user.limit) * 100);
                    const isOverLimit = user.messagesUsed > user.limit;
                    
                    return (
                      <div 
                        key={user.id} 
                        className="relative overflow-hidden rounded-xl bg-dark-bg/30 backdrop-blur-md border border-matrix-green/20 p-6 group transition-all duration-300 hover:bg-dark-bg/50 animate-fade-in"
                      >
                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="grid md:grid-cols-3 gap-6 relative z-10">
                          <div>
                            <h3 className="text-xl font-medium text-foreground mb-1 flex items-center gap-2">
                              {user.name}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'Ativo' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {user.status}
                              </span>
                            </h3>
                            <p className="text-foreground/70 mb-4">{user.email}</p>
                            
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <span className="text-foreground/50 text-sm">Endereço:</span>
                                <span className="text-foreground/80 text-sm">{user.address}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-foreground/50 text-sm">Pagamento:</span>
                                <span className="text-foreground/80 text-sm">{user.paymentMethod}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-foreground/50 text-sm">Token ENVIEII:</span>
                                <span className="text-matrix-green text-sm font-mono">{user.envieiiToken}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-foreground/70 mb-3">Status das Conexões</h4>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground/80">OpenAI</span>
                                    {user.openaiStatus ? (
                                      <Check size={16} className="text-green-400" />
                                    ) : (
                                      <X size={16} className="text-red-400" />
                                    )}
                                  </div>
                                  <span className="text-xs text-foreground/60">{user.openaiStatus ? 'Conectado' : 'Desconectado'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${user.openaiStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse-slow`} style={{ width: user.openaiStatus ? '100%' : '100%' }}></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground/80">WhatsApp</span>
                                    {user.whatsappStatus ? (
                                      <Check size={16} className="text-green-400" />
                                    ) : (
                                      <X size={16} className="text-red-400" />
                                    )}
                                  </div>
                                  <span className="text-xs text-foreground/60">{user.whatsappStatus ? 'Conectado' : 'Desconectado'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${user.whatsappStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse-slow`} style={{ width: user.whatsappStatus ? '100%' : '100%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-foreground/70 mb-3">Plano e Consumo</h4>
                            <div className="bg-dark-bg/50 rounded-lg p-4 border border-matrix-green/10">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-medium text-foreground">{user.plan}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                                >
                                  Alterar
                                </Button>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-foreground/80">Mensagens</span>
                                    <span className="text-sm">
                                      <span className={isOverLimit ? 'text-red-400' : 'text-foreground/80'}>
                                        {user.messagesUsed.toLocaleString()}
                                      </span>
                                      <span className="text-foreground/60">/{user.limit.toLocaleString()}</span>
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-matrix-green'}`}
                                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-center space-x-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    className="text-xs bg-dark-bg border border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                                  >
                                    Detalhes
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="text-xs bg-dark-bg border border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                                  >
                                    Conversar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-foreground/60">
                    <p>Nenhum usuário encontrado com os filtros atuais</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
