import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

# Add states
states_to_add = """  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);"""

content = content.replace(
    'const [isRecordingVoice, setIsRecordingVoice] = useState(false);\n  const [recordingTime, setRecordingTime] = useState(0);\n  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);',
    states_to_add
)

# Replace the voice recording start logic
target_start = """                                    onClick={() => {
                                      setIsRecordingVoice(true);
                                      setRecordingTime(0);
                                      recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
                                    }}"""

replacement_start = """                                    onClick={async () => {
                                      try {
                                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                        const mediaRecorder = new MediaRecorder(stream);
                                        mediaRecorderRef.current = mediaRecorder;
                                        audioChunksRef.current = [];
                                        
                                        mediaRecorder.ondataavailable = (e) => {
                                          if (e.data.size > 0) audioChunksRef.current.push(e.data);
                                        };
                                        
                                        mediaRecorder.start();
                                        setIsRecordingVoice(true);
                                        setRecordingTime(0);
                                        recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
                                      } catch (err) {
                                        console.error('Error accessing microphone:', err);
                                        triggerNotification?.('Microphone permission denied');
                                      }
                                    }}"""

content = content.replace(target_start, replacement_start)

# Replace voice recording stop logic
target_stop_trash = """                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    setIsRecordingVoice(false);
                                    setRecordingTime(0);
                                  }}"""

replacement_stop_trash = """                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                                      mediaRecorderRef.current.stop();
                                      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                                    }
                                    setIsRecordingVoice(false);
                                    setRecordingTime(0);
                                  }}"""

content = content.replace(target_stop_trash, replacement_stop_trash)

target_stop_send = """                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    setIsRecordingVoice(false);
                                    if (recordingTime > 0) {
                                      handleSendMessage({ voice: true, voiceDuration: `0:${recordingTime.toString().padStart(2, '0')}` });
                                    }
                                    setRecordingTime(0);
                                  }}"""

replacement_stop_send = """                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    const durationStr = `0:${recordingTime.toString().padStart(2, '0')}`;
                                    
                                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                                      mediaRecorderRef.current.onstop = () => {
                                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                                        const audioUrl = URL.createObjectURL(audioBlob);
                                        if (recordingTime > 0) {
                                          handleSendMessage({ voice: true, voiceDuration: durationStr, voiceAudioUrl: audioUrl });
                                        }
                                        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                                      };
                                      mediaRecorderRef.current.stop();
                                    } else {
                                      if (recordingTime > 0) {
                                        handleSendMessage({ voice: true, voiceDuration: durationStr });
                                      }
                                    }
                                    
                                    setIsRecordingVoice(false);
                                    setRecordingTime(0);
                                  }}"""
                                  
content = content.replace(target_stop_send, replacement_stop_send)

# Replace image upload logic to use Base64
target_image = """                                      if (e.target.files && e.target.files[0]) {
                                        const url = URL.createObjectURL(e.target.files[0]);
                                        handleSendMessage({ image: url });
                                      }"""

replacement_image = """                                      if (e.target.files && e.target.files[0]) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            handleSendMessage({ image: event.target.result as string });
                                          }
                                        };
                                        reader.readAsDataURL(e.target.files[0]);
                                      }"""

content = content.replace(target_image, replacement_image)

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

print("Updated voice recorder and image uploader logic.")
