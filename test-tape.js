const tapeUi = `
{post.tapeData && (
  <div className="bg-[#050505] rounded-xl p-4 my-3 border border-zinc-900 shadow-inner overflow-hidden relative group">
    {/* Ambient glowing effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-amber-500/20 blur-xl"></div>
    
    <div className="flex flex-col gap-5 relative z-10">
      {/* Cassette Tape UI */}
      <div className="relative mx-auto w-full max-w-md rounded-lg border-2 border-zinc-700 bg-zinc-800 p-3 pt-4 shadow-xl">
        {/* Cassette Screws */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-inner flex items-center justify-center"><div className="w-1 h-0.5 bg-zinc-700 rotate-45"></div></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-inner flex items-center justify-center"><div className="w-1 h-0.5 bg-zinc-700 -rotate-45"></div></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-inner flex items-center justify-center"><div className="w-1 h-0.5 bg-zinc-700 rotate-90"></div></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-inner flex items-center justify-center"><div className="w-1 h-0.5 bg-zinc-700"></div></div>

        <div className="border border-zinc-600 rounded pt-3 pb-6 px-4 bg-zinc-900 shadow-inner relative flex flex-col">
          {/* Top Text Row */}
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">NEXUS CHROMIUM II</span>
             <span className="text-[9px] font-mono text-red-500 font-bold flex items-center gap-1.5 tracking-wider uppercase">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> HIGH QUALITY SBD
             </span>
          </div>
          
          {/* Tape Reels window */}
          <div className="bg-[#1a1a1a] rounded-full py-2 px-10 mx-auto flex items-center justify-between w-[75%] border-2 border-zinc-700 relative shadow-inner">
            {/* Progress numbers in the center */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center space-y-1 z-10 text-[7px] text-zinc-500 font-mono font-bold tracking-widest">
              <span>100</span>
              <span className="text-red-900">50</span>
              <span>0</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#111] border-2 border-zinc-800 flex items-center justify-center relative z-20">
               <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center shadow-inner">
                 <svg className="w-3 h-3 text-[#111] fill-current" viewBox="0 0 24 24"><path d="M12 2l2.4 4.8L19.2 8l-3.6 4 1 5.6-4.6-2.4-4.6 2.4 1-5.6-3.6-4 4.8-1.2L12 2z" /></svg>
               </div>
               {/* tape fill visual */}
               <div className="absolute inset-1 rounded-full border-4 border-[#2a1a11] shadow-[inset_0_0_2px_#000]"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#111] border-2 border-zinc-800 flex items-center justify-center relative z-20">
               <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center shadow-inner">
                 <svg className="w-3 h-3 text-[#111] fill-current" viewBox="0 0 24 24"><path d="M12 2l2.4 4.8L19.2 8l-3.6 4 1 5.6-4.6-2.4-4.6 2.4 1-5.6-3.6-4 4.8-1.2L12 2z" /></svg>
               </div>
               {/* tape fill visual - right side thinner */}
               <div className="absolute inset-1.5 rounded-full border-[3px] border-[#2a1a11] opacity-60"></div>
            </div>
          </div>
          
          {/* Bottom Text Area */}
          <div className="mt-5 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">Artist / Source</span>
              <span className="text-sm font-mono font-bold text-zinc-300 uppercase truncate max-w-[140px] tracking-wide">{post.tapeData.band}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">Tape Title</span>
              <span className="text-sm font-mono font-bold text-red-500 uppercase truncate max-w-[140px] tracking-wide">{post.tapeData.title}</span>
            </div>
          </div>
        </div>
        
        {/* Tape Bottom Cutout */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[65%] h-5 bg-[#050505] rounded-t-lg border-t-2 border-x-2 border-zinc-700/50 flex items-start justify-center">
           <div className="w-8 h-1 bg-zinc-800/80 rounded-full mt-1.5"></div>
        </div>
      </div>
      
      {/* Seek Bar Area */}
      <div className="flex flex-col gap-2 px-2 mt-2">
        <div className="h-1.5 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden relative shadow-inner">
          <div className="absolute top-0 left-0 bottom-0 w-[42%] bg-gradient-to-r from-red-950 to-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-zinc-600 tracking-wider">
          <span>00:00</span>
          <span className="text-red-500/80 tracking-widest">00:00 / {post.tapeData.duration}</span>
          <span>{post.tapeData.duration}</span>
        </div>
      </div>
      
      {/* Controls Area */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest border border-zinc-900 px-2 py-1 rounded bg-zinc-900/30">
          DATE: {post.tapeData.date || 'UNKNOWN'}
        </div>
        
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-900 border border-red-900/50 hover:border-red-500 flex items-center justify-center text-white transition-colors group relative shadow-[0_0_15px_rgba(239,68,68,0.15)] mx-1">
             <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5 group-hover:text-red-400 transition-colors" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             <div className="absolute inset-0 rounded-full border border-red-500/0 group-hover:border-red-500/20 scale-110 transition-transform duration-300"></div>
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-current"></div>
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-red-900 border border-red-950/30 px-2 py-1 rounded bg-red-950/10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-900"></div>
          DECK ACTIVE
        </div>
      </div>
    </div>
  </div>
)}
`
