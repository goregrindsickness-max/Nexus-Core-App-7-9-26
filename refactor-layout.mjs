import fs from 'fs';

let content = fs.readFileSync('src/components/ShowFormModal.tsx', 'utf-8');

// I need to find the blocks I want to move into accordion 1: [ + ADVANCED SCHEDULE & LINEUP ]
// This includes "Detailed Show Timeline" and "Support Lineup" and "Time Mode Header and Picker Section" (actually the global 12h/24h toggle, plus Merch Call, Soundcheck, Curfew). Wait, the prompt said:
// - Keep only Core Analytics Fields permanently visible at the top: Venue Name, City/State, Date, Show Type, Load-In Time, Doors Time, Set Time, Guarantee, Venue Cut %, and Est. Attendance.
// - Wrap all other advanced inputs inside 3 separate HTML5 '<details>' accordions...
// a) '[ + ADVANCED SCHEDULE & LINEUP ]': Contains Merch Call, Soundcheck, Curfew, the global 12h/24h Time Format Preference toggle, and the dynamic Support Acts Scheduler component rows

const newAccordions = `
          {/* =========================================
              ACCORDION 1: ADVANCED SCHEDULE & LINEUP
             ========================================= */}
          <details className="group border-2 border-[#8B5CF6] bg-black rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="p-3 bg-[#13161d] text-zinc-300 font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer select-none flex justify-between items-center group-open:border-b group-open:border-[#8B5CF6]/30">
              [ + ADVANCED SCHEDULE & LINEUP ]
              <ChevronDown className="w-4 h-4 text-[#8B5CF6] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 space-y-4">
              {/* Time Format Toggle */}
              <div className="flex justify-between items-center bg-[#13161d] border border-zinc-850 p-2 rounded">
                <label className="block text-[9px] font-mono text-[#8B5CF6] uppercase tracking-wider font-extrabold">Time Format Preference</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTime24Hour(false);
                      localStorage.setItem('tour_time_is_24h', 'false');
                    }}
                    className={\`text-[8px] font-mono font-black tracking-wider px-2 py-1 rounded border cursor-pointer uppercase transition-all \${
                      !isTime24Hour 
                        ? 'text-[#8B5CF6] border-[#8B5CF6]/50 bg-[#8B5CF6]/10' 
                        : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }\`}
                  >
                    [ 12-Hour (AM/PM) ]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTime24Hour(true);
                      localStorage.setItem('tour_time_is_24h', 'true');
                    }}
                    className={\`text-[8px] font-mono font-black tracking-wider px-2 py-1 rounded border cursor-pointer uppercase transition-all \${
                      isTime24Hour 
                        ? 'text-[#8B5CF6] border-[#8B5CF6]/50 bg-[#8B5CF6]/10' 
                        : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }\`}
                  >
                    [ 24-Hour (Military) ]
                  </button>
                </div>
              </div>

              {/* Advanced Timeline */}
              <div className="grid grid-cols-3 gap-3">
                {/* Merch Call Time */}
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider text-center">Merch Call</label>
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={formatTimeDisplay(merchCallTime)}
                      onClick={() => triggerTimePicker(merchCallRef)}
                      placeholder="Not Set"
                      className="w-full bg-[#13161d] border border-zinc-900 border-b-[#8B5CF6]/50 hover:bg-zinc-800 p-2 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => triggerTimePicker(merchCallRef)}
                      className="absolute right-1 top-1.5 p-1 text-[#8B5CF6] hover:text-[#a78bfa] active:scale-95 transition-colors outline-none"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="time"
                      ref={merchCallRef}
                      value={merchCallTime}
                      onChange={(e) => setMerchCallTime(e.target.value)}
                      className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Soundcheck */}
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider text-center">Soundcheck</label>
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={formatTimeDisplay(soundcheckTime)}
                      onClick={() => triggerTimePicker(soundcheckRef)}
                      placeholder="Not Set"
                      className="w-full bg-[#13161d] border border-zinc-900 border-b-[#8B5CF6]/50 hover:bg-zinc-800 p-2 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => triggerTimePicker(soundcheckRef)}
                      className="absolute right-1 top-1.5 p-1 text-[#8B5CF6] hover:text-[#a78bfa] active:scale-95 transition-colors outline-none"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="time"
                      ref={soundcheckRef}
                      value={soundcheckTime}
                      onChange={(e) => setSoundcheckTime(e.target.value)}
                      className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Curfew Time */}
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider text-center">Curfew</label>
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={formatTimeDisplay(curfewTime)}
                      onClick={() => triggerTimePicker(curfewRef)}
                      placeholder="Not Set"
                      className="w-full bg-[#13161d] border border-zinc-900 border-b-rose-500/50 hover:bg-zinc-800 p-2 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => triggerTimePicker(curfewRef)}
                      className="absolute right-1 top-1.5 p-1 text-rose-500 hover:text-rose-400 active:scale-95 transition-colors outline-none"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="time"
                      ref={curfewRef}
                      value={curfewTime}
                      onChange={(e) => setCurfewTime(e.target.value)}
                      className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Support Acts Scheduler */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-[#8B5CF6]/30 pb-2">
                  <h3 className="text-[10px] font-mono font-semibold text-[#8B5CF6] uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Users className="w-3.5 h-3.5" /> Dynamic Support Scheduler
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSupportBand}
                    className="text-[9px] font-mono font-black tracking-widest text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 rounded uppercase flex items-center gap-1 transition-all"
                  >
                    [ + ADD SUPPORT BAND ]
                  </button>
                </div>
                
                {supportLineup.length > 0 ? (
                  <div className="space-y-2">
                    {supportLineup.map((band, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-end bg-[#0a0c10] border border-zinc-800 p-2 rounded relative group">
                        <div className="flex-grow">
                          <label className="block text-[8px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Band Name</label>
                          <input 
                            type="text"
                            value={band.name}
                            onChange={(e) => handleUpdateSupportBand(idx, 'name', e.target.value)}
                            placeholder="e.g. Local Opener"
                            className="w-full bg-transparent border-b border-zinc-700 hover:border-[#8B5CF6]/50 p-1 text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6] transition-all"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[8px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Start Time</label>
                          <input 
                            type="time"
                            value={band.start_time || ''}
                            onChange={(e) => handleUpdateSupportBand(idx, 'start_time', e.target.value)}
                            className="w-full bg-transparent border-b border-zinc-700 hover:border-[#8B5CF6]/50 p-1 text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6] transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[8px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">End Time</label>
                          <input 
                            type="time"
                            value={band.end_time || ''}
                            onChange={(e) => handleUpdateSupportBand(idx, 'end_time', e.target.value)}
                            className="w-full bg-transparent border-b border-zinc-700 hover:border-[#8B5CF6]/50 p-1 text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6] transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupportBand(idx)}
                          className="p-1.5 text-zinc-600 hover:text-red-500 bg-red-900/10 rounded ml-1 transition-colors"
                          title="Remove Band"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 border border-dashed border-zinc-800 rounded bg-[#0a0c10]/50">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">No support acts scheduled.</p>
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* =========================================
              ACCORDION 2: HOSPITALITY & SAFETY
             ========================================= */}
          <details className="group border-2 border-[#8B5CF6] bg-black rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="p-3 bg-[#13161d] text-zinc-300 font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer select-none flex justify-between items-center group-open:border-b group-open:border-[#8B5CF6]/30">
              [ + HOSPITALITY & SAFETY LOGISTICS ]
              <ChevronDown className="w-4 h-4 text-[#8B5CF6] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 space-y-5">
              {/* Contacts & Wifi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Promoter Contact</label>
                    <input 
                      type="text"
                      value={promoterContact}
                      onChange={(e) => setPromoterContact(e.target.value)}
                      placeholder="Name (123) 456-7890"
                      className="w-full bg-[#13161d] border border-zinc-800 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Parking Arrangements</label>
                    <input 
                      type="text"
                      value={parkingArrangements}
                      onChange={(e) => setParkingArrangements(e.target.value)}
                      placeholder="Loading dock, etc."
                      className="w-full bg-[#13161d] border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">WiFi Network (SSID)</label>
                    <input 
                      type="text"
                      value={wifiNetwork}
                      onChange={(e) => setWifiNetwork(e.target.value)}
                      className="w-full bg-[#13161d] border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">WiFi Password</label>
                    <input 
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full bg-[#13161d] border border-zinc-800 rounded p-2 text-xs text-[#00ffcc] font-black focus:outline-none focus:border-[#8B5CF6] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">Age Restriction</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['all', '18', '21'] as const).map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => setAgeRestriction(restriction)}
                      className={\`py-1.5 text-[9px] uppercase font-mono font-black tracking-tight rounded border transition-all cursor-pointer \${
                        ageRestriction === restriction
                          ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                          : 'bg-[#13161d] border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }\`}
                    >
                      {restriction === 'all' ? 'All ages' : restriction === '18' ? '18+' : '21+'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospitality Text Areas */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Dinner Arrangements</label>
                  <input 
                    type="text"
                    value={dinnerArrangements}
                    onChange={(e) => setDinnerArrangements(e.target.value)}
                    placeholder="$15 Buyout, Venue Catering..."
                    className="w-full bg-[#13161d] border border-zinc-800 focus:border-amber-500 rounded p-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Local Food / Diet Notes</label>
                  <textarea 
                    value={localFoodNotes}
                    onChange={(e) => setLocalFoodNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-[#13161d] border border-zinc-800 focus:border-amber-500 rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Safety Text Areas */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Emergency Medical Info</label>
                    <button 
                      type="button" 
                      onClick={handleAutoSuggestEmergency}
                      disabled={isHuntingHospitals}
                      className="text-[8px] font-mono tracking-widest font-black text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 px-2 py-0.5 rounded transition-all outline-none uppercase"
                    >
                      {isHuntingHospitals ? "Scanning Maps..." : "Auto-Fill Nearby ER"}
                    </button>
                  </div>
                  <textarea 
                    value={emergencyMedicalInfo}
                    onChange={(e) => setEmergencyMedicalInfo(e.target.value)}
                    rows={2}
                    className="w-full bg-[#13161d] border border-zinc-800 focus:border-rose-500 rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Local Pharmacy Info</label>
                  <textarea 
                    value={localPharmacyInfo}
                    onChange={(e) => setLocalPharmacyInfo(e.target.value)}
                    rows={2}
                    className="w-full bg-[#13161d] border border-zinc-800 focus:border-rose-500 rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* =========================================
              ACCORDION 3: TECHNICAL & PRODUCTION SPECS
             ========================================= */}
          <details className="group border-2 border-[#8B5CF6] bg-black rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="p-3 bg-[#13161d] text-zinc-300 font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer select-none flex justify-between items-center group-open:border-b group-open:border-[#8B5CF6]/30">
              [ + TECHNICAL & PRODUCTION SPECS ]
              <ChevronDown className="w-4 h-4 text-[#8B5CF6] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 space-y-5">
              {/* Venue Provisions */}
              <div>
                <label className="block text-[8px] font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">Gear Provided by Venue</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTablesProvided(!tablesProvided)}
                    className={\`py-1.5 rounded border text-[10px] uppercase font-mono font-bold tracking-tight text-center transition-all cursor-pointer \${
                      tablesProvided 
                        ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10' 
                        : 'border-zinc-850 text-zinc-550 hover:text-white bg-[#13161d]'
                    }\`}
                  >
                    {tablesProvided ? '✓' : '✗'} Tables
                  </button>
                  <button
                    type="button"
                    onClick={() => setHangingGridsProvided(!hangingGridsProvided)}
                    className={\`py-1.5 rounded border text-[10px] uppercase font-mono font-bold tracking-tight text-center transition-all cursor-pointer \${
                      hangingGridsProvided 
                        ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10' 
                        : 'border-zinc-850 text-zinc-550 hover:text-white bg-[#13161d]'
                    }\`}
                  >
                    {hangingGridsProvided ? '✓' : '✗'} Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setShorePower(!shorePower)}
                    className={\`py-1.5 rounded border text-[10px] uppercase font-mono font-bold tracking-tight text-center transition-all cursor-pointer \${
                      shorePower 
                        ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10' 
                        : 'border-zinc-850 text-zinc-550 hover:text-white bg-[#13161d]'
                    }\`}
                  >
                    {shorePower ? '✓' : '✗'} Power
                  </button>
                </div>
              </div>

              {/* Text Areas for Specs */}
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Audio / Production Requirements</label>
                <textarea 
                  value={audioProductionRequirements}
                  onChange={(e) => setAudioProductionRequirements(e.target.value)}
                  placeholder="FOH console requests, input lists, monitor requirements..."
                  rows={3}
                  className="w-full bg-[#13161d] border border-zinc-800 focus:border-[#00ffcc] rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Stage Backline Requirements</label>
                <textarea 
                  value={stageBacklineRequirements}
                  onChange={(e) => setStageBacklineRequirements(e.target.value)}
                  placeholder="Amps, drum shells, local hires to be provided by venue..."
                  rows={3}
                  className="w-full bg-[#13161d] border border-zinc-800 focus:border-[#00ffcc] rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"
                />
              </div>
            </div>
          </details>
`;

// Build the Core Analytics fields that remain at the top.
// The prompt asked for:
// - Venue Name, City/State, Date, Show Type, Load-In Time, Doors Time, Set Time, Guarantee, Venue Cut %, and Est. Attendance.
// We must extract those and reconstruct the top section of the form. Wait, I will just do string replacement of the rest of the form.

// First, find the first occurrence of:
/*
          {/* DATE & PROMOTER & LOGISTICS TIME * /
*/
// And replace everything from that point to the end of the form (before SAVE / UPDATE BUTTON)
// with the new core core fields group, then the accordions.

// Let's create a regular expression or simple string split to rebuild it safely.

// Replace the entire form body starting from `<div className="space-y-3.5">`... wait
const startMarker = `          {/* DATE & PROMOTER & LOGISTICS TIME */}`;
const endMarker = `{/* GUEST LIST */}`;

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(`{/* SAVE / UPDATE BUTTON */}`);

if (startIndex > -1 && endIndex > -1) {
  const newMiddle = `
          {/* CORE ANALYTICS (Date, Load-In, Doors, Set, Guarantee, Cut, Attendance) */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" /> Core Show Analytics & Times
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#13161d] border border-zinc-850 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-400 text-center uppercase"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Expected Attendance</label>
                <div className="relative">
                  <select
                    value={expectedAttendance}
                    onChange={(e) => setExpectedAttendance(e.target.value as '+100')}
                    className="w-full bg-[#13161d] border border-zinc-850 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
                  >
                    <option value="+100">+100</option>
                    <option value="100-300">100-300</option>
                    <option value="300-700">300-700</option>
                    <option value="700+">700+</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-2.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[8px] font-mono text-zinc-400 mb-1 uppercase tracking-widest text-center">Load-In</label>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    value={formatTimeDisplay(loadInTime)}
                    onClick={() => triggerTimePicker(loadInRef)}
                    placeholder="Not Set"
                    className="w-full bg-[#13161d] border border-zinc-850 hover:border-zinc-700 rounded p-1.5 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all"
                  />
                  <button type="button" onClick={() => triggerTimePicker(loadInRef)} className="absolute right-1 top-1 p-1 text-zinc-500 hover:text-[#00ffcc] active:scale-95 transition-colors outline-none"><Clock className="w-3.5 h-3.5" /></button>
                  <input type="time" ref={loadInRef} value={loadInTime} onChange={(e) => setLoadInTime(e.target.value)} className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[8px] font-mono text-zinc-400 mb-1 uppercase tracking-widest text-center">Doors</label>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    value={formatTimeDisplay(doorsTime)}
                    onClick={() => triggerTimePicker(doorsRef)}
                    placeholder="Not Set"
                    className="w-full bg-[#13161d] border border-zinc-850 hover:border-zinc-700 rounded p-1.5 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all"
                  />
                  <button type="button" onClick={() => triggerTimePicker(doorsRef)} className="absolute right-1 top-1 p-1 text-zinc-500 hover:text-[#00ffcc] active:scale-95 transition-colors outline-none"><Clock className="w-3.5 h-3.5" /></button>
                  <input type="time" ref={doorsRef} value={doorsTime} onChange={(e) => setDoorsTime(e.target.value)} className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-400 mb-1 uppercase tracking-widest text-center">Set-Time</label>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    value={formatTimeDisplay(setTime)}
                    onClick={() => triggerTimePicker(setRef)}
                    placeholder="Not Set"
                    className="w-full bg-[#13161d] border border-zinc-850 hover:border-zinc-700 rounded p-1.5 pr-7 text-xs text-white font-mono text-center cursor-pointer transition-all"
                  />
                  <button type="button" onClick={() => triggerTimePicker(setRef)} className="absolute right-1 top-1 p-1 text-zinc-500 hover:text-[#00ffcc] active:scale-95 transition-colors outline-none"><Clock className="w-3.5 h-3.5" /></button>
                  <input type="time" ref={setRef} value={setTime} onChange={(e) => setSetTime(e.target.value)} className="opacity-0 absolute inset-0 w-0 h-0 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Guarantee ($)</label>
                <input 
                  type="number" step="1" value={guaranteeAmount} onChange={(e) => setGuaranteeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#13161d] border border-zinc-850 focus:border-emerald-400 rounded p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Venue Cut (%)</label>
                <input 
                  type="number" step="0.1" value={venueCutPercentage} onChange={(e) => setVenueCutPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#13161d] border border-zinc-850 focus:border-emerald-400 rounded p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Merch Space Fee</label>
                <input 
                  type="number" step="1" value={merchSpaceFee} onChange={(e) => setMerchSpaceFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#13161d] border border-zinc-850 focus:border-emerald-400 rounded p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Seller Cost</label>
                <input 
                  type="number" step="1" value={sellerCost} onChange={(e) => setSellerCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#13161d] border border-zinc-850 focus:border-emerald-400 rounded p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
\n` + newAccordions + `\n\n          `;

  // We should extract Guest List and Show Type and keep them or are they in Accordions?
  // Wait, I will keep Show Type below Venue Name.
  // Actually, I should remove ShowType from the old part and put it where it used to be. It's before the startMarker.
  // The guest list and additional notes were at the end, before SAVE/UPDATE. 
  // Let's just find the existing Guest List and grab it.
  
  let guestListStart = content.indexOf(endMarker);
  let guestListStr = content.substring(guestListStart, endIndex);

  content = content.substring(0, startIndex) + newMiddle + guestListStr + content.substring(endIndex);

  fs.writeFileSync('src/components/ShowFormModal.tsx', content);
  console.log('Success');
}
