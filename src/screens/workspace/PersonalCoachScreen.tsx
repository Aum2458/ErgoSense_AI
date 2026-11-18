import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  User, 
  Bot, 
  Languages, 
  RotateCcw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../../types/ergosense.ts';
import { VoiceAssistant } from '../../lib/speech.ts';

interface PersonalCoachScreenProps {
  currentUser: UserProfile;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  language?: SupportedLanguage;
}

export const PersonalCoachScreen: React.FC<PersonalCoachScreenProps> = ({
  currentUser,
  language,
  onLanguageChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'Hello Alex! I am your ErgoSense AI Movement Companion. I have analyzed your calibrated baseline (Cervical: 12.2° ± 3.2°) and today’s 5.4 hours of desk work. How can I help you move better right now?',
      timestamp: Date.now() - 300000,
      language: 'en',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Pre-configured prompt chips
  const promptChips = [
    {
      label: 'Why is my neck tired in afternoons?',
      query: 'Why is my neck getting tired during afternoon work?',
      lang: 'en' as SupportedLanguage,
    },
    {
      label: 'Gujarati 2-min desk routine (ગુજરાતી)',
      query: 'મને બે મિનિટની ડેસ્ક કસરત સમજાવો.',
      lang: 'gu' as SupportedLanguage,
    },
    {
      label: 'Hindi afternoon slump advice (हिंदी)',
      query: 'दोपहर में गर्दन के दर्द से कैसे बचें?',
      lang: 'hi' as SupportedLanguage,
    },
    {
      label: 'How should I adjust my monitor height?',
      query: 'How should I adjust my monitor based on today’s Desk Analyzer scan?',
      lang: 'en' as SupportedLanguage,
    },
  ];

  const handleSend = (textToSend?: string, langOverride?: SupportedLanguage) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const activeLang = langOverride || language;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
      language: activeLang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Formulate RAG-grounded contextual response
    setTimeout(() => {
      let replyText = '';
      if (query.includes('afternoon') || query.includes('neck') || query.includes('tired')) {
        replyText =
          'Looking at your daily telemetry, your cervical flexion averages 12.4° before 2:00 PM, but sustained forward tilt rises to 26.8° between 2:30 PM and 4:00 PM. This happens because your eye-to-screen distance drops to 44cm as your eyes fatigue. To fix this: 1) Elevate your laptop stand by 4cm so top of screen meets eye-level; 2) Try 5 chin retractions right now to decompress C5-C7 spinal discs.';
      } else if (activeLang === 'gu' || query.includes('ગુજરાતી')) {
        replyText =
          'નમસ્તે! તમારી ગરદન અને પીઠ માટે ઝડપી ૨ મિનિટની કસરત: ૧) ખુરશી પર સીધા બેસો અને બંને ખભા ધીમે ધીમે પાછળ ગોળાકાર ફેરવો (૫ વખત). ૨) રામચીને પાછળ ખેંચી ૩ સેકન્ડ રોકો. ૩) હાથ ઉપર લંબાવી લાંબો શ્વાસ લો. આનાથી કરોડરજ્જુનો થાક ઓછો થશે.';
      } else if (activeLang === 'hi' || query.includes('हिंदी')) {
        replyText =
          'नमस्ते! दोपहर में गर्दन में खिंचाव इसलिए होता है क्योंकि स्क्रीन पर काम करते समय सिर धीरे-धीरे आगे की ओर झुकने लगता है। इसके लिए: १) हर ४० मिनट में ६૦ सेकंड का ब्रेक लें। २) अपनी ठुड्डी को हल्का सा पीछे खींचें (Chin Tuck)। ३) स्क्रीन की दूरी कम से कम ५५ सेंटीमीटर रखें।';
      } else if (query.includes('monitor') || query.includes('adjust')) {
        replyText =
          'Based on today’s Desk Setup Analyzer scan: Your viewing distance is ~56cm (within the recommended 50–75cm target), but your screen is positioned 6cm below optimal eye level, causing an average 18° downward gaze. Raising your monitor or laptop riser by 5–6cm will align your ears directly over your clavicles.';
      } else {
        replyText =
          'I have correlated your question with your calibrated personal baseline. Your posture compliance today is 92%. To avoid static fatigue, ensure your shoulders remain relaxed and take a brief 60-second micro-break whenever you reach 40 continuous minutes of seated work.';
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        language: activeLang,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak answer if voice is desired
      VoiceAssistant.speak(replyText, activeLang, () => {
        setIsSpeaking(false);
      });
      setIsSpeaking(true);
    }, 600);
  };

  // Web Speech API Voice Dictation
  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSend(transcript, language);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-[#0B1120]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Personal AI Movement Coach</h1>
            <p className="text-xs text-slate-400">RAG-grounded in your telemetry, baseline, and comfort journal</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-400" />
          <div className="flex bg-[#0F172A] border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg ${language === 'en' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400'}`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-lg ${language === 'hi' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400'}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('gu')}
              className={`px-2.5 py-1 rounded-lg ${language === 'gu' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400'}`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 font-mono">Suggested prompts:</span>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              onLanguageChange(chip.lang);
              handleSend(chip.query, chip.lang);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 hover:border-[#2DD4BF]/40 text-xs text-slate-300 hover:text-white transition-all text-left"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 min-h-[380px] max-h-[460px] overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((msg) => {
          const isMe = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isMe ? 'bg-slate-800 text-slate-300' : 'bg-[#0D9488] text-white'
                }`}
              >
                {isMe ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  isMe
                    ? 'bg-[#0D9488]/20 border border-[#2DD4BF]/40 text-white rounded-tr-none'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                {!isMe && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Non-medical general wellness guidance</span>
                    <button
                      onClick={() => VoiceAssistant.speak(msg.text, msg.language || 'en')}
                      className="hover:text-slate-300 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay Voice</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-2.5 flex items-center gap-2 shadow-xl">
        <button
          onClick={handleToggleVoiceInput}
          title={isListening ? 'Listening...' : 'Voice Dictation'}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            language === 'gu'
              ? 'તમારી ગરદન કે બેસવાની મુદ્રા વિશે પ્રશ્ન પૂછો...'
              : language === 'hi'
              ? 'अपनी मुद्रा या गर्दन के तनाव के बारे में पूछें...'
              : 'Ask a question about your posture, neck fatigue, or desk setup...'
          }
          className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim()}
          className="p-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
