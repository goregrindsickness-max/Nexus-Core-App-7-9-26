import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the effect completely
content = content.replace(/useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('nexus_ptt_logs_v1', JSON\.stringify\(pttLogs\)\);\n    } catch \(e\) {\n      console\.warn\("Error saving PTT logs:", e\);\n    }\n  }, \[pttLogs\]\);/, '');

// Also remove isPttRecording, pttRecordingDuration, pttText which are no longer needed in App.tsx
content = content.replace("const [isPttRecording, setIsPttRecording] = useState<boolean>(false);\n", "");
content = content.replace("const [pttRecordingDuration, setPttRecordingDuration] = useState<number>(0);\n", "");
content = content.replace("const [pttText, setPttText] = useState<string>('');\n", "");

fs.writeFileSync('src/App.tsx', content);
