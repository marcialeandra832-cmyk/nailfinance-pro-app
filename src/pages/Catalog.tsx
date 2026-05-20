import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit2, 
  TrendingUp,
  Sparkles,
  Tag
} from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { Service, ServiceCategory, UserSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ChevronDown, ChevronUp, Percent, Briefcase } from 'lucide-react';

interface CatalogProps {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void;
  onDelete: (id: string) => void;
  settings?: UserSettings;
}

const CATEGORIES: ServiceCategory[] = [
  'Alongamento',
  'Banho em gel',
  'Manutenção',
  'Esmaltação em gel',
  'Blindagem',
  'Decoração',
  'Outros'
];

export function Catalog({ services, onAdd, onDelete, settings }: CatalogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<ServiceCategory | 'Todos'>('Todos');
  const [search, setSearch] = useState('');

  // Hourly rate interactive calculations
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [desiredSalary, setDesiredSalary] = useState(settings?.profitGoal || 4500);
  const [fixedCosts, setFixedCosts] = useState(1200);
  const [workDaysWeek, setWorkDaysWeek] = useState(5);
  const [workHoursDay, setWorkHoursDay] = useState(7);
  
  // Dynamic selected service simulation
  const [selectedServiceSimId, setSelectedServiceSimId] = useState<string>(services[0]?.id || '');

  // Live calculations
  const totalHoursMonth = workDaysWeek * 4 * workHoursDay;
  const costOfHour = totalHoursMonth > 0 ? (desiredSalary + fixedCosts) / totalHoursMonth : 0;
  
  const selectedServiceSim = services.find(s => s.id === selectedServiceSimId);
  
  // Helper to parse duration: e.g. "2h 30min" -> 2.5
  const durationInHours = React.useMemo(() => {
    if (!selectedServiceSim) return 0;
    const str = selectedServiceSim.duration;
    const hoursRegex = /(\d+)\s*h/;
    const minsRegex = /(\d+)\s*min/;
    
    let hours = 0;
    let mins = 0;
    
    const hMatch = str.match(hoursRegex);
    if (hMatch) hours = parseInt(hMatch[1]);
    
    const mMatch = str.match(minsRegex);
    if (mMatch) mins = parseInt(mMatch[1]);
    
    return hours + (mins / 60);
  }, [selectedServiceSim]);

  const rawHourlyCostSim = durationInHours * costOfHour;
  const totalSuggestedMinSim = Number((rawHourlyCostSim + (selectedServiceSim?.materialCost || 0)).toFixed(2));

  // Auto fallback for selected simulation ID
  useEffect(() => {
    if (services.length > 0 && !selectedServiceSimId) {
      setSelectedServiceSimId(services[0].id);
    }
  }, [services, selectedServiceSimId]);

  const filteredServices = services.filter(s => 
    (filter === 'Todos' || s.category === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-serif font-bold text-brand-navy">Cardápio de Serviços</h1>
          <p className="text-slate-400 mt-1 font-medium">Gerencie seus procedimentos e precificação.</p>
        </motion.div>
        
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-lg shadow-pink-100">
          <Plus size={20} className="mr-2" />
          Novo Serviço
        </Button>
      </header>

      {/* Interactive Simulador de Precificação de Horas */}
      <Card className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy border-none text-white p-6 md:p-8 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-pink/10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-pink mb-1">
              <Calculator size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Exclusivo Nail Design</span>
            </div>
            <h2 className="text-2xl font-serif font-black">Simulador Inteligente de Hora Trabalhada</h2>
            <p className="text-slate-300 text-sm mt-1">Descubra se seus preços estão cobrindo seu salário desejado + custos fixos.</p>
          </div>
          <Button 
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className="bg-brand-pink hover:bg-brand-pink/90 border-none text-white font-bold"
          >
            {isSimulatorOpen ? "Recolher Simulador" : "Simular Meus Preços"}
            {isSimulatorOpen ? <ChevronUp size={16} className="ml-1.5 inline" /> : <ChevronDown size={16} className="ml-1.5 inline" />}
          </Button>
        </div>

        <AnimatePresence>
          {isSimulatorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-white/10 space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Salário Desejado Líquido (R$)</label>
                  <input 
                    type="number" 
                    value={desiredSalary} 
                    onChange={e => setDesiredSalary(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-brand-pink/50 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sua retirada pessoal (Pró-Labore) desejada.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Custos Fixos do Studio (R$)</label>
                  <input 
                    type="number" 
                    value={fixedCosts} 
                    onChange={e => setFixedCosts(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-brand-pink/50 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Aluguel, luz, internet, MEI, água.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Dias de Atend. na Semana</label>
                  <input 
                    type="number" 
                    value={workDaysWeek} 
                    onChange={e => setWorkDaysWeek(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-brand-pink/50 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Ex: 5 dias (terça a sábado).</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Horas Úteis Livres / Dia</label>
                  <input 
                    type="number" 
                    value={workHoursDay} 
                    onChange={e => setWorkHoursDay(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-brand-pink/50 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Foco real em atendimento de mesa.</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resultado do Custo da Hora</p>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-serif font-black text-brand-pink">{formatCurrency(costOfHour)}</span>
                    <span className="text-xs text-slate-300">por hora de mesa trabalhada</span>
                  </div>
                  <p className="text-xs text-slate-400">Total de tempo útil: <span className="text-white font-bold">{totalHoursMonth} horas</span> por mês.</p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 max-w-md">
                  <p className="font-semibold block mb-1">Entenda o Cálculo:</p>
                  Cada hora sua tem um custo mínimo operacional de <span className="text-brand-pink font-bold">{formatCurrency(costOfHour)}</span>. Multiplicando essa hora sobre o tempo que você demora no alongamento e somando os insumos consumidos, chegamos ao seu preço mínimo de venda!
                </div>
              </div>

              {/* Dynamic catalog test */}
              {services.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-serif font-black text-lg text-white">Análise de Viabilidade do Catálogo</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Selecione um serviço cadastrado para conferir o diagnóstico financeiro dele.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-2">Escolha o Serviço</label>
                      <select 
                        value={selectedServiceSimId}
                        onChange={e => setSelectedServiceSimId(e.target.value)}
                        className="w-full bg-white/10 border border-white/10 rounded-2xl p-3 text-white text-sm outline-none focus:border-brand-pink/50 font-bold"
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                            {s.name} ({s.duration})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedServiceSim && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-300 border-b border-white/10 pb-2">Custos Realistas:</p>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tempo de Cadeira ({selectedServiceSim.duration}):</span>
                              <span className="font-bold text-amber-400">{formatCurrency(rawHourlyCostSim)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Insumos & Material:</span>
                              <span className="font-bold text-brand-danger">{formatCurrency(selectedServiceSim.materialCost)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-2 font-black text-sm">
                              <span>Soma de Custos Básicos:</span>
                              <span className="text-brand-pink">{formatCurrency(totalSuggestedMinSim)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center items-center text-center p-4 rounded-xl bg-white/[0.02]">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Diagnóstico Financeiro</p>
                          <p className="text-2xl font-serif font-black text-white">
                            {selectedServiceSim.price >= totalSuggestedMinSim ? (
                              <span className="text-emerald-400">{formatCurrency(selectedServiceSim.price)} (Lucro)</span>
                            ) : (
                              <span className="text-red-400">{formatCurrency(selectedServiceSim.price)} (Prejuízo)</span>
                            )}
                          </p>
                          {selectedServiceSim.price >= totalSuggestedMinSim ? (
                            <div className="mt-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
                              Lucro Real de {formatCurrency(selectedServiceSim.price - totalSuggestedMinSim)} por atendimento!
                            </div>
                          ) : (
                            <div className="mt-2 text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20 font-bold">
                              Perda de {formatCurrency(totalSuggestedMinSim - selectedServiceSim.price)} por atendimento!
                            </div>
                          )}
                          <p className="text-[10px] text-slate-300 mt-2.5 leading-relaxed">
                            {selectedServiceSim.price >= totalSuggestedMinSim 
                              ? "Excelente! Esse preço cobre seu Pró-labore e garante sobra saudável para investir no studio."
                              : "Perigo! O valor atualmente cobrado não cobre nem o seu tempo + materiais. Você está pagando para trabalhar!"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Filters */}
      <Card className="bg-white/50 backdrop-blur-sm border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Input 
              placeholder="Buscar serviço pelo nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} className="text-slate-400" />}
            />
          </div>
          <Select 
            label="Categoria"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            options={[
              { value: 'Todos', label: 'Todas as Categorias' },
              ...CATEGORIES.map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="group hover:border-brand-pink/30 transition-all duration-300 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="default" className="bg-pink-50 text-brand-pink border-none font-bold px-3 py-1">
                    {service.category}
                  </Badge>
                  <button className="text-slate-300 hover:text-brand-navy transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <h3 className="text-xl font-serif font-bold text-brand-navy mb-2 group-hover:text-brand-pink transition-colors">
                  {service.name}
                </h3>
                
                <div className="space-y-3 mt-auto pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-400 text-sm font-medium">
                      <Clock size={14} className="mr-2" />
                      {service.duration}
                    </div>
                    <div className="text-2xl font-serif font-bold text-brand-navy">
                      {formatCurrency(service.price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-300">Custo Mat.</span>
                    <span className="text-brand-danger">{formatCurrency(service.materialCost)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-brand-success text-sm font-black">
                      <TrendingUp size={14} className="mr-1.5" />
                      Lucro: {formatCurrency(service.price - service.materialCost)}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-brand-navy hover:bg-slate-50 rounded-xl transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(service.id)}
                        className="p-2 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-navy">Nenhum serviço encontrado</h3>
            <p className="text-slate-400 mt-2">Tente ajustar seus filtros ou busca.</p>
          </div>
        )}
      </div>

      {/* AI Suggestion Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-brand-pink/5 to-white border-brand-pink/20 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-pink flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-100">
              <Sparkles size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-serif font-bold text-brand-navy mb-2">Dica de Precificação</h4>
              <p className="text-slate-500 font-medium">
                Baseado no mercado atual, seu serviço de <span className="text-brand-pink font-bold">Alongamento em Fibra</span> poderia ter um reajuste de 10% sem perder clientes.
              </p>
            </div>
            <Button variant="outline" className="border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white">
              Analisar Preços
            </Button>
          </div>
        </Card>
      </motion.div>

      {isModalOpen && (
        <ServiceModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={(s) => {
            onAdd(s);
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function ServiceModal({ onClose, onSave }: { onClose: () => void, onSave: (s: Omit<Service, 'id'>) => void }) {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: '',
    price: 0,
    materialCost: 0,
    duration: '',
    category: 'Alongamento',
    notes: ''
  });

  const [showCalculator, setShowCalculator] = useState(false);
  
  // Custom states for the Material Ficha Técnica
  const [poteGel, setPoteGel] = useState({ price: 90, yield: 20 });
  const [prepPrimer, setPrepPrimer] = useState({ price: 45, yield: 60 });
  const [fibraMoldes, setFibraMoldes] = useState({ price: 40, yield: 50 });
  const [lixaBroca, setLixaBroca] = useState({ price: 3, yield: 2 });
  const [epiDescartaveis, setEpiDescartaveis] = useState(3.00);
  const [topCoat, setTopCoat] = useState({ price: 50, yield: 25 });

  const calculatedMaterialCost = React.useMemo(() => {
    const gelCost = poteGel.yield > 0 ? (poteGel.price / poteGel.yield) : 0;
    const prepCost = prepPrimer.yield > 0 ? (prepPrimer.price / prepPrimer.yield) : 0;
    const fibraCost = fibraMoldes.yield > 0 ? (fibraMoldes.price / fibraMoldes.yield) : 0;
    const lixaCost = lixaBroca.yield > 0 ? (lixaBroca.price / lixaBroca.yield) : 0;
    const topCost = topCoat.yield > 0 ? (topCoat.price / topCoat.yield) : 0;

    return Number((gelCost + prepCost + fibraCost + lixaCost + epiDescartaveis + topCost).toFixed(2));
  }, [poteGel, prepPrimer, fibraMoldes, lixaBroca, epiDescartaveis, topCoat]);

  const applyCalculatedCost = () => {
    setFormData({ ...formData, materialCost: calculatedMaterialCost });
    setShowCalculator(false);
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="shadow-2xl border-none p-6 md:p-8 max-h-[90vh] overflow-y-auto bg-white rounded-[3rem]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-serif font-bold text-brand-navy">Novo Procedimento</h2>
            <Badge variant="primary" className="bg-pink-50 text-brand-pink font-bold border-none px-3 py-1">
              {formData.category}
            </Badge>
          </div>
          
          <div className="space-y-6">
            <Input 
              label="Nome do Serviço / Procedimento"
              placeholder="Ex: Alongamento em Fibra de Vidro (Completo)"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Preço Cobrado de Venda (R$)"
                type="number"
                value={formData.price.toString()}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
              <div>
                <Input 
                  label="Custo Estimado Material (R$)"
                  type="number"
                  value={formData.materialCost.toString()}
                  onChange={e => setFormData({...formData, materialCost: Number(e.target.value)})}
                />
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="text-xs font-bold text-brand-pink hover:text-brand-pink/80 mt-1 flex items-center gap-1.5 transition-colors focus:outline-none"
                >
                  <Sparkles size={12} />
                  {showCalculator ? "Ocultar Calculadora" : "📐 Calcular com Ficha de Insumos"}
                </button>
              </div>
            </div>

            {/* Interactive Ficha de Insumos Accoridion */}
            <AnimatePresence>
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-pink-50/40 rounded-3xl p-5 border border-pink-100 space-y-4"
                >
                  <div className="border-b border-pink-100 pb-2">
                    <h3 className="font-serif font-bold text-brand-navy flex items-center gap-2 text-base">
                      <Sparkles size={16} className="text-brand-pink" />
                      Ficha Técnica & Rendimento de Materiais
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Calcule dinamicamente a fração de insumo gasta em cada atendimento.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Gel Input */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm">
                      <p className="font-bold text-brand-navy">Pote de Gel (Ex: 15g ou 30g)</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Preço R$" 
                          value={poteGel.price} 
                          onChange={e => setPoteGel({ ...poteGel, price: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Atend. Úteis" 
                          value={poteGel.yield} 
                          onChange={e => setPoteGel({ ...poteGel, yield: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                      </div>
                    </div>

                    {/* Preps and Primers Input */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm">
                      <p className="font-bold text-brand-navy">Desidratador / Prep / Primers</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Preço R$" 
                          value={prepPrimer.price} 
                          onChange={e => setPrepPrimer({ ...prepPrimer, price: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Atend. Úteis" 
                          value={prepPrimer.yield} 
                          onChange={e => setPrepPrimer({ ...prepPrimer, yield: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                      </div>
                    </div>

                    {/* Fibers and Forms */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm">
                      <p className="font-bold text-brand-navy">Fibra de Vidro (mola/rolo) / Moldes</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Preço R$" 
                          value={fibraMoldes.price} 
                          onChange={e => setFibraMoldes({ ...fibraMoldes, price: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Atend. Úteis" 
                          value={fibraMoldes.yield} 
                          onChange={e => setFibraMoldes({ ...fibraMoldes, yield: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                      </div>
                    </div>

                    {/* Lixas / Brocas */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm">
                      <p className="font-bold text-brand-navy">Lixas (Bloko/Banana) / Brocas</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Preço R$" 
                          value={lixaBroca.price} 
                          onChange={e => setLixaBroca({ ...lixaBroca, price: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Atend. Úteis" 
                          value={lixaBroca.yield} 
                          onChange={e => setLixaBroca({ ...lixaBroca, yield: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                      </div>
                    </div>

                    {/* Top Coat */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm">
                      <p className="font-bold text-brand-navy">Top Coat & Selante (Finalizador)</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Preço R$" 
                          value={topCoat.price} 
                          onChange={e => setTopCoat({ ...topCoat, price: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                        <input 
                          type="number" 
                          placeholder="Atend. Úteis" 
                          value={topCoat.yield} 
                          onChange={e => setTopCoat({ ...topCoat, yield: Number(e.target.value) })}
                          className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                        />
                      </div>
                    </div>

                    {/* EPIs and Disposables flat */}
                    <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-pink-100/30 shadow-sm justify-center flex flex-col">
                      <p className="font-bold text-brand-navy">EPI (Mascara, Luvas, Touca, Wipes)</p>
                      <input 
                        type="number" 
                        placeholder="Custo flat por cliente R$" 
                        value={epiDescartaveis} 
                        onChange={e => setEpiDescartaveis(Number(e.target.value))}
                        className="p-2 border border-brand-border rounded-xl text-xs w-full outline-none" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Custo Calculado por Atendimento</p>
                      <p className="text-xl font-serif font-black text-brand-pink">{formatCurrency(calculatedMaterialCost)}</p>
                    </div>
                    <Button type="button" size="sm" onClick={applyCalculatedCost} className="bg-brand-navy text-white">
                      Aplicar Custo na Ficha
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Duração Média (Horas/Minutos)"
                placeholder="Ex: 2h 30min"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
              <Select 
                label="Categoria do Procedimento"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ServiceCategory})}
                options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              />
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="ghost" fullWidth onClick={onClose} className="text-slate-400">Cancelar</Button>
              <Button type="button" fullWidth onClick={() => onSave(formData)} className="shadow-lg shadow-pink-100">Salvar Serviço</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
