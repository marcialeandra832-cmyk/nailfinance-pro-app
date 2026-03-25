import React, { useState } from 'react';
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
import { Service, ServiceCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogProps {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void;
  onDelete: (id: string) => void;
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

export function Catalog({ services, onAdd, onDelete }: CatalogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<ServiceCategory | 'Todos'>('Todos');
  const [search, setSearch] = useState('');

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

  return (
    <div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <Card className="w-full max-w-lg shadow-2xl border-none p-8">
          <h2 className="text-3xl font-serif font-bold text-brand-navy mb-8">Novo Serviço</h2>
          <div className="space-y-6">
            <Input 
              label="Nome do Serviço"
              placeholder="Ex: Alongamento Fibra de Vidro"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Preço (R$)"
                type="number"
                value={formData.price.toString()}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
              <Input 
                label="Custo Material (R$)"
                type="number"
                value={formData.materialCost.toString()}
                onChange={e => setFormData({...formData, materialCost: Number(e.target.value)})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Duração"
                placeholder="Ex: 2h 30min"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
              <Select 
                label="Categoria"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ServiceCategory})}
                options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              />
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" fullWidth onClick={onClose} className="text-slate-400">Cancelar</Button>
              <Button fullWidth onClick={() => onSave(formData)} className="shadow-lg shadow-pink-100">Salvar Serviço</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
