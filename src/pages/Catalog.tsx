import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Clock, 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  X,
  Sparkles,
  Tag,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '../components/UI';
import { formatCurrency } from '../lib/utils';
import { Service, ServiceCategory, UserSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CatalogProps {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void;
  onUpdate?: (service: Service) => void;
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

export function Catalog({ services, onAdd, onUpdate, onDelete, settings }: CatalogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [filter, setFilter] = useState<ServiceCategory | 'Todos'>('Todos');
  const [search, setSearch] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [duration, setDuration] = useState('1h 30min');
  const [category, setCategory] = useState<ServiceCategory>('Alongamento');
  const [notes, setNotes] = useState('');

  // Hourly Rate Simulator
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [desiredSalary, setDesiredSalary] = useState(settings?.profitGoal || 4500);
  const [fixedCosts, setFixedCosts] = useState(1200);
  const [workDaysWeek, setWorkDaysWeek] = useState(5);
  const [workHoursDay, setWorkHoursDay] = useState(7);
  const [selectedServiceSimId, setSelectedServiceSimId] = useState<string>(services[0]?.id || '');

  const totalHoursMonth = workDaysWeek * 4 * workHoursDay;
  const costOfHour = totalHoursMonth > 0 ? (desiredSalary + fixedCosts) / totalHoursMonth : 0;
  const selectedServiceSim = services.find(s => s.id === selectedServiceSimId);

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

  useEffect(() => {
    if (services.length > 0 && !selectedServiceSimId) {
      setSelectedServiceSimId(services[0].id);
    }
  }, [services, selectedServiceSimId]);

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setPrice('');
    setMaterialCost('');
    setDuration('1h 30min');
    setCategory('Alongamento');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setPrice(String(s.price));
    setMaterialCost(String(s.materialCost));
    setDuration(s.duration);
    setCategory(s.category);
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedCost = parseFloat(materialCost) || 0;

    if (!name.trim()) {
      toast.error('Informe o nome do procedimento.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Informe um valor de preço válido.');
      return;
    }

    if (editingService) {
      if (onUpdate) {
        onUpdate({
          ...editingService,
          name,
          price: parsedPrice,
          materialCost: parsedCost,
          duration,
          category,
          notes
        });
      }
    } else {
      onAdd({
        name,
        price: parsedPrice,
        materialCost: parsedCost,
        duration,
        category,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const filteredServices = services.filter(s => 
    (filter === 'Todos' || s.category === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">Catálogo de Serviços</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Precifique procedimentos considerando insumos e tempo de bancada.</p>
        </div>
        
        <Button onClick={openNewModal} size="lg" className="shadow-lg shadow-pink-200">
          <Plus size={20} className="mr-2" />
          Novo Procedimento
        </Button>
      </header>

      {/* Simulator Card */}
      <Card className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy border-none text-white p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-400 mb-1">
              <Calculator size={18} />
              <span className="text-[10px] font-black uppercase tracking-wider">Metodologia para Nail Designers</span>
            </div>
            <h2 className="text-2xl font-serif font-bold">Simulador de Valor de Hora Trabalhada</h2>
            <p className="text-blue-100/80 text-xs md:text-sm mt-1">Calcule se seus preços cobrem seu salário pretendido + custos operacionais fixos.</p>
          </div>
          <Button 
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold border-none"
          >
            {isSimulatorOpen ? "Ocultar Simulador" : "Simular Preço Ideal"}
            {isSimulatorOpen ? <ChevronUp size={16} className="ml-2 inline" /> : <ChevronDown size={16} className="ml-2 inline" />}
          </Button>
        </div>

        <AnimatePresence>
          {isSimulatorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/10 space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="sim-salary" className="text-xs font-bold text-slate-300 block mb-1">Salário Desejado (Pró-Labore)</label>
                  <input 
                    id="sim-salary"
                    type="number" 
                    value={desiredSalary} 
                    onChange={e => setDesiredSalary(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white text-sm outline-none font-bold focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="sim-costs" className="text-xs font-bold text-slate-300 block mb-1">Custos Fixos Studio (R$)</label>
                  <input 
                    id="sim-costs"
                    type="number" 
                    value={fixedCosts} 
                    onChange={e => setFixedCosts(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white text-sm outline-none font-bold focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="sim-days" className="text-xs font-bold text-slate-300 block mb-1">Dias por Semana</label>
                  <input 
                    id="sim-days"
                    type="number" 
                    value={workDaysWeek} 
                    onChange={e => setWorkDaysWeek(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white text-sm outline-none font-bold focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="sim-hours" className="text-xs font-bold text-slate-300 block mb-1">Horas por Dia</label>
                  <input 
                    id="sim-hours"
                    type="number" 
                    value={workHoursDay} 
                    onChange={e => setWorkHoursDay(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white text-sm outline-none font-bold focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-pink-300 font-bold uppercase">Custo Médio da sua Hora</p>
                  <p className="text-3xl font-serif font-bold text-white">{formatCurrency(costOfHour)}/hora</p>
                </div>
                
                {services.length > 0 && (
                  <div className="space-y-1 md:text-right">
                    <label htmlFor="sim-service-select" className="text-xs text-gray-300 font-bold block">Testar Procedimento:</label>
                    <select
                      id="sim-service-select"
                      value={selectedServiceSimId}
                      onChange={e => setSelectedServiceSimId(e.target.value)}
                      className="bg-brand-navy border border-white/20 rounded-xl text-xs text-white p-2 font-bold"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>
                      ))}
                    </select>
                    {selectedServiceSim && (
                      <p className="text-xs text-emerald-400 font-bold mt-1">
                        Preço Sugerido Mínimo: {formatCurrency(totalSuggestedMinSim)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('Todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'Todos' ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-gray-500 border border-brand-border hover:bg-gray-50'
            }`}
          >
            Todos ({services.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = services.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === cat ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-gray-500 border border-brand-border hover:bg-gray-50'
                }`}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <Input 
            aria-label="Buscar procedimento no catálogo"
            placeholder="Buscar procedimento..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card className="py-16 text-center text-gray-500 bg-white border-brand-border">
          <p className="font-bold text-lg text-brand-navy mb-2">Nenhum procedimento encontrado</p>
          <p className="text-xs mb-6">Cadastre seus serviços de unha para visualizar margens e preços.</p>
          <Button onClick={openNewModal} size="sm">
            <Plus size={16} className="mr-1" /> Cadastrar Procedimento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const margin = service.price > 0 
              ? (((service.price - service.materialCost) / service.price) * 100) 
              : 0;

            return (
              <Card key={service.id} className="bg-white border-brand-border hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="primary">{service.category}</Badge>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => openEditModal(service)}
                        aria-label={`Editar ${service.name}`}
                        className="p-1.5 text-gray-400 hover:text-brand-navy rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeleteConfirmId(service.id)}
                        aria-label={`Excluir ${service.name}`}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-brand-navy mb-2">{service.name}</h3>

                  <div className="space-y-2 py-3 border-y border-gray-100 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Preço Cobrado:</span>
                      <strong className="text-brand-navy text-sm">{formatCurrency(service.price)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo de Material Estimado:</span>
                      <span className="text-red-600 font-bold">{formatCurrency(service.materialCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duração do Atendimento:</span>
                      <span className="flex items-center gap-1 text-gray-500 font-bold">
                        <Clock size={12} /> {service.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-gray-400 block font-bold">Margem de Lucro Bruta</span>
                    <strong className="text-emerald-600 font-bold text-sm">{margin.toFixed(0)}%</strong>
                  </div>
                  <Badge variant={margin >= 60 ? 'success' : 'warning'}>
                    {margin >= 60 ? 'Alta Rentabilidade' : 'Atenção Margem'}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onKeyDown={e => e.key === 'Escape' && setDeleteConfirmId(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            >
              <h3 id="delete-dialog-title" className="text-lg font-bold text-brand-navy">Excluir Procedimento?</h3>
              <p className="text-xs text-gray-500 font-medium">Esta ação não pode ser desfeita. Deseja remover este serviço do catálogo?</p>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmId(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" fullWidth onClick={() => confirmDelete(deleteConfirmId)}>
                  Sim, Excluir
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onKeyDown={e => e.key === 'Escape' && setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-lg w-full p-8 relative shadow-2xl space-y-6"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-brand-navy transition-colors"
              >
                <X size={20} />
              </button>

              <h2 id="service-modal-title" className="text-2xl font-serif font-bold text-brand-navy">
                {editingService ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="service-name" className="block text-xs font-bold text-gray-600 mb-1">Nome do Serviço *</label>
                  <input 
                    id="service-name"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Alongamento Fibra de Vidro"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="service-price" className="block text-xs font-bold text-gray-600 mb-1">Preço Cobrado (R$) *</label>
                    <input 
                      id="service-price"
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="180.00"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="service-cost" className="block text-xs font-bold text-gray-600 mb-1">Custo Insumos (R$)</label>
                    <input 
                      id="service-cost"
                      type="number"
                      step="0.01"
                      value={materialCost}
                      onChange={e => setMaterialCost(e.target.value)}
                      placeholder="35.00"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="service-duration" className="block text-xs font-bold text-gray-600 mb-1">Duração Estimada</label>
                    <input 
                      id="service-duration"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="1h 30min"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="service-category" className="block text-xs font-bold text-gray-600 mb-1">Categoria</label>
                    <select 
                      id="service-category"
                      value={category}
                      onChange={e => setCategory(e.target.value as ServiceCategory)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
