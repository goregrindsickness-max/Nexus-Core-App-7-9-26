import fs from 'fs';

const filePath = 'src/components/TourChecklistView.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `        {/* HEADER BRANDING BANNER */}
        <div className="relative border-b border-zinc-850 pb-6 pt-6 flex flex-col items-center justify-center text-center sticky top-0 z-40 gap-4">
          
          {/* Centered Title Lockup */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <h1 
                className="text-3xl md:text-5xl font-display font-medium tracking-tight text-white uppercase text-center select-text leading-none"
                style={{
                  textShadow: '0 0 12px rgba(132, 204, 22, 0.4), 0 0 25px rgba(101, 163, 13, 0.35), 0 0 50px rgba(190, 242, 100, 0.2)',
                  letterSpacing: '0.1em',
                  fontWeight: 950,
                  fontSize: '26px',
                  marginLeft: '0px',
                  marginTop: '0px'
                }}
              >
                Tour Checklist
              </h1>
              <InfoTip 
                title="CHECKLIST & COMPLIANCE SYSTEM"
                bullets={[
                  "STAGED OPERATIONAL MILESTONES: ADVANCING, SHOW DAY, AND DEPARTURE.",
                  "TEMPLATE BANK LOADS COMMON CHECKLIST PHASES FOR REUSABILITY.",
                  "CREW TASKS ASSIGNED LOGICALLY WITH VERIFIED TIMESTAMPS.",
                  "HARD-RESET RECOVERS SEED CHECKPOINTS AT ANY TIME."
                ]}
                accentColor="#84cc16"
                position="bottom-right"
              />
            </motion.div>
            <p 
              className="text-xs md:text-sm text-zinc-400 font-mono tracking-wide max-w-xl leading-relaxed text-center"
              style={{ marginTop: '-6px', fontSize: '11px' }}
            >
              Track your day-of-show routines, load in fast, and save custom checklists so you never leave gear behind.
            </p>
          </div>

          {/* Action buttons on the absolute right */}
          <div className="md:absolute md:right-5 md:top-6 pr-5 md:pr-0 z-20 flex gap-2">
            <button
              onClick={handleHardResetChecklist}
              className="border border-red-900 bg-red-950/15 hover:bg-red-950/45 text-red-400 hover:text-white px-3 h-10 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              title="Reset checking matrix to default presets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-seed
            </button>
            <button
              onClick={onBack}
              className="border border-zinc-800 hover:border-zinc-650 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white px-4 h-10 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer uppercase"
            >
              Close
            </button>
          </div>
        </div>

        {/* TOP TELEMETRY STATUS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Main Progress Telemetry */}
          <div className="bg-[#0b0c10] border border-zinc-850 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[50px] pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="space-y-0 text-left">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">PROGRESS STATUS</span>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Total Tasks Done</span>
              </div>
              <span className={\`text-[10px] font-bold font-mono border px-1.5 py-0.5 rounded \${progressPercent === 100 ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-violet-950/40 border-violet-850/40 text-violet-300'}\`}>
                {progressPercent}% CLEAR
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="flex items-baseline gap-1.5 text-left">
                <span className="text-2xl font-black font-mono text-white">{completedCount}</span>
                <span className="text-zinc-500 text-[10px] font-mono">/ {totalCount} Tasks Complete</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-zinc-900 border border-zinc-850 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: \`\${progressPercent}%\` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-600 to-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: High Priority Task Tracker */}
          <div className="bg-[#0b0c10] border border-zinc-850 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none group-hover:bg-red-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="space-y-0 text-left">
                <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest block">HIGH PRIORITY</span>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Urgent Items Left</span>
              </div>
              <span className="text-red-400 text-[10px] font-bold flex items-center gap-1 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/50">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                {highPriorityItems.filter(i => !i.completed).length} LEFT
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="flex items-baseline gap-1.5 text-left">
                <span className="text-2xl font-black font-mono text-white">{completedHighCount}</span>
                <span className="text-zinc-500 text-[10px] font-mono">/ {highPriorityItems.length} High-Prio Clear</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 border border-zinc-850 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: \`\${highProgressPercent}%\` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Templates and System Metrics */}
          <div className="bg-[#0b0c10] border border-zinc-850 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="space-y-0 text-left">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">CUSTOM PRESETS</span>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Saved Templates</span>
              </div>
              <span className="text-cyan-400 text-[10px] font-mono uppercase border border-cyan-900/50 bg-cyan-950/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Local
              </span>
            </div>
            <div className="space-y-0 mt-1 relative z-10">
              <div className="flex items-baseline gap-1.5 text-left">
                <span className="text-2xl font-black font-mono text-white">{bankItems.length}</span>
                <span className="text-zinc-500 text-[10px] font-mono">Custom Saved Tasks</span>
              </div>
              <p className="text-[9px] text-zinc-500 text-left leading-tight font-mono mt-0.5">
                Saved reusable venue templates.
              </p>
            </div>
          </div>

        </div>`;

const replacementStr = `        <p className="text-zinc-500 text-xs text-center px-4 mb-4 mt-1">
          Track your day-of-show routines, load in fast, and save custom checklists so you never leave gear behind.
        </p>

        {/* COMPRESSED METRIC RIBBON */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4 px-1">
          <div className="bg-zinc-950/60 border border-zinc-900 rounded p-2.5 flex flex-col justify-between h-16 relative overflow-hidden">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">Done</span>
            <span className="text-cyan-400 font-bold text-base">{completedCount} / {totalCount}</span>
            <div className="absolute bottom-0 left-0 h-0.5 bg-zinc-900 w-full">
              <motion.div 
                className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: \`\${progressPercent}%\` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
          
          <div className="bg-zinc-950/60 border border-zinc-900 rounded p-2.5 flex flex-col justify-between h-16">
            <span className="text-red-500 text-[10px] uppercase font-semibold">Urgent</span>
            <span className="text-zinc-200 font-bold text-base">{highPriorityItems.filter(i => !i.completed).length}</span>
          </div>
          
          <div className="bg-zinc-950/60 border border-zinc-900 rounded p-2.5 flex flex-col justify-between h-16">
            <span className="text-purple-400 text-[10px] uppercase font-semibold">Templates</span>
            <span className="text-zinc-200 font-bold text-base">{bankItems.length}</span>
          </div>
        </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, content);
  console.log("Success");
} else {
  console.log("Target string not found in file. Let's try splitting it up.");
  // we'll print some snippets to help debug
  console.log("Header branding banner pos:", content.indexOf("HEADER BRANDING BANNER"));
}
