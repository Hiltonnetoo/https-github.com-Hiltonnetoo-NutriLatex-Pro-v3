
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  FileDown, 
  User, 
  Clock, 
  Utensils, 
  ClipboardCheck, 
  AlertTriangle,
  ChefHat,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Settings2,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientData, Meal, Recipe, Choice, ClinicalPlan } from './types';
import { generateClinicalPlan } from './geminiService';

const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientData>({
    name: 'Hilton Luiz da Cunha',
    age: '60',
    weight: '64', // Apenas o número
    height: '1,64', // Com vírgula
    goal: 'Controle Glicêmico e Pressão',
    diagnosis: 'Diabetes Mellitus Tipo 2, Hipertensão Arterial'
  });

  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', time: '07:00', name: 'Café da Manhã', description: 'Crepioca (1 un) ou Cuscuz (1 pedaço médio). 2 ovos. 1 col de Linhaça.' },
    { id: '2', time: '12:30', name: 'Almoço', description: 'Salada crua à vontade. 1 pedaço de frango/peixe. 1 concha de feijão. 1 col de arroz integral.' },
    { id: '3', time: '19:00', name: 'Jantar', description: 'Sopa de legumes com frango. Salada crua. 1 col de linhaça.' }
  ]);

  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 'r1', title: 'MIX DE TEMPEROS (Substituto do Sal)', ingredients: '1 col Sal Grosso, 1 col Orégano, 1 col Alecrim, 1 col Açafrão.', instructions: 'Bata tudo no liquidificador até virar um pó fino. Use para temperar arroz e feijão.' }
  ]);
  
  const [choices, setChoices] = useState<Choice[]>([
    { good: 'Tilápia, Merluza, Atum, Frango', bad: 'Presunto, Salame, Salsicha, Linguiça' },
    { good: 'Leite Vegetal, Azeite de Oliva', bad: 'Manteiga, Queijos gordos, Margarina' },
    { good: 'Arroz Integral, Quinoa, Inhame', bad: 'Arroz Branco, Pão Francês, Biscoitos' }
  ]);

  const [alerts, setAlerts] = useState<string>('Beber 2L de água/dia.\nDeixar feijão de molho 12h e descartar água.');
  const [plan, setPlan] = useState<ClinicalPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateClinicalPlan(patient, meals, recipes, choices, alerts);
      setPlan(generatedPlan);
    } catch (error) {
      alert("Erro ao gerar o plano. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const opt = {
      margin: 0,
      filename: `Plano_${patient.name.replace(/ /g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const addMeal = () => setMeals([...meals, { id: Date.now().toString(), time: '', name: '', description: '' }]);
  const updateMeal = (id: string, field: keyof Meal, value: string) => setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
  const removeMeal = (id: string) => setMeals(meals.filter(m => m.id !== id));

  const addRecipe = () => setRecipes([...recipes, { id: Date.now().toString(), title: '', ingredients: '', instructions: '' }]);
  const updateRecipe = (id: string, field: keyof Recipe, value: string) => setRecipes(recipes.map(r => r.id === id ? { ...r, [field]: value } : r));
  const removeRecipe = (id: string) => setRecipes(recipes.filter(r => r.id !== id));

  const addChoice = () => setChoices([...choices, { good: '', bad: '' }]);
  const updateChoice = (idx: number, field: keyof Choice, value: string) => {
    const n = [...choices]; n[idx][field] = value; setChoices(n);
  };
  const removeChoice = (idx: number) => setChoices(choices.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen flex flex-col font-['Noto_Sans']">
      <header className="bg-[#2E8B57] text-white p-5 shadow-lg flex justify-between items-center no-print sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white text-[#2E8B57] p-2 rounded-lg shadow-inner">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">NutriLatex Pro v3</h1>
            <p className="text-xs opacity-80 font-medium tracking-wide">Isabelle Cristina - CRN 11000</p>
          </div>
        </div>
        <div className="flex gap-3">
          {plan && (
            <button 
              onClick={downloadPDF}
              className="bg-white text-[#2E8B57] px-4 py-2 rounded-full font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-md active:scale-95"
            >
              <FileDown size={16} /> Baixar PDF Final
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
            title="Reiniciar"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-100">
        <div className="w-full lg:w-[400px] xl:w-[450px] p-6 overflow-y-auto border-r border-slate-200 no-print space-y-8 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-800 border-b pb-2">
            <Settings2 size={18} className="text-emerald-600" />
            <h2 className="font-black uppercase text-xs tracking-widest">Configuração Clínica</h2>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-tighter">
              <User size={14} /> Dados do Paciente
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome</label>
                  <input className="w-full p-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={patient.name} onChange={e=>setPatient({...patient, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Peso (Ex: 75)</label>
                  <input className="w-full p-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: 70" value={patient.weight} onChange={e=>setPatient({...patient, weight: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Altura (Ex: 1,75)</label>
                  <input className="w-full p-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: 1,60" value={patient.height} onChange={e=>setPatient({...patient, height: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-tighter">
                <Utensils size={14} /> Plano Alimentar
              </div>
              <button onClick={addMeal} className="text-emerald-600 bg-emerald-50 p-1 rounded-md hover:bg-emerald-100"><Plus size={16}/></button>
            </div>
            <div className="space-y-3">
              {meals.map(m => (
                <div key={m.id} className="p-3 border rounded-xl bg-white shadow-sm relative group">
                  <button onClick={()=>removeMeal(m.id)} className="absolute -top-2 -right-2 text-red-500 bg-white shadow rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                  <div className="flex gap-2 mb-2">
                    <input className="w-16 p-1 text-xs border rounded bg-slate-50" placeholder="07:00" value={m.time} onChange={e=>updateMeal(m.id, 'time', e.target.value)} />
                    <input className="flex-grow p-1 text-xs border rounded bg-slate-50 font-bold" placeholder="Refeição" value={m.name} onChange={e=>updateMeal(m.id, 'name', e.target.value)} />
                  </div>
                  <textarea className="w-full p-2 text-[11px] border rounded bg-slate-50 h-16 outline-none focus:ring-1 focus:ring-emerald-300" placeholder="Opções de alimentos..." value={m.description} onChange={e=>updateMeal(m.id, 'description', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-tighter">
                <ChefHat size={14} /> Receitas Práticas
              </div>
              <button onClick={addRecipe} className="text-orange-600 bg-orange-50 p-1 rounded-md hover:bg-orange-100"><Plus size={16}/></button>
            </div>
            <div className="space-y-3">
              {recipes.map(r => (
                <div key={r.id} className="p-3 border border-orange-100 rounded-xl bg-orange-50/20 relative group">
                  <button onClick={()=>removeRecipe(r.id)} className="absolute -top-2 -right-2 text-red-500 bg-white shadow rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                  <input className="w-full p-1 text-xs border rounded mb-2 font-bold" placeholder="Título da Receita" value={r.title} onChange={e=>updateRecipe(r.id, 'title', e.target.value)} />
                  <textarea className="w-full p-2 text-[10px] border rounded mb-2 h-14" placeholder="Ingredientes..." value={r.ingredients} onChange={e=>updateRecipe(r.id, 'ingredients', e.target.value)} />
                  <textarea className="w-full p-2 text-[10px] border rounded h-14" placeholder="Modo de Preparo..." value={r.instructions} onChange={e=>updateRecipe(r.id, 'instructions', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-tighter">
                <HelpCircle size={14} /> Escolhas Inteligentes
              </div>
              <button onClick={addChoice} className="text-emerald-600 bg-emerald-50 p-1 rounded-md hover:bg-emerald-100"><Plus size={16}/></button>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              {choices.map((c, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 relative group pb-2 border-b last:border-0 border-slate-100">
                  <button onClick={()=>removeChoice(i)} className="absolute -top-1 -right-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={12}/></button>
                  <div>
                    <label className="text-[8px] font-bold text-emerald-600 uppercase">Sim</label>
                    <textarea className="w-full p-1 text-[10px] border rounded bg-emerald-50/30 h-14" value={c.good} onChange={e=>updateChoice(i, 'good', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-red-600 uppercase">Não</label>
                    <textarea className="w-full p-1 text-[10px] border rounded bg-red-50/30 h-14" value={c.bad} onChange={e=>updateChoice(i, 'bad', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-tighter">
              <AlertTriangle size={14} /> Alertas Clínicos
            </div>
            <textarea 
              className="w-full p-3 bg-red-50 border border-red-100 rounded-xl text-xs h-24 text-red-900 outline-none focus:ring-1 focus:ring-red-300"
              placeholder="Ex: Beber 2L de água..."
              value={alerts}
              onChange={e => setAlerts(e.target.value)}
            />
          </section>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Eye size={20} />}
            {isGenerating ? "Processando Inteligência..." : "Gerar Prévia PDF"}
          </button>
          
          <div className="h-10"></div>
        </div>

        <div className="flex-grow bg-slate-200 overflow-y-auto p-4 lg:p-10 flex flex-col items-center custom-scrollbar">
          {!plan ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50">
              <div className="p-8 bg-white rounded-full shadow-inner">
                <FileDown size={80} strokeWidth={0.5} />
              </div>
              <p className="font-bold uppercase tracking-widest text-xs">Preencha os dados e clique em Gerar Prévia</p>
            </div>
          ) : (
            <div id="pdf-content" ref={pdfRef} className="space-y-8 pb-20">
              <div className="latex-page shadow-2xl">
                <div className="verde-clinico-bg p-8 text-center text-white mb-8 rounded-b-3xl">
                  <h1 className="text-4xl font-black uppercase leading-tight tracking-tight">Planejamento Alimentar</h1>
                  <div className="w-16 h-1 bg-white mx-auto my-3 opacity-50 rounded-full"></div>
                  <p className="text-sm font-medium tracking-[0.2em] opacity-90">Personalizado & Terapêutico</p>
                </div>

                <div className="flex justify-between items-end mb-8 text-sm border-b-2 border-slate-100 pb-6 px-4">
                  <div className="space-y-2">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Identificação do Paciente</p>
                    <p className="text-lg font-black text-slate-800 uppercase">{plan.patient.name}</p>
                    <div className="flex gap-4 text-xs font-bold text-slate-600">
                       <span className="bg-slate-100 px-2 py-1 rounded">Peso: {plan.patient.weight}</span>
                       <span className="bg-slate-100 px-2 py-1 rounded">Altura: {plan.patient.height}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-slate-400">{plan.date}</p>
                    <p className="text-[11px] text-emerald-700 font-black uppercase tracking-tighter">Nutr. Isabelle Cristina - CRN 11000</p>
                  </div>
                </div>

                <div className="space-y-6 px-4">
                  {plan.meals.map((meal, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-[2px] bg-emerald-200"></div>
                         <h3 className="verde-clinico-text font-black text-sm uppercase tracking-widest">{meal.name} <span className="text-slate-400 font-normal ml-2">[{meal.time}]</span></h3>
                      </div>
                      <div className="fundo-suave-bg p-4 border-l-4 border-emerald-500 rounded-r-xl text-[13px] leading-relaxed text-slate-700 shadow-sm font-medium italic">
                        {meal.description}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 mx-4 border-2 alertred-border alertred-bg rounded-2xl overflow-hidden shadow-md">
                  <div className="bg-[#B22222] text-white px-6 py-3 font-black text-xs uppercase flex items-center gap-3 tracking-widest">
                    <AlertTriangle size={16} /> Importante: Notas de Segurança Clínica
                  </div>
                  <div className="p-5 text-[12px] space-y-3 text-[#B22222] font-semibold leading-relaxed">
                    {plan.alerts.map((alert, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-[#B22222] text-white rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</span>
                        <p>{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="latex-page shadow-2xl">
                <div className="p-4 border-b-4 border-emerald-600 mb-8">
                   <h2 className="verde-clinico-text text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                     <ChefHat className="text-orange-500" /> Guia de Receitas e Escolhas
                   </h2>
                </div>
                
                <div className="space-y-8 mb-12 px-4">
                  <div className="grid grid-cols-1 gap-6">
                    {plan.recipes.map((recipe, i) => (
                      <div key={i} className="receita-bg border-l-8 laranja-receita-border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-[#FF8C00] text-white px-5 py-2 font-black text-xs uppercase tracking-widest flex justify-between">
                          <span>{i+1}. {recipe.title}</span>
                          <ChefHat size={14} className="opacity-50" />
                        </div>
                        <div className="p-5 text-[12px] text-slate-800">
                          <div className="mb-3">
                            <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">Ingredientes</span>
                            <p className="leading-relaxed font-medium">{recipe.ingredients}</p>
                          </div>
                          <div className="border-t pt-3 mt-3 border-orange-100">
                            <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">Modo de Preparo</span>
                            <p className="leading-relaxed font-medium text-slate-600">{recipe.instructions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4">
                  <div className="border-2 border-emerald-600 rounded-2xl overflow-hidden shadow-lg">
                    <div className="bg-[#2E8B57] text-white px-6 py-4 font-black text-xs uppercase text-center tracking-[0.2em]">
                      Guia de Escolhas Inteligentes
                    </div>
                    <table className="text-[11px] w-full border-collapse">
                      <thead>
                        <tr className="border-b border-emerald-100">
                          <th className="bg-emerald-50 text-emerald-800 font-black p-4 text-center border-r border-emerald-100">
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-600"/> 
                              <span>ESCOLHA ESSE</span>
                            </div>
                          </th>
                          <th className="bg-red-50 text-red-800 font-black p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <XCircle size={16} className="text-red-500"/> 
                              <span>NÃO ESCOLHA ESSE</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.choices.map((c, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="bg-emerald-50/10 p-4 border-r border-emerald-50 text-slate-700 font-medium leading-relaxed">
                              {c.good}
                            </td>
                            <td className="bg-red-50/10 p-4 text-slate-500 font-medium leading-relaxed">
                              {c.bad}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="latex-page shadow-2xl">
                <div className="p-4 border-b-4 border-emerald-600 mb-8">
                  <h2 className="verde-clinico-text text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Clock className="text-emerald-500" /> HGT - Monitoramento (30 Dias)
                  </h2>
                </div>
                
                <div className="px-4 overflow-hidden">
                  <div className="border border-emerald-600 rounded-xl overflow-hidden shadow-md">
                    <table className="hgt-table text-[9px] w-full border-collapse">
                      <thead>
                        <tr className="verde-clinico-bg text-white">
                          <th className="p-2 border-r border-emerald-400/30 text-center font-black">DATA</th>
                          <th className="p-2 border-r border-emerald-400/30 text-center font-black">JEJUM</th>
                          <th className="p-2 border-r border-emerald-400/30 text-center font-black">2H APÓS CAFÉ</th>
                          <th className="p-2 border-r border-emerald-400/30 text-center font-black">2H APÓS ALMOÇO</th>
                          <th className="p-2 border-r border-emerald-400/30 text-center font-black">2H APÓS JANTAR</th>
                          <th className="p-2 text-center font-black">OBSERVAÇÕES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({length: 30}).map((_, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0">
                            <td className="w-14 border-r border-slate-100 text-center text-slate-300 font-mono py-1.5">/ /</td>
                            <td className="w-16 border-r border-slate-100"></td>
                            <td className="w-20 border-r border-slate-100"></td>
                            <td className="w-20 border-r border-slate-100"></td>
                            <td className="w-20 border-r border-slate-100"></td>
                            <td className="py-1.5 px-2"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-16 text-center space-y-3 pb-8">
                  <div className="w-56 h-[1px] bg-slate-400 mx-auto"></div>
                  <p className="font-black text-sm text-slate-800 uppercase tracking-tighter">Isabelle Cristina do Nascimento - CRN 11000</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Nutricionista Clínica</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2E8B57;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1e5c3a;
        }
      `}</style>
    </div>
  );
};

export default App;
