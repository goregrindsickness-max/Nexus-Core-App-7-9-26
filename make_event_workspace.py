import os

content = """import React, { useState, useEffect } from 'react';
import { 
  X, HelpCircle, CheckCircle, Trash, Copy, Edit2, Play, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EventWorkspaceViewProps {
  userProfile: any;
  calendarSelectedDate: Date;
  selectedVenueIndex: number;
  setSelectedVenueIndex: (idx: number) => void;
  activeAllVenues: any[];
  plannerShowType: 'standard' | 'festival';
  setPlannerShowType: (type: 'standard' | 'festival') => void;
  plannerEventName: string;
  setPlannerEventName: (name: string) => void;
  plannerNotes: string;
  setPlannerNotes: (notes: string) => void;
  plannerLineup: any[];
  setPlannerLineup: React.Dispatch<React.SetStateAction<any[]>>;
  bands: any[];
  onClose: () => void;
  triggerNotification?: (msg: string) => void;
  playLocalBeep: (freq?: number, type?: OscillatorType, duration?: number) => void;
  handleCalendarPlannerSubmit: (e: React.FormEvent) => void;
  plannerCostLedger: any[];
  setPlannerCostLedger: React.Dispatch<React.SetStateAction<any[]>>;
  festivalDuration: number;
  setFestivalDuration: (duration: number) => void;
  onNavigateToTab?: (tab: 'routing' | 'workspace' | 'offers' | 'sales') => void;
}

export default function EventWorkspaceView({
  userProfile,
  calendarSelectedDate,
  selectedVenueIndex,
  setSelectedVenueIndex,
  activeAllVenues,
  plannerShowType,
  setPlannerShowType,
  plannerEventName,
  setPlannerEventName,
  plannerLineup,
  setPlannerLineup,
  bands,
  onClose,
  triggerNotification,
  playLocalBeep,
  handleCalendarPlannerSubmit,
  plannerCostLedger,
  setPlannerCostLedger,
}: EventWorkspaceViewProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  
  const [ticketPrice, setTicketPrice] = useState<number>(25);
  const [proposedBudget, setProposedBudget] = useState<number>(15000);
  
  // Step 2 local states
  const [addBandId, setAddBandId] = useState('');
  const [addGuarantee, setAddGuarantee] = useState('');
  const [addSetWindow, setAddSetWindow] = useState('');

  // Step 3 local states
  const [newCostName, setNewCostName] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');

  const activeVenue = activeAllVenues[selectedVenueIndex] || null;
  const venueCapacity = parseInt(activeVenue?.capacity || '500', 10);
  
  // Calculations
  const breakEvenTix = ticketPrice > 0 ? Math.ceil(proposedBudget / ticketPrice) : 0;
  const breakEvenPercent = venueCapacity > 0 ? Math.min(100, Math.round((breakEvenTix / venueCapacity) * 100)) : 0;
  
  const actualSpent = plannerCostLedger.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + 
                      plannerLineup.reduce((sum, item) => sum + (parseFloat(item.guarantee) || 0), 0);
  const remainingReserve = proposedBudget - actualSpent;

  const handleAddBand = () => {
    if (!addBandId && !addGuarantee) return;
    const band = bands.find(b => b.id === addBandId);
    setPlannerLineup([...plannerLineup, {
      id: Date.now().toString(),
      band_id: addBandId,
      custom_name: band ? band.name : 'TBA Artist',
      guarantee: addGuarantee,
      set_time: addSetWindow,
      status: 'pending'
    }]);
    setAddBandId('');
    setAddGuarantee('');
    setAddSetWindow('');
    playLocalBeep(800, 'sine', 0.02);
  };

  const handleRemoveBand = (id: string) => {
    setPlannerLineup(plannerLineup.filter(b => b.id !== id));
    playLocalBeep(300, 'square', 0.05);
  };

  const handleAddCost = () => {
    if (!newCostName || !newCostAmount) return;
    setPlannerCostLedger([...plannerCostLedger, {
      id: Date.now().toString(),
      name: newCostName,
      amount: newCostAmount,
      type: 'expense'
    }]);
    setNewCostName('');
    setNewCostAmount('');
    playLocalBeep(700, 'sine', 0.02);
  };

  const handleRemoveCost = (id: string) => {
    setPlannerCostLedger(plannerCostLedger.filter(c => c.id !== id));
    playLocalBeep(300, 'square', 0.05);
  };

  const copyRunningOrder = () => {
    const text = plannerLineup.map((b, i) => `${i+1}. ${b.custom_name} - ${b.set_time} (Status: ${b.status})`).join('\\n');
    navigator.clipboard.writeText(`RUNNING ORDER:\\n${text}`);
    if (triggerNotification) triggerNotification('Running order copied to clipboard!');
    playLocalBeep(900, 'sine', 0.05);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col p-4 font-sans text-yellow-400 border border-zinc-900 rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#eab30805_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <button onClick={onClose} className="text-zinc-500 hover:text-yellow-400 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-mono uppercase tracking-widest font-black text-center text-yellow-400 mb-1">
            {plannerEventName || '(UNTITLED GIG)'}
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
            {calendarSelectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="w-6" /> {/* Spacer for balance */}
      </div>

      {/* Wizard Navigation Anchor Bar */}
      <div className="flex w-full border-b border-zinc-900 bg-zinc-950 text-xs mb-6 relative z-10 rounded shadow-lg overflow-hidden">
        {[
          { step: 1, label: 'Gig Basics' },
          { step: 2, label: 'Lineup & Running Order' },
          { step: 3, label: 'Financial Runway' }
        ].map(s => (
          <button
            key={s.step}
            onClick={() => { setActiveStep(s.step as 1|2|3); playLocalBeep(400 + s.step * 100, 'sine', 0.02); }}
            className={`flex-1 py-3 px-2 text-center transition-all duration-300 font-bold uppercase tracking-widest ${
              activeStep === s.step 
                ? 'bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-400' 
                : 'text-zinc-600 hover:text-yellow-500 hover:bg-yellow-950/20'
            }`}
          >
            [ Step {s.step}: {s.label} ]
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-24">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              <div className="space-y-3">
                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-lg shadow-inner">
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Event Name</label>
                  <input
                    type="text"
                    value={plannerEventName}
                    onChange={(e) => setPlannerEventName(e.target.value)}
                    placeholder="Enter event name..."
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-yellow-400 focus:outline-none focus:border-yellow-500/50 text-sm font-mono"
                  />
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-lg shadow-inner">
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Format Select</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlannerShowType('standard')}
                      className={`flex-1 py-2 text-xs uppercase font-bold tracking-widest rounded border transition-all ${
                        plannerShowType === 'standard' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      [ Club Show ]
                    </button>
                    <button
                      onClick={() => setPlannerShowType('festival')}
                      className={`flex-1 py-2 text-xs uppercase font-bold tracking-widest rounded border transition-all ${
                        plannerShowType === 'festival' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      [ Festival ]
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-lg shadow-inner">
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Venue Anchor</label>
                  <select
                    value={selectedVenueIndex}
                    onChange={(e) => setSelectedVenueIndex(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-yellow-400 focus:outline-none focus:border-yellow-500/50 text-sm font-mono appearance-none"
                  >
                    {activeAllVenues.map((v, i) => (
                      <option key={i} value={i}>{v.name} (Cap: {v.capacity})</option>
                    ))}
                  </select>
                </div>

                {/* Break-Even Estimation Inline Capsule */}
                <div className="bg-neutral-900 border border-yellow-900/30 p-4 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20"><Activity className="w-12 h-12 text-yellow-400" /></div>
                  <label className="block text-[10px] text-yellow-600 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Break-Even Tix Projection
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-6 mb-4 relative z-10">
                    <div className="flex-1">
                      <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Door Price ($)</label>
                      <input
                        type="range"
                        min="5" max="150" step="5"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(Number(e.target.value))}
                        className="w-full accent-yellow-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                      <div className="text-right text-xs text-yellow-400 font-mono mt-1 font-bold">${ticketPrice}</div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Proposed Budget ($)</label>
                      <input
                        type="number"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(Number(e.target.value))}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-yellow-400 focus:outline-none focus:border-yellow-500/50 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="w-full bg-black rounded-full h-2.5 mt-2 overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${breakEvenPercent > 100 ? 'bg-red-500' : 'bg-yellow-400'}`} 
                      style={{ width: `${Math.min(100, breakEvenPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono mt-2 text-zinc-400">
                    <span>{breakEvenTix} Tix to Breakeven</span>
                    <span className={breakEvenPercent > 100 ? 'text-red-400 font-bold' : ''}>
                      {breakEvenPercent}% of Cap ({venueCapacity})
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4 max-w-4xl mx-auto"
            >
              {/* Compress Artist Intake */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-zinc-950 p-2.5 rounded border border-zinc-900 mb-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Artist</label>
                  <select
                    value={addBandId}
                    onChange={(e) => setAddBandId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-yellow-400 focus:outline-none text-xs font-mono"
                  >
                    <option value="">Select Band...</option>
                    {bands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Guarantee ($)</label>
                  <input
                    type="number"
                    value={addGuarantee}
                    onChange={(e) => setAddGuarantee(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-yellow-400 focus:outline-none text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Set Window</label>
                  <input
                    type="text"
                    value={addSetWindow}
                    onChange={(e) => setAddSetWindow(e.target.value)}
                    placeholder="e.g. 22:00 - 23:00"
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-yellow-400 focus:outline-none text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    onClick={handleAddBand}
                    disabled={!addBandId && !addGuarantee}
                    className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded py-1.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    + ADD ACT
                  </button>
                </div>
              </div>

              {/* Roster List Matrix */}
              <div className="space-y-2 mt-4">
                {plannerLineup.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs font-mono border border-zinc-900 border-dashed rounded bg-zinc-950/50">
                    No acts added to roster yet.
                  </div>
                ) : (
                  plannerLineup.map((act, index) => (
                    <div key={act.id} className="flex items-center justify-between bg-black border border-zinc-800 rounded p-3 hover:border-yellow-900/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="text-zinc-600 font-mono text-xs font-black w-6">{index + 1}.</div>
                        <div>
                          <div className="text-yellow-100 font-bold text-sm">{act.custom_name}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-zinc-500 font-mono">⌚ {act.set_time || 'TBA'}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">💰 ${act.guarantee || '0'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-900 px-2 py-1 rounded text-[9px] font-mono tracking-wider flex items-center gap-1.5 border border-zinc-800">
                          {act.status === 'accepted' ? (
                            <><span className="text-emerald-400 animate-pulse">🟢</span><span className="text-emerald-400">CONTRACT OK</span></>
                          ) : (
                            <><span className="text-yellow-500">🟡</span><span className="text-yellow-500/70">PENDING SIGNATURE</span></>
                          )}
                        </div>
                        <button onClick={() => handleRemoveBand(act.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Utility Asset */}
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={copyRunningOrder}
                  className="text-[10px] text-zinc-400 hover:text-yellow-400 flex items-center gap-1.5 uppercase font-mono tracking-widest border border-transparent hover:border-yellow-900/50 bg-zinc-950 px-3 py-1.5 rounded transition-all"
                >
                  <Copy className="w-3 h-3" />
                  [ 📋 Copy Running Order to Clipboard ]
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Financial Data Header Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded text-center shadow-inner">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Proposed Budget</div>
                  <div className="text-xl font-mono text-zinc-300">${proposedBudget.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded text-center shadow-inner">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Actual Spent</div>
                  <div className="text-xl font-mono text-yellow-500">${actualSpent.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded text-center shadow-inner">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Remaining Allocation Reserve</div>
                  <div className={`text-xl font-mono ${remainingReserve < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    ${remainingReserve.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Production Ledger List */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <DollarSign className="w-3.5 h-3.5" /> Production Ledger
                </h3>
                
                <div className="flex gap-2 mb-4">
                   <input
                      type="text"
                      value={newCostName}
                      onChange={(e) => setNewCostName(e.target.value)}
                      placeholder="Item (e.g. Boosting, Security)"
                      className="flex-1 bg-black border border-zinc-800 rounded px-3 py-1.5 text-yellow-400 focus:outline-none text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={newCostAmount}
                      onChange={(e) => setNewCostAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-32 bg-black border border-zinc-800 rounded px-3 py-1.5 text-yellow-400 focus:outline-none text-xs font-mono"
                    />
                    <button
                      onClick={handleAddCost}
                      disabled={!newCostName || !newCostAmount}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white rounded px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      ADD
                    </button>
                </div>

                <div className="space-y-1.5">
                  {/* Implicit Costs (Lineup) */}
                  {plannerLineup.map(act => (
                    <div key={`implicit-${act.id}`} className="flex justify-between items-center bg-black/50 border border-zinc-800/50 p-2.5 rounded text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600">🎸</span>
                        <span className="text-zinc-400">Artist Guarantee: {act.custom_name}</span>
                      </div>
                      <div className="text-zinc-500">${act.guarantee || 0}</div>
                    </div>
                  ))}
                  
                  {/* Explicit Ledger Costs */}
                  {plannerCostLedger.length === 0 && plannerLineup.length === 0 ? (
                     <div className="text-center py-4 text-zinc-600 text-[10px] font-mono">No expenses logged.</div>
                  ) : (
                    plannerCostLedger.map(cost => (
                      <div key={cost.id} className="flex justify-between items-center bg-black border border-zinc-800 p-2.5 rounded text-xs font-mono group hover:border-yellow-900/40 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">📝</span>
                          <span className="text-zinc-300">{cost.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-yellow-500/80">${cost.amount}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-zinc-500 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleRemoveCost(cost.id)} className="text-zinc-500 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Execution Finalizer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent z-20">
        <button 
          onClick={handleCalendarPlannerSubmit}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold font-mono text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          [ ⚡ DEPLOY EVENT & SEND CONTRACTS ]
        </button>
      </div>
    </div>
  );
}
"""

with open('src/components/EventWorkspaceView.tsx', 'w') as f:
    f.write(content)
print("Updated EventWorkspaceView.tsx")

