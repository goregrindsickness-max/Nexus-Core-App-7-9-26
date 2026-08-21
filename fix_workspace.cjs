const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');

const sIdx = content.indexOf(") : activePortalTab === 'workspace' ? (");
if (sIdx !== -1) {
  let lines = content.substring(sIdx).split('\n');
  let eIdx = -1;
  for(let i=0; i<lines.length; i++) {
    if (lines[i].includes(") : activePortalTab === 'offers' ? (")) {
      eIdx = i;
      break;
    }
  }
  if (eIdx !== -1) {
    // block starts with ) : activePortalTab === 'workspace' ...
    // we must REMOVE this and leave the NEXT ) : activePortalTab === 'offers'
    // but wait! `lines.slice(0, eIdx)` removes the first `) : activePortalTab === 'workspace' ? (`
    // and the last line it removes is `</motion.div>`
    // The previous text ends with `</motion.div>`.
    // The next text starts with `) : activePortalTab === 'offers' ? (`
    // So if we remove `lines.slice(0, eIdx).join('\n') + '\n'` it will perfectly join!
    let blockToExtract = lines.slice(0, eIdx).join('\n') + '\n';
    content = content.replace(blockToExtract, '');
    
    // Now inject it at the top
    const topInject = `
  if (activePortalTab === 'workspace') {
    return (
      <EventWorkspaceView
        userProfile={userProfile}
        calendarSelectedDate={calendarSelectedDate}
        selectedVenueIndex={selectedVenueIndex}
        setSelectedVenueIndex={setSelectedVenueIndex}
        activeAllVenues={activeAllVenues}
        plannerShowType={plannerShowType}
        setPlannerShowType={setPlannerShowType}
        plannerEventName={plannerEventName}
        setPlannerEventName={setPlannerEventName}
        plannerNotes={plannerNotes}
        setPlannerNotes={setPlannerNotes}
        plannerLineup={plannerLineup}
        setPlannerLineup={setPlannerLineup}
        bands={bands}
        onClose={() => {
          setActivePortalTab('routing');
          playLocalBeep(450, 'sine', 0.015);
        }}
        triggerNotification={triggerNotification}
        playLocalBeep={playLocalBeep}
        handleCalendarPlannerSubmit={handleCalendarPlannerSubmit}
        plannerCostLedger={plannerCostLedger}
        setPlannerCostLedger={setPlannerCostLedger}
      />
    );
  }
`;

    let contentLines = content.split('\n');
    for(let i=0; i<contentLines.length; i++) {
        if(contentLines[i].includes('  return (') && contentLines[i+2] && contentLines[i+2].includes('id="promoter-portal"')) {
            contentLines.splice(i, 0, topInject);
            break;
        }
    }
    fs.writeFileSync(file, contentLines.join('\n'));
    console.log("SUCCESS");
  } else {
    console.log("no end boundary");
  }
} else {
  console.log("no start boundary");
}
