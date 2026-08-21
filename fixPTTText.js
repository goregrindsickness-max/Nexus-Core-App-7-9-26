import fs from 'fs';

let content = fs.readFileSync('src/components/PTTRadioModal.tsx', 'utf8');

// Add text fallback row
const searchStr = "Global Walkie-Talkie\n                </span>\n              </div>\n            </div>";

const replaceStr = "Global Walkie-Talkie\n                </span>\n              </div>\n            </div>\n\n            {/* Text Fallback Row */}\n            <div className=\"relative\">\n              <input\n                type=\"text\"\n                value={pttText}\n                onChange={(e) => setPttText(e.target.value)}\n                onKeyDown={(e) => {\n                  if (e.key === 'Enter' && pttText.trim()) {\n                    sendText();\n                  }\n                }}\n                placeholder=\"Type fallback text backstage...\"\n                className=\"w-full bg-zinc-950 border border-zinc-900 focus:border-amber-500/60 focus:outline-none rounded-xl py-2.5 pl-3 pr-10 text-[11px] text-zinc-100 placeholder-zinc-500 font-sans\"\n              />\n              <button\n                onClick={() => {\n                  if (pttText.trim()) sendText();\n                }}\n                className=\"absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#00ffcc] hover:text-white transition-colors cursor-pointer\"\n                title=\"Send Text Message\"\n              >\n                <Send className=\"w-3.5 h-3.5\" />\n              </button>\n            </div>";

content = content.replace(searchStr, replaceStr);

// Add pttText state
content = content.replace(
  "const [isPttRecording, setIsPttRecording] = useState(false);",
  "const [isPttRecording, setIsPttRecording] = useState(false);\n  const [pttText, setPttText] = useState('');"
);

// Add sendText function
const sendTextFn = `
  const sendText = () => {
    if (!pttText.trim()) return;
    
    const newLog = {
      id: 'ptt-' + Date.now(),
      sender: userProfile.name || 'Crew Member',
      role: userProfile.role || 'Crew',
      text: pttText.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      avatar_url: userProfile.avatar_url || '',
    };
    
    setPttLogs(prev => [newLog, ...prev].slice(0, 50));
    setPttText('');
    triggerNotification('✓ Text transmission broadcasted.');
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'ptt_transmission',
        payload: newLog
      }).catch((err: any) => console.error('Failed to broadcast:', err));
    }
  };
`;
content = content.replace(
  "const playLogAudio = (log: any) => {",
  sendTextFn + "\n  const playLogAudio = (log: any) => {"
);

// Import Send icon
content = content.replace(
  "import { X, Mic, Radio, Play } from 'lucide-react';",
  "import { X, Mic, Radio, Play, Send } from 'lucide-react';"
);

fs.writeFileSync('src/components/PTTRadioModal.tsx', content);
