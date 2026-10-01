/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ScreenRoute, AICharacter, ChatMessage } from '../types';
import { useLanguage } from '../i18n';
import { CHARACTERS } from '../data/characters';
import { generateChat } from '../services/ai/chatService';
import { storageService } from '../services/storageService';
import { canAccessVoiceCall, canAccessVideoCall } from '../config/plans';
import {
  generateSpeech,
  requestMicPermission,
  requestCameraPermission,
  createMicAnalyser,
  playAudioFromBase64,
  blobToBase64,
  sendVoiceTurn,
  ensureVoicesLoaded,
} from '../services/ai/liveService';
import { AuthModal } from '../components/modals/AuthModal';
import { AgeVerificationModal } from '../components/modals/AgeVerificationModal';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Check,
  CheckCheck,
  Heart,
  UserCheck,
  UserPlus,
  Trash2,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  Crown,
  ChevronRight,
  Info,
  Play,
  Pause,
} from 'lucide-react';

interface CharacterDetailScreenProps {
  characterId: string;
  onRouteChange: (route: ScreenRoute) => void;
  favorites: string[];
  following: string[];
  onToggleFavorite: (charId: string) => void;
  onToggleFollow: (charId: string) => void;
}

// Subtle Web Audio WhatsApp pop tone
function playWhatsAppPop() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(940, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

const EMOJI_LIST = ['💖', '🥰', '✨', '🌸', '☕', '💫', '🌹', '🙈', '😂', '😘', '🥺', '❤️', '🔥', '💃', '👀', '👋'];

export const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({
  characterId,
  onRouteChange,
  favorites,
  following,
  onToggleFavorite,
  onToggleFollow,
}) => {
  const { t, language } = useLanguage();
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatusText, setTypingStatusText] = useState('online');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Calling states
  const [isVoiceCalling, setIsVoiceCalling] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVoiceUpgradeModalOpen, setIsVoiceUpgradeModalOpen] = useState(false);
  const [isVideoUpgradeModalOpen, setIsVideoUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrialLimitModalOpen, setIsTrialLimitModalOpen] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<'voice' | 'video'>('voice');
  const [currentUserProfile, setCurrentUserProfile] = useState(() => storageService.getUserProfile());

  // Calling states & Demo Voice Sample state
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeCallSubtitle, setActiveCallSubtitle] = useState<string>('');
  const [isCallListening, setIsCallListening] = useState<boolean>(false);
  const [isCallSpeaking, setIsCallSpeaking] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [userCameraActive, setUserCameraActive] = useState<boolean>(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<{ url: string; title: string; style: string } | null>(null);
  const callRecognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserCleanupRef = useRef<(() => void) | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipStreamRef = useRef<MediaStream | null>(null);
  const audioVolumeAnimRef = useRef<number | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userProfile = currentUserProfile;
  const hasVoiceAccess = canAccessVoiceCall(userProfile.membershipTier);
  const hasVideoAccess = canAccessVideoCall(userProfile.membershipTier);

  const isFav = favorites.includes(character.id);
  const isFollow = following.includes(character.id);

  const stopAllMediaStreams = () => {
    if (audioVolumeAnimRef.current) {
      cancelAnimationFrame(audioVolumeAnimRef.current);
      audioVolumeAnimRef.current = null;
    }
    if (micAnalyserCleanupRef.current) {
      micAnalyserCleanupRef.current();
      micAnalyserCleanupRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (pipStreamRef.current) {
      pipStreamRef.current.getTracks().forEach((t) => t.stop());
      pipStreamRef.current = null;
    }
    setUserCameraActive(false);
    setMicVolume(0);
  };

  // Stop audio and media on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      try {
        callRecognitionRef.current?.stop();
      } catch {}
      stopAllMediaStreams();
    };
  }, []);

  // Call timer and 1-second paywall enforcement (zero free demo)
  useEffect(() => {
    let timer: any = null;
    if ((isVoiceCalling || isVideoCalling) && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => {
          const nextSec = prev + 1;
          // At 1 second, if user does not have required plan, PAUSE and force upgrade modal
          if (nextSec >= 1) {
            if (isVoiceCalling && !hasVoiceAccess) {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              try {
                callRecognitionRef.current?.stop();
              } catch {}
              setIsCallListening(false);
              setIsCallSpeaking(false);
              setIsVoiceUpgradeModalOpen(true);
            }
            if (isVideoCalling && !hasVideoAccess) {
              setIsVideoUpgradeModalOpen(true);
            }
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVoiceCalling, isVideoCalling, callStatus, hasVoiceAccess, hasVideoAccess]);

  // Format call timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Format message timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Play / Pause Demo Voice Clip in Calling Modal
  const handleToggleDemoAudio = () => {
    if (isPlayingDemo) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingDemo(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingDemo(true);

    const demoClip = language === 'hi'
      ? `हे! सुनो ना... मैं ${character.name} हूँ। मुझे आपसे प्यारी-प्यारी बातें करना बहुत अच्छा लगता है! मुझसे डायरेक्ट लाइव 2-Way ऑडियो कॉल पर बात करने के लिए अभी Pro प्लान में कॉलिंग अनलॉक करें। 💖`
      : `Hey! Suno na... Kaise ho aap? Main ${character.name} hoon. Mujhe aapse baatein karna bohot achha lagta hai! Mujhse direct 2-way call par connect hone ke liye abhi Pro plan upgrade karein! 💖`;

    generateSpeech(demoClip).then(() => {
      setIsPlayingDemo(false);
    }).catch(() => {
      setIsPlayingDemo(false);
    });
  };

  // Dynamic voice call multi-turn loop (2-way live microphone + AI voice reply)
  const initMicrophoneStream = async () => {
    try {
      const stream = await requestMicPermission();
      if (stream) {
        micStreamRef.current = stream;
        const analyser = createMicAnalyser(stream);
        micAnalyserCleanupRef.current = analyser.cleanup;

        const checkVolume = () => {
          const vol = analyser.getVolume();
          setMicVolume(vol);
          audioVolumeAnimRef.current = requestAnimationFrame(checkVolume);
        };
        audioVolumeAnimRef.current = requestAnimationFrame(checkVolume);
      }
    } catch (e) {
      console.warn('Microphone stream notice:', e);
    }
  };

  const startPipCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      pipStreamRef.current = camStream;
      if (pipVideoRef.current) {
        pipVideoRef.current.srcObject = camStream;
      }
      setUserCameraActive(true);
    } catch {
      setUserCameraActive(false);
    }
  };

  const startListeningToUserInCall = (callType: 'voice' | 'video' = isVideoCalling ? 'video' : 'voice') => {
    if (isCallMuted) {
      setIsCallListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsCallListening(true);
      setActiveCallSubtitle(
        language === 'hi'
          ? '🎤 माइक सक्रिय है — बोलें या नीचे टैप करें...'
          : '🎤 Microphone active — Speak or tap below...'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsCallListening(true);
        setActiveCallSubtitle(
          language === 'hi' ? '🎤 बोलिए, मैं सुन रही हूँ...' : '🎤 Listening to you, speak now...'
        );
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (!transcript.trim()) return;

        setIsCallListening(false);
        setActiveCallSubtitle(`You: "${transcript}"`);
        await handleCharacterDynamicCallReply(transcript, callType);
      };

      recognition.onerror = () => {
        setIsCallListening(false);
      };

      recognition.onend = () => {
        setIsCallListening(false);
      };

      callRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsCallListening(false);
    }
  };

  const handleCharacterDynamicCallReply = async (
    userSaid: string,
    callType: 'voice' | 'video' = isVideoCalling ? 'video' : 'voice'
  ) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try {
      callRecognitionRef.current?.stop();
    } catch {}

    setIsCallListening(false);
    setIsCallSpeaking(true);
    setActiveCallSubtitle(`${character.name} सोच रही है...`);

    // 1. Send turn to authoritative server endpoint
    const result = await sendVoiceTurn({
      callType,
      character,
      userSpeechText: userSaid,
      userTier: currentUserProfile.membershipTier || 'Free',
      userId: currentUserProfile.id || 'usr_guest',
    });

    if (result.status === 'gated' || result.code === 'TIER_UPGRADE_REQUIRED') {
      setIsCallSpeaking(false);
      stopAllMediaStreams();
      if (callType === 'video') {
        setIsVideoCalling(false);
        setIsVideoUpgradeModalOpen(true);
      } else {
        setIsVoiceCalling(false);
        setIsVoiceUpgradeModalOpen(true);
      }
      return;
    }

    const reply =
      result.replyText ||
      (language === 'hi'
        ? 'हे! सुनो ना... आपकी आवाज़ सुनकर बहुत ख़ुशी हुई। कैसे हो आप?'
        : 'Hey! Suno na... Aapki awaaz sunkar bohot achha lag raha hai!');

    setActiveCallSubtitle(`${character.name}: "${reply}"`);

    // 2. Play Audio: prioritize Gemini TTS audio stream, fall back to tuned soft Indian female voice
    let played = false;
    if (result.audioBase64) {
      played = await playAudioFromBase64(result.audioBase64);
    }
    if (!played) {
      await generateSpeech(reply, { pitch: 1.15, rate: 0.92 });
    }

    setIsCallSpeaking(false);

    // 3. Auto resume listening after AI finishes speaking
    setTimeout(() => {
      if ((isVoiceCalling || isVideoCalling) && !isCallMuted) {
        startListeningToUserInCall(callType);
      }
    }, 600);
  };

  const handleQuickCallPrompt = async (
    promptText: string,
    callType: 'voice' | 'video' = isVideoCalling ? 'video' : 'voice'
  ) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try {
      callRecognitionRef.current?.stop();
    } catch {}
    setIsCallListening(false);
    setActiveCallSubtitle(`You: "${promptText}"`);
    await handleCharacterDynamicCallReply(promptText, callType);
  };

  // Pre-call: Checks auth, then opens 18+ Mature Content verification popup
  const handleStartVoiceCall = () => {
    setShowOptionsMenu(false);
    const isAuthed = currentUserProfile.isLoggedIn || !!currentUserProfile.email || !!currentUserProfile.phone;
    if (!isAuthed) {
      setIsAuthModalOpen(true);
      return;
    }
    setPendingCallType('voice');
    setIsAgeModalOpen(true);
  };

  // Pre-call: Checks auth, then opens 18+ Mature Content verification popup
  const handleStartVideoCall = () => {
    setShowOptionsMenu(false);
    const isAuthed = currentUserProfile.isLoggedIn || !!currentUserProfile.email || !!currentUserProfile.phone;
    if (!isAuthed) {
      setIsAuthModalOpen(true);
      return;
    }
    setPendingCallType('video');
    setIsAgeModalOpen(true);
  };

  // Executed only after user confirms 18+
  const executeStartVoiceCall = () => {
    setIsAgeModalOpen(false);
    setIsVoiceCalling(true);
    setCallStatus('ringing');
    setCallDuration(0);
    setActiveCallSubtitle(`Calling ${character.name}...`);

    setTimeout(async () => {
      setCallStatus('connected');
      if (hasVoiceAccess) {
        await initMicrophoneStream();
        const initialGreeting = language === 'hi'
          ? `हे! सुनो ना, आपकी आवाज़ सुनकर बहुत ख़ुशी हुई... कैसे हो आप?`
          : `Hey! Suno na, aapse baat karke bohot achha lag raha hai... Kaise ho?`;
        setActiveCallSubtitle(`${character.name}: "${initialGreeting}"`);
        setIsCallSpeaking(true);
        await generateSpeech(initialGreeting, { pitch: 1.15, rate: 0.92 });
        setIsCallSpeaking(false);
        setTimeout(() => {
          startListeningToUserInCall('voice');
        }, 500);
      } else {
        // Zero free demo! Connects for 1.5 - 2 seconds, then immediately pauses and shows VIP upgrade popup
        setActiveCallSubtitle(`${character.name} connected...`);
        setTimeout(() => {
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          try {
            callRecognitionRef.current?.stop();
          } catch {}
          stopAllMediaStreams();
          setIsVoiceCalling(false);
          setIsVoiceUpgradeModalOpen(true);
        }, 1500);
      }
    }, 1000);
  };

  // Executed only after user confirms 18+
  const executeStartVideoCall = () => {
    setIsAgeModalOpen(false);
    setIsVideoCalling(true);
    setCallStatus('ringing');
    setCallDuration(0);
    setActiveCallSubtitle(`Starting Video Call with ${character.name}...`);

    setTimeout(async () => {
      setCallStatus('connected');
      if (hasVideoAccess) {
        await initMicrophoneStream();
        startPipCamera();
        const initialGreeting = language === 'hi'
          ? `हे! सुनो ना, आपकी वीडियो कॉल देखकर मुझे बहुत ख़ुशी हुई... कैसे हो आप?`
          : `Hey! Suno na, video call par aapko dekhkar kitna achha lag raha hai... Kaise ho?`;
        setActiveCallSubtitle(`${character.name}: "${initialGreeting}"`);
        setIsCallSpeaking(true);
        await generateSpeech(initialGreeting, { pitch: 1.15, rate: 0.92 });
        setIsCallSpeaking(false);
        setTimeout(() => {
          startListeningToUserInCall('video');
        }, 500);
      } else {
        // Zero free demo! Connects for 1.5 - 2 seconds, then immediately closes and shows upgrade popup
        setTimeout(() => {
          stopAllMediaStreams();
          setIsVideoCalling(false);
          setIsVideoUpgradeModalOpen(true);
        }, 1500);
      }
    }, 1000);
  };

  const handleEndVoiceCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      callRecognitionRef.current?.stop();
    } catch {}
    stopAllMediaStreams();
    setIsVoiceCalling(false);
    setIsCallSpeaking(false);
    setIsCallListening(false);
    const durStr = formatTimer(callDuration);
    const endMsg: ChatMessage = {
      id: `call_${Date.now()}`,
      characterId: character.id,
      sender: 'character',
      text: `📞 Voice Call ended • ${durStr}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, endMsg]);
    storageService.saveMessage(character.id, endMsg);
  };

  const handleEndVideoCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      callRecognitionRef.current?.stop();
    } catch {}
    stopAllMediaStreams();
    setIsVideoCalling(false);
    setIsCallSpeaking(false);
    setIsCallListening(false);
    const durStr = formatTimer(callDuration);
    const endMsg: ChatMessage = {
      id: `vcall_${Date.now()}`,
      characterId: character.id,
      sender: 'character',
      text: `📹 Video Call ended • ${durStr}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, endMsg]);
    storageService.saveMessage(character.id, endMsg);
  };

  // File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        characterId: character.id,
        sender: 'user',
        text: 'Shared a photo',
        attachmentUrl: dataUrl,
        attachmentType: 'image',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      storageService.saveMessage(character.id, userMsg);
      setShowAttachmentMenu(false);

      // Trigger realistic AI girl reaction to photo
      triggerGirlReply('Photo shared by user: Look at this photo I just took!');
    };
    reader.readAsDataURL(file);
  };

  // Split AI response into realistic human chunks
  const parseIntoGirlChunks = (rawText: string): string[] => {
    if (!rawText) return ['Hehe! 😊'];

    // If explicit delimiter ||| was provided by model
    if (rawText.includes('|||')) {
      return rawText
        .split('|||')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    // If multi-line
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 1 && lines.length <= 4) {
      return lines;
    }

    // Split long sentence chunks if needed
    const sentences = rawText
      .split(/(?<=[.?!।])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length >= 2) {
      const first = sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ');
      const second = sentences.slice(Math.ceil(sentences.length / 2)).join(' ');
      return [first, second];
    }

    return [rawText.trim()];
  };

  // Contextual high-IQ fallback if network or connection drops
  const getSmartFallbackText = (userPrompt: string): string => {
    const p = (userPrompt || '').toLowerCase();
    const userMsgCount = messages.filter((m) => m.sender === 'user').length;

    // First Chat Experience: If user is new (turn <= 2) and sends hello/hi/hey
    if (userMsgCount <= 2 && (p.includes('hi') || p.includes('hello') || p.includes('hey') || p.includes('namaste') || p.includes('suno') || p.includes('kaise'))) {
      if (language === 'hi') {
        return `नमस्ते! हेलो 😊 ||| कैसे हैं आप? हमारी पहली बार बात हो रही है... आपका क्या नाम है और कहाँ से हैं?`;
      }
      return `Hey! Hello 😊 ||| How are you? Pehli baar baat ho rahi hai hamari... kya naam hai aapka waise? Kahan se ho?`;
    }

    // Date / Time inquiries
    if (
      p.includes('date') ||
      p.includes('tarikh') ||
      p.includes('tareekh') ||
      p.includes('taarikh') ||
      userPrompt.includes('तारीख') ||
      userPrompt.includes('तारीक') ||
      p.includes('din')
    ) {
      const nowObj = new Date();
      const formattedDate = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(nowObj);

      if (language === 'hi') {
        return `अरे मेरे प्यारे दोस्त! आज **${formattedDate}** है ❤️ ||| कैलेंडर भूल गए क्या तुम? 😉 ||| वैसे मेरे लिए तो हर वो दिन खास होता है जब तुमसे प्यारी सी बातें होती हैं ✨ बताओ, आज का क्या खास प्लान है?`;
      }
      return `Arey mere pyaare dost! Aaj **${formattedDate}** hai ❤️ ||| Date bhool gaye kya tum baba? 😉 ||| Waise mere liye toh har din bohot special hota hai jab tumse baatein hoti hain ✨ Chalo batao, aaj ka kya plan hai tumhara?`;
    }

    // Well-being inquiries
    if (
      p.includes('hal') ||
      p.includes('haal') ||
      p.includes('kaise ho') ||
      p.includes('kaisi ho') ||
      p.includes('how are you') ||
      userPrompt.includes('हाल') ||
      userPrompt.includes('कैसी हो')
    ) {
      return `Main bilkul theek aur bohot khush hoon! ❤️ ||| Bas tumhara hi intezaar kar rahi thi chat par... ||| Tum aate ho na toh sach me din ban jaata hai ✨ Tum batao, tumhara din kaisa chal raha hai?`;
    }

    // Love / Romance / Affection
    if (p.includes('love') || p.includes('pyaar') || p.includes('pyar') || p.includes('dil')) {
      return `Aww, itna pyaar? 💖 ||| Mera dil toh pehle hi tumhari baaton ka deewana hai... ||| Tum sach me bohot special ho mere liye ✨`;
    }

    // General dynamic reply
    return `Arey wah, kitni pyari baat kahi tumne! 🥰 ||| Mujhe tumse baatein karna sach me bohot accha lagta hai... ||| Aur batao, aaj aur kya chal raha hai? ✨`;
  };

  // Smart emotion reaction detector (Selective reactions, never on every message)
  const detectCompanionEmotionReaction = (userText: string): string | undefined => {
    // Only react on ~25% of messages, never force reaction on normal text
    if (Math.random() > 0.28) return undefined;

    const t = userText.toLowerCase();
    if (
      t.includes('haha') ||
      t.includes('lol') ||
      t.includes('lmao') ||
      t.includes('joke') ||
      t.includes('chutkula') ||
      t.includes('hasi') ||
      t.includes('mazak') ||
      t.includes('majak') ||
      t.includes('funny') ||
      t.includes('pagal') ||
      t.includes('kamal') ||
      t.includes('😂') ||
      t.includes('🤣')
    ) {
      return '😂';
    }
    if (
      t.includes('love') ||
      t.includes('pyar') ||
      t.includes('pyaar') ||
      t.includes('ishq') ||
      t.includes('jaan') ||
      t.includes('sundar') ||
      t.includes('khoobsurat') ||
      t.includes('cute') ||
      t.includes('beautiful') ||
      t.includes('sweet') ||
      t.includes('dil') ||
      t.includes('crush') ||
      t.includes('heart') ||
      t.includes('shadi') ||
      t.includes('shaadi') ||
      t.includes('kiss') ||
      t.includes('❤️') ||
      t.includes('💖')
    ) {
      return '🥰';
    }
    if (
      t.includes('sach') ||
      t.includes('really') ||
      t.includes('seriously') ||
      t.includes('kya baat') ||
      t.includes('omg') ||
      t.includes('wow') ||
      t.includes('pata hai') ||
      t.includes('shock') ||
      t.includes('secret')
    ) {
      return '😮';
    }
    if (
      t.includes('mast') ||
      t.includes('badhiya') ||
      t.includes('badiya') ||
      t.includes('tagda') ||
      t.includes('killer') ||
      t.includes('cool') ||
      t.includes('smart') ||
      t.includes('super') ||
      t.includes('hero') ||
      t.includes('pro') ||
      t.includes('fire') ||
      t.includes('🔥')
    ) {
      return '🔥';
    }
    if (
      t.includes('sad') ||
      t.includes('dard') ||
      t.includes('tension') ||
      t.includes('pareshan') ||
      t.includes('problem') ||
      t.includes('akela') ||
      t.includes('miss') ||
      t.includes('yaad') ||
      t.includes('dukhi') ||
      t.includes('🥺') ||
      t.includes('😭')
    ) {
      return '🥺';
    }
    return undefined; // NO default reaction!
  };

  // Deliver AI Girl response in real human girl chunks (Ira.AI realistic human texting)
  const triggerGirlReply = async (userPromptText: string) => {
    setIsTyping(true);
    setTypingStatusText(`${character.name} is typing...`);

    const result = await generateChat({
      character,
      messages,
      userPrompt: userPromptText,
    });

    const replyText =
      result.success && result.text && result.text.trim()
        ? result.text
        : getSmartFallbackText(userPromptText);
    const chunks = parseIntoGirlChunks(replyText);

    // Natural human reading & typing delay before Chunk 1 (1.4s)
    setTimeout(() => {
      setIsTyping(false);
      setTypingStatusText('online');

      const msg1: ChatMessage = {
        id: `char_${Date.now()}_1`,
        characterId: character.id,
        sender: 'character',
        text: chunks[0] || replyText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, msg1]);
      storageService.saveMessage(character.id, msg1);
      playWhatsAppPop();

      // If Chunk 2 exists: simulate realistic girl typing delay (1.5s)
      if (chunks.length > 1) {
        setTimeout(() => {
          setIsTyping(true);
          setTypingStatusText(`${character.name} is typing...`);

          setTimeout(() => {
            setIsTyping(false);
            setTypingStatusText('online');

            const msg2: ChatMessage = {
              id: `char_${Date.now()}_2`,
              characterId: character.id,
              sender: 'character',
              text: chunks[1],
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, msg2]);
            storageService.saveMessage(character.id, msg2);
            playWhatsAppPop();

            // If Chunk 3 exists: simulate final punchy sentence (1.2s)
            if (chunks.length > 2) {
              setTimeout(() => {
                setIsTyping(true);
                setTypingStatusText(`${character.name} is typing...`);

                setTimeout(() => {
                  setIsTyping(false);
                  setTypingStatusText('online');

                  const msg3: ChatMessage = {
                    id: `char_${Date.now()}_3`,
                    characterId: character.id,
                    sender: 'character',
                    text: chunks.slice(2).join(' '),
                    timestamp: new Date().toISOString(),
                  };
                  setMessages((prev) => [...prev, msg3]);
                  storageService.saveMessage(character.id, msg3);
                  playWhatsAppPop();
                }, 1200);
              }, 500);
            }
          }, 1500);
        }, 600);
      }
    }, 1300);
  };

  // Send User Message with optional selective reaction & Auth / Trial limits
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    // Check if user is authenticated (mobile phone or email)
    const isAuthed = currentUserProfile.isLoggedIn || !!currentUserProfile.email || !!currentUserProfile.phone;
    if (!isAuthed) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check 40 free message limit on free tier (Requirement: 40 messages after signup)
    const userMsgCount = messages.filter((m) => m.sender === 'user').length;
    if (userMsgCount >= 40 && currentUserProfile.membershipTier === 'Free') {
      setIsTrialLimitModalOpen(true);
      return;
    }

    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      characterId: character.id,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    storageService.saveMessage(character.id, userMsg);
    playWhatsAppPop();

    // 1. Companion reacts with emotion emoji ONLY if genuinely triggered and selective
    const reaction = detectCompanionEmotionReaction(text);
    if (reaction) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, reaction } : m))
        );
      }, 600);
    }

    // 2. Then triggers natural human typing in chunks
    setTimeout(() => {
      triggerGirlReply(text);
    }, 400);
  };

  const handleClearChat = () => {
    storageService.clearChat(character.id);
    const greetingMsg: ChatMessage = {
      id: `greet_${Date.now()}`,
      characterId: character.id,
      sender: 'character',
      text: character.greeting || 'Hey there! Kaise ho aap? 💖',
      timestamp: new Date().toISOString(),
    };
    setMessages([greetingMsg]);
    storageService.saveMessage(character.id, greetingMsg);
    setShowOptionsMenu(false);
  };

  return (
    <div className="w-full h-screen max-h-screen bg-[#0b141a] text-gray-100 flex flex-col overflow-hidden select-none fixed inset-0 z-50">
      {/* 1. WHATSAPP HEADER BAR */}
      <header className="h-16 bg-[#1f2c34] text-white flex items-center justify-between px-2 sm:px-4 shrink-0 border-b border-[#222e35] shadow-md z-30">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          {/* Back button */}
          <button
            onClick={() => onRouteChange('characters')}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
            title="Back to models"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Character Avatar & Online Status - CLICKABLE TO OPEN PROFILE */}
          <div
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 cursor-pointer py-1 px-1.5 rounded-xl hover:bg-white/5 active:scale-98 transition-all flex-1 min-w-0"
            title="Click to view full profile & photo album"
          >
            <div className="relative shrink-0">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#1f2c34] rounded-full" />
            </div>

            <div className="flex flex-col min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-sm sm:text-base text-gray-100 truncate">
                  {character.name}
                </span>
                <span className="text-[11px] text-[#00a884]">✓</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-blue-500/15 border border-blue-400/30 text-[9px] font-bold text-blue-300">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  DeepMind
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] sm:text-xs truncate ${
                    isTyping ? 'text-[#00a884] font-medium animate-pulse' : 'text-gray-400'
                  }`}
                >
                  {isTyping ? 'typing...' : 'online'}
                </span>
                <span className="text-[10px] text-gray-500 hidden xs:inline">• Google DeepMind</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Call & Options Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleStartVideoCall}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white active:scale-95 transition-transform"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>

          <button
            onClick={handleStartVoiceCall}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white active:scale-95 transition-transform"
            title="Voice Call"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white active:scale-95 transition-transform"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showOptionsMenu && (
              <div className="absolute right-0 top-12 w-48 py-2 bg-[#233138] rounded-xl shadow-2xl border border-white/10 text-xs text-gray-200 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                >
                  <Info className="w-4 h-4 text-[#00a884]" />
                  <span>{language === 'hi' ? 'प्रोफ़ाइल देखें' : 'View Profile'}</span>
                </button>

                <button
                  onClick={() => {
                    onToggleFavorite(character.id);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  <span>{isFav ? 'Remove Favorite' : 'Add to Favorites'}</span>
                </button>

                <button
                  onClick={() => {
                    onToggleFollow(character.id);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>{isFollow ? 'Following' : 'Follow'}</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={handleClearChat}
                  className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>{language === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. CHAT WALLPAPER & MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 space-y-2.5 relative bg-[#0b141a]">
        {/* Subtle WhatsApp wallpaper SVG watermark pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] bg-repeat"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* End-to-End Encryption Notice Banner */}
        <div className="flex justify-center my-2 relative z-10">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#182229] border border-white/5 text-[11px] text-[#ffe69c]/90 text-center max-w-sm shadow-sm flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#ffe69c] shrink-0" />
            <span>
              {language === 'hi'
                ? '🔒 मैसेजेस एंड-टू-एंड एन्क्रिप्टेड हैं। केवल आप और ' + character.name + ' ही पढ़ सकते हैं।'
                : '🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.'}
            </span>
          </div>
        </div>

        {/* Date Divider Pill */}
        <div className="flex justify-center my-3 relative z-10">
          <span className="px-3 py-1 rounded-md bg-[#182229] text-[11px] font-medium text-gray-400 uppercase tracking-wider shadow-sm">
            TODAY
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full relative z-10 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-sm text-sm ${
                  isUser
                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                    : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                }`}
              >
                {/* Photo attachment preview */}
                {msg.attachmentUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-black/20">
                    <img
                      src={msg.attachmentUrl}
                      alt="Shared media"
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}

                {/* Message Text */}
                <p className="whitespace-pre-wrap break-words leading-relaxed text-[13.5px] sm:text-sm">
                  {msg.text}
                </p>

                {/* Floating Reaction Badge (Ira.AI / WhatsApp style) */}
                {msg.reaction && (
                  <div
                    className={`absolute -bottom-2.5 ${isUser ? 'left-2.5' : 'right-2.5'} bg-[#1f2c34] border border-[#2a3942] rounded-full px-1.5 py-0.5 text-xs shadow-md flex items-center gap-0.5 animate-scaleUp z-20`}
                    title={`${character.name} reacted ${msg.reaction}`}
                  >
                    <span>{msg.reaction}</span>
                  </div>
                )}

                {/* Timestamp & Double checkmark */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80 float-right ml-3">
                  <span>{formatTime(msg.timestamp)}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Realistic WhatsApp Typing 3-Dots Bubble */}
        {isTyping && (
          <div className="flex w-full justify-start relative z-10 animate-fadeIn">
            <div className="bg-[#202c33] px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. EMOJI QUICK BAR (Expandable) */}
      {showEmojiPicker && (
        <div className="px-3 py-2 bg-[#202c33] border-t border-[#2a3942] flex flex-wrap gap-2 animate-fadeIn z-20">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
              }}
              className="text-lg p-1.5 hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 4. ATTACHMENT MENU (Paperclip) */}
      {showAttachmentMenu && (
        <div className="p-3 bg-[#202c33] border-t border-[#2a3942] flex items-center justify-around text-xs text-gray-300 animate-fadeIn z-20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <div className="w-11 h-11 rounded-full bg-[#bf59cf] flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <span>Photos</span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <div className="w-11 h-11 rounded-full bg-[#e35147] flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <span>Camera</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 5. WHATSAPP BOTTOM INPUT BAR */}
      <footer className="bg-[#1f2c34] p-2 sm:p-2.5 border-t border-[#2a3942] flex items-center gap-1.5 sm:gap-2 shrink-0 z-30">
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowAttachmentMenu(false);
          }}
          className={`p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors ${
            showEmojiPicker ? 'text-[#00a884]' : ''
          }`}
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setShowAttachmentMenu(!showAttachmentMenu);
            setShowEmojiPicker(false);
          }}
          className={`p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors ${
            showAttachmentMenu ? 'text-[#00a884]' : ''
          }`}
          title="Attach photo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input box */}
        <div className="flex-1 bg-[#2a3942] rounded-2xl flex items-center px-3.5 py-1.5 focus-within:ring-1 focus-within:ring-[#00a884]/60">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={language === 'hi' ? 'मैसेज टाइप करें...' : 'Message...'}
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Clean WhatsApp Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform shrink-0 ${
            inputText.trim()
              ? 'bg-[#00a884] hover:bg-[#029676] active:scale-95 text-white'
              : 'bg-[#2a3942] text-gray-500 cursor-not-allowed opacity-60'
          }`}
          title="Send"
        >
          <Send className="w-4.5 h-4.5 ml-0.5" />
        </button>
      </footer>

      {/* 6. FULL CHARACTER PROFILE MODAL (Opened by clicking Header Avatar / Name) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-md bg-[#111b21] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative h-64 sm:h-72 w-full shrink-0">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111b21] via-transparent to-black/40" />

              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-cinzel">{character.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#00a884] text-[10px] font-bold">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00a884]" />
                    {character.city || 'Mumbai, India'}
                  </span>
                  <span>•</span>
                  <span>{character.age || 24} years old</span>
                </p>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm text-gray-300">
              {/* Bio */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#00a884] tracking-wider">
                  ABOUT
                </span>
                <p className="text-gray-200 mt-1 leading-relaxed">{character.bio}</p>
              </div>

              {/* Personality traits */}
              {character.personality && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#00a884] tracking-wider">
                    PERSONALITY
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {character.personality.split(',').map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-xs"
                      >
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 6-Look Indian & Modern Photo Gallery (Requirement 6) */}
              {character.gallery && character.gallery.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#00a884] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#d4af37]" />
                      <span>{language === 'hi' ? '6-लुक फ़ोटो गैलरी (साड़ी, लहंगा, सूट व मॉडर्न)' : '6-Look Exclusive Gallery (Saree, Lehenga, Suit & Modern)'}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {character.gallery.length} Photos
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {character.gallery.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setSelectedGalleryPhoto(photo)}
                        className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-black/40 border border-white/10 hover:border-[#d4af37]/60 cursor-pointer shadow-md transition-all hover:scale-[1.03]"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                          <span className="text-[9px] font-bold text-white leading-tight truncate">
                            {photo.style.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call Shortcuts */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleStartVoiceCall();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#00a884] hover:bg-[#029676] text-white font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                >
                  <Phone className="w-4 h-4" />
                  <span>Voice Call</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleStartVideoCall();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#233138] hover:bg-[#2a3942] border border-white/10 text-white font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>
              </div>

              {/* Social actions */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  onClick={() => onToggleFavorite(character.id)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
                  <span>{isFav ? 'Favorited' : 'Favorite'}</span>
                </button>

                <button
                  onClick={() => onToggleFollow(character.id)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>{isFollow ? 'Following' : 'Follow'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. WHATSAPP VOICE CALL FULL SCREEN OVERLAY */}
      {isVoiceCalling && (
        <div className="fixed inset-0 z-50 bg-[#111b21] flex flex-col items-center justify-between p-6 sm:p-8 animate-fadeIn text-white overflow-y-auto">
          {/* Top Header */}
          <div className="text-center space-y-2 mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-[#fceda7]">{character.name}</h3>
            <p className="text-xs text-[#00a884] tracking-widest uppercase font-semibold">
              {callStatus === 'ringing' ? 'Ringing...' : `Connected • ${formatTimer(callDuration)}`}
            </p>
          </div>

          {/* Center Avatar & Audio Waveform */}
          <div className="flex flex-col items-center gap-4 my-auto">
            <div className="relative">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-[#00a884]/40 shadow-2xl relative">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {callStatus === 'connected' && (
                <div className={`absolute -inset-3 rounded-full border-2 border-[#00a884] pointer-events-none ${
                  isCallSpeaking || isCallListening ? 'animate-ping opacity-40' : 'opacity-20'
                }`} />
              )}
            </div>

            {/* Live Audio Visualizer Bars */}
            {callStatus === 'connected' && (
              <div className="flex items-center gap-1.5 h-6">
                <span className={`w-1.5 bg-[#00a884] rounded-full transition-all ${isCallSpeaking ? 'h-6 animate-pulse' : isCallListening ? 'h-4 animate-bounce' : 'h-2 opacity-40'}`} />
                <span className={`w-1.5 bg-[#00a884] rounded-full transition-all ${isCallSpeaking ? 'h-5 animate-pulse' : isCallListening ? 'h-6 animate-bounce' : 'h-2 opacity-40'}`} style={{ animationDelay: '100ms' }} />
                <span className={`w-1.5 bg-[#00a884] rounded-full transition-all ${isCallSpeaking ? 'h-7 animate-pulse' : isCallListening ? 'h-5 animate-bounce' : 'h-3 opacity-40'}`} style={{ animationDelay: '200ms' }} />
                <span className={`w-1.5 bg-[#00a884] rounded-full transition-all ${isCallSpeaking ? 'h-4 animate-pulse' : isCallListening ? 'h-7 animate-bounce' : 'h-2 opacity-40'}`} style={{ animationDelay: '300ms' }} />
                <span className={`w-1.5 bg-[#00a884] rounded-full transition-all ${isCallSpeaking ? 'h-6 animate-pulse' : isCallListening ? 'h-4 animate-bounce' : 'h-2 opacity-40'}`} style={{ animationDelay: '400ms' }} />
              </div>
            )}

            {/* Real-time Subtitle / Dialogue Display */}
            {activeCallSubtitle && (
              <div className="max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl bg-black/60 border border-[#00a884]/40 text-center shadow-lg backdrop-blur-md">
                <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed">
                  {activeCallSubtitle}
                </p>
              </div>
            )}

            {/* Live User Mic Volume Wave when User is listening/speaking */}
            {!isCallSpeaking && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-300 pt-0.5">
                <span>🎤 Your Voice:</span>
                <div className="w-28 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.max(6, micVolume * 2.2))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Interactive Spoken Topic Chips */}
            {callStatus === 'connected' && (
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] text-gray-400 font-medium">
                  {language === 'hi' ? 'बोलें या टैप करके बात करें:' : 'Speak or tap a topic to discuss:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
                  {[
                    language === 'hi' ? 'कैसी हो तुम?' : 'How are you?',
                    language === 'hi' ? 'आज का दिन कैसा रहा?' : 'How was your day?',
                    language === 'hi' ? 'एक प्यारी शायरी सुनाओ' : 'Tell me something sweet',
                    language === 'hi' ? 'मेरे बारे में कुछ कहो' : 'Compliment me',
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickCallPrompt(topic, 'voice')}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#00a884]/30 border border-white/15 text-[11px] text-gray-200 hover:text-white transition-all active:scale-95"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="w-full max-w-xs space-y-4 mb-4">
            <div className="flex items-center justify-around gap-2">
              <button
                onClick={() => {
                  if (isCallListening) {
                    try { callRecognitionRef.current?.stop(); } catch {}
                    setIsCallListening(false);
                    setIsCallMuted(true);
                  } else {
                    setIsCallMuted(false);
                    startListeningToUserInCall('voice');
                  }
                }}
                className={`p-3.5 rounded-full transition-colors ${
                  isCallMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }`}
                title={isCallMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Tap to speak action button */}
              <button
                onClick={() => {
                  if (isCallSpeaking) {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsCallSpeaking(false);
                  }
                  startListeningToUserInCall('voice');
                }}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-[#00a884] text-white font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400/40"
                title="Speak to AI"
              >
                <Mic className="w-4 h-4 text-white" />
                <span>{language === 'hi' ? 'बोलिए (Speak)' : 'Speak'}</span>
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-full transition-colors ${
                  isSpeakerOn ? 'bg-[#00a884] text-white' : 'bg-white/10 text-gray-200'
                }`}
                title="Speaker"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleEndVoiceCall}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
            >
              <PhoneOff className="w-5 h-5" />
              <span>{language === 'hi' ? 'कॉल समाप्त करें (End Call)' : 'End Call'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. REALISTIC AI AVATAR VIDEO CALL OVERLAY (Zero-Video-Generation Cost) */}
      {isVideoCalling && (
        <div className="fixed inset-0 z-50 bg-[#07080a] flex flex-col justify-between p-4 sm:p-6 animate-fadeIn text-white select-none overflow-hidden">
          {/* Main Handheld Video Camera Feed (Character) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Handheld subtle breathing & camera sway motion */}
            <div className="w-full h-full transform scale-105 transition-transform duration-700 ease-out animate-pulse" style={{ animationDuration: '4s' }}>
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover filter brightness-[0.98] contrast-[1.05]"
              />
            </div>
            {/* Cinematic Camera Lens Vignette & Handheld Lighting Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/75" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70 pointer-events-none" />

            {/* Speaking Audio Glow Effect */}
            {isCallSpeaking && (
              <div className="absolute inset-0 border-4 border-[#00a884]/40 animate-pulse pointer-events-none rounded-none" />
            )}
          </div>

          {/* Top Bar with Real Video Call HUD (Honest, authentic technical labels) */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <h3 className="font-bold text-lg sm:text-xl font-cinzel drop-shadow-md">{character.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                  AI Avatar Call
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300 drop-shadow">
                <span className="text-[#00a884] font-semibold">
                  {callStatus === 'ringing' ? 'Connecting...' : formatTimer(callDuration)}
                </span>
                <span>•</span>
                <span className="text-[10px] text-gray-300">HD Avatar • 2-Way Voice</span>
                <span>•</span>
                <span className="text-[10px] text-emerald-400">Secure Session</span>
              </div>
            </div>

            {/* Self PIP View (User Front Camera / Avatar) */}
            <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black/80 backdrop-blur-md relative group">
              {userCameraActive ? (
                <video
                  ref={pipVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <img
                  src={userProfile.avatar}
                  alt="You"
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}
              <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[8px] text-gray-200 flex items-center gap-1">
                <span>You</span>
                {micVolume > 15 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </div>
            </div>
          </div>

          {/* Live Subtitle / Talking Caption Bar & Volume Visualizer */}
          <div className="relative z-10 max-w-lg mx-auto w-full px-4 py-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-center animate-fadeIn shadow-2xl space-y-2">
            <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed drop-shadow">
              {activeCallSubtitle || (language === 'hi' ? '🎤 बोलिए, मैं सुन रही हूँ...' : '🎤 Listening, speak now...')}
            </p>

            {/* Speaking animation when AI is talking */}
            {isCallSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="w-1 h-3 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-4 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {/* Live User Mic Volume Wave when User is listening/speaking */}
            {!isCallSpeaking && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-300 pt-0.5">
                <span>🎤 Your Voice:</span>
                <div className="w-28 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.max(6, micVolume * 2.2))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick interactive talk chips in Video Call so user can easily talk or tap */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5 border-t border-white/10">
              {[
                language === 'hi' ? 'कैसी हो तुम?' : 'How are you?',
                language === 'hi' ? 'क्या कर रही हो?' : 'What are you doing?',
                language === 'hi' ? 'मुझसे बात करो' : 'Talk with me',
                language === 'hi' ? 'एक प्यारी शायरी सुनाओ' : 'Tell a sweet Shayari',
              ].map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickCallPrompt(topic, 'video')}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#00a884]/40 border border-white/15 text-[10px] text-gray-200 hover:text-white transition-all active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Floating Call Controls */}
          <div className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-center gap-3 sm:gap-5 mb-4 sm:mb-8">
            <button
              onClick={() => {
                if (isCallListening) {
                  try { callRecognitionRef.current?.stop(); } catch {}
                  setIsCallListening(false);
                  setIsCallMuted(true);
                } else {
                  setIsCallMuted(false);
                  startListeningToUserInCall('video');
                }
              }}
              className={`p-3.5 sm:p-4 rounded-full transition-all active:scale-95 shadow-lg ${
                isCallMuted
                  ? 'bg-red-500/90 text-white border border-red-400'
                  : 'bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80'
              }`}
              title={isCallMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isCallMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Tap-to-Talk Direct Action Button */}
            <button
              onClick={() => {
                if (isCallSpeaking) {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsCallSpeaking(false);
                }
                startListeningToUserInCall('video');
              }}
              className="px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-[#00a884] text-white font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400/40"
              title="Speak to AI"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>{language === 'hi' ? 'बोलिए (Tap to Speak)' : 'Tap to Speak'}</span>
            </button>

            <button
              onClick={handleEndVideoCall}
              className="p-4 sm:p-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/50 active:scale-90 transition-all border border-red-400/40"
              title="End Video Call"
            >
              <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      )}

      {/* 9. AUDIO CALL UPGRADE MODAL - PRO PLAN EXCLUSIVE */}
      {isVoiceUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111b21] rounded-3xl border border-[#00a884]/40 p-5 sm:p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-[#00a884]/20 border border-[#00a884] text-[#00a884] flex items-center justify-center mx-auto shadow-lg shadow-[#00a884]/20">
              <Phone className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[10px] font-bold text-[#00a884] uppercase tracking-wider">
                {language === 'hi' ? '🔒 PRO प्लान (₹199/सप्ताह)' : '🔒 PRO PLAN (₹199/week)'}
              </span>
              <h3 className="text-lg font-bold text-white font-cinzel">
                {language === 'hi' ? `${character.name} के साथ लाइव ऑडियो कॉल` : `Live Audio Call with ${character.name}`}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'लाइव 2-Way ऑडियो कॉलिंग Pro प्लान में उपलब्ध है। फ्री प्लान में केवल टेक्स्ट चैट उपलब्ध है।'
                  : 'Live 2-Way Audio Calling is exclusive to the Pro plan. Free members have text chat.'}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-gray-300 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? '📞 2-Way लाइव ऑडियो कॉलिंग अनलॉक' : '📞 2-Way Live Audio Calling Unlocked'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#fceda7] font-semibold">
                <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>{language === 'hi' ? 'Official Verified Blue Tick (ब्लू टिक) शामिल' : 'Official Verified Blue Tick Badge Included'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? '24/7 VIP कस्टमर सपोर्ट' : '24/7 Dedicated Support'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? '1,000 वीकली क्रेडिट्स (फ़ोटो जेनरेशन शामिल)' : '1,000 Weekly Credits Included'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* Recommended ₹2 VIP Trial Entry Option */}
              <button
                onClick={() => {
                  setIsVoiceUpgradeModalOpen(false);
                  handleEndVoiceCall();
                  onRouteChange('pricing');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] text-[#07080a] font-extrabold text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#07080a]" />
                <span>{language === 'hi' ? '2 दिन VIP ट्रायल केवल ₹2 (150 क्रेडिट्स) 🔥' : '2 Days VIP Trial ₹2 Only (150 Credits) 🔥'}</span>
              </button>

              <button
                onClick={() => {
                  setIsVoiceUpgradeModalOpen(false);
                  handleEndVoiceCall();
                  onRouteChange('pricing');
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-[#00a884]/40 text-emerald-300 font-bold text-xs active:scale-95 transition-all"
              >
                {language === 'hi' ? 'Pro प्लान में अपग्रेड करें (₹199/सप्ताह)' : 'Upgrade to Pro Plan (₹199/week)'}
              </button>

              <button
                onClick={() => {
                  setIsVoiceUpgradeModalOpen(false);
                  handleEndVoiceCall();
                }}
                className="w-full py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs font-semibold"
              >
                {language === 'hi' ? 'फ्री चैट जारी रखें' : 'Continue Free Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. VIDEO CALL UPGRADE MODAL - ULTRA PRO MAX EXCLUSIVE */}
      {isVideoUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0f1118] rounded-3xl border border-[#d4af37]/40 p-5 sm:p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37] text-[#fceda7] flex items-center justify-center mx-auto shadow-lg shadow-[#d4af37]/20">
              <Video className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] font-bold text-[#fceda7] uppercase tracking-wider">
                {language === 'hi' ? '👑 ULTRA PRO MAX VIP (₹999/सप्ताह)' : '👑 ULTRA PRO MAX VIP (₹999/week)'}
              </div>
              <h3 className="text-lg font-bold text-white font-cinzel">
                {language === 'hi' ? `${character.name} के साथ लाइव वीडियो कॉल` : `Live Video Call with ${character.name}`}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'लाइव फेस-टू-फेस AI वीडियो कॉलिंग विशेष रूप से Ultra Pro Max VIP सदस्यों के लिए आरक्षित है।'
                  : 'Live Face-to-Face AI Video Calling is exclusive to Ultra Pro Max VIP members.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-gray-300 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? '📹 लाइव हैंडहेल्ड AI वीडियो कॉल अनलॉक' : '📹 Live Handheld AI Video Call Unlocked'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? '📞 अनलिमिटेड 2-Way ऑडियो वॉइस कॉल्स' : '📞 Unlimited 2-Way Audio Voice Calls'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#fceda7] font-semibold">
                <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>{language === 'hi' ? '🎭 न्यूरल फेस स्वैप वीडियो अर्ली एक्सेस' : '🎭 Neural Face Swap Video Included'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? 'Official Verified Blue Tick (ब्लू टिक) बैज' : 'Official Verified Blue Tick Badge'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? '5,000 वीकली क्रेडिट्स (सभी क्रिएशन्स शामिल)' : '5,000 Weekly Credits Included'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsVideoUpgradeModalOpen(false);
                  handleEndVideoCall();
                  onRouteChange('pricing');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] text-[#07080a] font-extrabold text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#07080a]" />
                <span>{language === 'hi' ? 'Ultra Pro Max VIP में अपग्रेड करें (₹999/सप्ताह)' : 'Upgrade to Ultra Pro Max VIP (₹999/week)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsVideoUpgradeModalOpen(false);
                  handleEndVideoCall();
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs font-semibold"
              >
                {language === 'hi' ? 'कॉल बंद करें (Close Call)' : 'End Call'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. FREE CHAT 5 MESSAGES LIMIT MODAL (Requirement 8) */}
      {isTrialLimitModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111b21] rounded-3xl border border-[#d4af37]/40 p-5 sm:p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37] text-[#fceda7] flex items-center justify-center mx-auto shadow-lg shadow-[#d4af37]/20">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] font-bold text-[#fceda7] uppercase tracking-wider">
                40 Free Messages Limit Reached
              </span>
              <h3 className="text-lg font-bold text-white font-cinzel">
                {language === 'hi' ? 'VIP ट्रायल से बातचीत जारी रखें' : 'Upgrade to Continue Chatting'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'आपने अपने 40 फ्री मैसेज पूरे कर लिए हैं। बिना प्लान लिए आप अगला मैसेज नहीं भेज सकते। अनलिमिटेड चैट और 150 जेनरेशन क्रेडिट्स के लिए 2 दिन का VIP ट्रायल केवल ₹2 में एक्टिवेट करें।'
                  : 'You have used your 40 free trial messages. To send your next message and unlock 150 generation credits, activate 2 Days VIP Trial for just ₹2.'}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsTrialLimitModalOpen(false);
                  onRouteChange('pricing');
                }}
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg active:scale-95 transition-transform"
              >
                {language === 'hi' ? '2 दिन VIP ट्रायल लें (केवल ₹2) 🔥' : 'Get 2 Days VIP Trial (₹2 Only) 🔥'}
              </button>

              <button
                onClick={() => setIsTrialLimitModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs font-semibold"
              >
                {language === 'hi' ? 'बाद में (Close)' : 'Later'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MANDATORY AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentUserProfile(storageService.getUserProfile());
        }}
        title={language === 'hi' ? `${character.name} से चैट करने के लिए लॉगिन करें` : `Sign in to chat with ${character.name}`}
        description={
          language === 'hi'
            ? 'अपनी चैट और यादें सुरक्षित रखने के लिए मोबाइल नंबर या गूगल से 1-क्लिक साइन इन करें।'
            : 'Sign in with your mobile number or Google to continue chatting and keep your memories private.'
        }
      />

      {/* 13. 18+ MATURE CONTENT & AGE VERIFICATION MODAL */}
      <AgeVerificationModal
        isOpen={isAgeModalOpen}
        onClose={() => setIsAgeModalOpen(false)}
        onConfirm={() => {
          if (pendingCallType === 'video') {
            executeStartVideoCall();
          } else {
            executeStartVoiceCall();
          }
        }}
        characterName={character.name}
        callType={pendingCallType}
      />

      {/* 13. FULL-SCREEN 6-LOOK GALLERY PHOTO VIEWER */}
      {selectedGalleryPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-between p-4 animate-fadeIn"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <div className="w-full max-w-lg flex items-center justify-between z-10 pt-2 text-white">
            <div>
              <span className="text-xs text-[#d4af37] font-semibold block">{selectedGalleryPhoto.style}</span>
              <h4 className="text-sm font-bold text-gray-200">{selectedGalleryPhoto.title}</h4>
            </div>
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-auto max-w-sm sm:max-w-md max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src={selectedGalleryPhoto.url}
              alt={selectedGalleryPhoto.title}
              className="w-full h-full object-contain max-h-[75vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="text-center text-xs text-gray-400 pb-4">
            <span>{character.name} • {selectedGalleryPhoto.style}</span>
          </div>
        </div>
      )}
    </div>
  );
};
