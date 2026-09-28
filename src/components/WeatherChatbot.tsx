import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Minimize2,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { WeatherData, HazardEvaluation } from '../types/weather';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatbotProps {
  weather: WeatherData | null;
  hazard: HazardEvaluation | null;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const CHAT_WEBHOOK_URL = 'https://energetic.app.n8n.cloud/webhook/d3e685db-14b7-4b6a-88f4-f135f3fa907a/chat';

export const WeatherChatbot: React.FC<ChatbotProps> = ({
  weather,
  hazard,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleOpen = () => {
    if (controlledOnOpen) controlledOnOpen();
    else setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (controlledOnClose) controlledOnClose();
    else setInternalIsOpen(false);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session ID
  useEffect(() => {
    let stored = localStorage.getItem('climasafe_chat_session');
    if (!stored) {
      stored = 'session_' + Math.random().toString(36).substring(2, 11) + Date.now();
      localStorage.setItem('climasafe_chat_session', stored);
    }
    setSessionId(stored);
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const city = weather?.location.name || 'your city';
      const isRed = hazard?.isRedZone;
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: `Hello! I'm your ClimaSafe Weather & Emergency Assistant. ${
            isRed
              ? `⚠️ Note: ${city} is currently under an active RED ZONE alert!`
              : `I'm tracking atmospheric conditions for ${city}.`
          } You can ask me about current storm paths, flood risks, survival precautions, or emergency procedures!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [weather, hazard]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context metadata for the n8n AI webhook
      const contextData = {
        city: weather?.location.name || 'Unknown',
        country: weather?.location.country || '',
        coordinates: weather
          ? `${weather.location.latitude}, ${weather.location.longitude}`
          : '',
        temperature: weather?.current.temperature,
        apparentTemperature: weather?.current.apparent_temperature,
        windSpeed: weather?.current.wind_speed_10m,
        windGusts: weather?.current.wind_gusts_10m,
        weatherCode: weather?.current.weather_code,
        isRedZone: hazard?.isRedZone || false,
        primaryHazard: hazard?.primaryHazard || 'none',
        hazardTitle: hazard?.hazardTitle || '',
        floodRiskScore: hazard?.floodRiskScore || 0,
        cycloneRiskScore: hazard?.cycloneRiskScore || 0,
        evacuationAdvisory: hazard?.evacuationAdvisory || 'none',
      };

      // n8n Chat webhook payload standard format:
      // Accepts chatInput / message / text + sessionId + optional metadata
      const payload = {
        chatInput: text,
        message: text,
        text,
        sessionId: sessionId || 'default_session',
        context: contextData,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let botReply = '';

      if (!response.ok) {
        throw new Error(`Chat service returned ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // If n8n returns an error message inside 200 OK or error payload:
        if (data.message === 'Error in workflow' || data.error) {
          throw new Error(data.message || data.error || 'Workflow execution error');
        }

        // Support various common n8n chat output schemas: { output }, { text }, { response }, { message }, { reply }
        botReply =
          data.output ||
          data.text ||
          data.response ||
          data.message ||
          data.reply ||
          (typeof data === 'string' ? data : JSON.stringify(data));
      } else {
        botReply = await response.text();
        if (botReply.includes('Error in workflow')) {
          throw new Error('Workflow execution error');
        }
      }

      if (!botReply || botReply.trim() === '') {
        botReply = `Received your message regarding ${weather?.location.name || 'weather conditions'}. Current status: ${hazard?.hazardTitle || 'Stable'}. Please verify with our emergency guides above.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: botReply,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.warn('Chat webhook issue:', error);
      // Fallback local smart response so user experience is never broken
      let fallbackAnswer = '';
      const lower = text.toLowerCase();

      if (lower.includes('cyclone') || lower.includes('wind') || lower.includes('storm')) {
        fallbackAnswer = `🚨 Cyclone Advisory for ${weather?.location.name}: Current wind speed is ${Math.round(weather?.current.wind_speed_10m || 0)} km/h with peak gusts up to ${Math.round(weather?.current.wind_gusts_10m || 0)} km/h. Cyclone threat score is ${hazard?.cycloneRiskScore || 0}%. Stay in interior rooms away from glass windows and secure all loose outside items.`;
      } else if (lower.includes('flood') || lower.includes('rain') || lower.includes('water')) {
        fallbackAnswer = `🌊 Flood Advisory for ${weather?.location.name}: 24-hour rainfall is ${Math.round(weather?.daily.precipitation_sum?.[0] || 0)} mm with a flood risk index of ${hazard?.floodRiskScore || 0}%. Remember the golden rule: Turn Around, Don't Drown. Never drive or wade through floodwaters.`;
      } else if (lower.includes('red zone') || lower.includes('safe') || lower.includes('danger')) {
        fallbackAnswer = hazard?.isRedZone
          ? `⚠️ RED ZONE ACTIVE: ${weather?.location.name} is marked as a critical Red Zone (${hazard.hazardTitle}). Evacuation advisory: ${hazard.evacuationAdvisory.toUpperCase()}. Review the resolution checklist above immediately!`
          : `✅ SAFE STATUS: ${weather?.location.name} is currently not in a Red Zone. Meteorological parameters are within safe thresholds.`;
      } else {
        fallbackAnswer = `Meteorological Intel for ${weather?.location.name}: Temp is ${Math.round(weather?.current.temperature || 0)}°C, wind is ${Math.round(weather?.current.wind_speed_10m || 0)} km/h, pressure is ${Math.round(weather?.current.pressure_msl || 1013)} hPa. Hazard Level: ${hazard?.alertLevel?.toUpperCase() || 'SAFE'}. Ask me about specific flood, cyclone, or safety precautions!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: fallbackAnswer,
          timestamp: new Date(),
          isError: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const newSession = 'session_' + Math.random().toString(36).substring(2, 11) + Date.now();
    localStorage.setItem('climasafe_chat_session', newSession);
    setSessionId(newSession);
    const city = weather?.location.name || 'your city';
    setMessages([
      {
        id: 'reset-msg',
        sender: 'bot',
        text: `Conversation restarted. How can I assist you with weather hazards or emergency precautions in ${city}?`,
        timestamp: new Date(),
      },
    ]);
  };

  const quickPrompts = [
    `Is ${weather?.location.name || 'my city'} in a Red Zone?`,
    'What precautions should I take right now?',
    'What is the current flood risk score?',
    'What should I pack in my Go-Bag?',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <div className="relative group">
            <button
              onClick={handleOpen}
              aria-label="Open Weather & Safety Assistant"
              className="relative flex items-center space-x-2.5 px-4 sm:px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_10px_35px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_45px_rgba(239,68,68,0.5)] transform hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-5 h-5" />
                {hazard?.isRedZone && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span className="font-extrabold tracking-wide hidden sm:inline">
                Weather AI Assistant
              </span>
              <span className="sm:hidden font-extrabold">Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] md:w-[450px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">ClimaSafe AI Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {weather?.location.name
                    ? `Telemetry: ${weather.location.name} (${hazard?.isRedZone ? 'RED ZONE' : 'Normal'})`
                    : 'Global Weather & Hazard Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                title="Restart chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:inline-flex cursor-pointer"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleClose}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Bar */}
          {hazard?.isRedZone && (
            <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
              <span className="flex items-center font-bold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-400 animate-pulse" />
                Active Red Zone: {weather?.location.name}
              </span>
              <span className="text-[10px] font-mono text-rose-200">
                Wind: {Math.round(weather?.current.wind_gusts_10m || 0)} km/h
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none shadow'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] mt-1 block ${
                        isUser ? 'text-blue-200 text-right' : 'text-slate-500 text-left'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Analyzing meteorological radar...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about weather, cyclone, flood precautions..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 shadow-md shadow-blue-600/30 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
