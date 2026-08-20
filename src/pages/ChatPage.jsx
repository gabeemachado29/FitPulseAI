import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Trash2, Zap } from 'lucide-react';
import ChatBubble from '../components/chat/ChatBubble';
import ChatSuggestions from '../components/chat/ChatSuggestions';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNutrition } from '../hooks/useNutrition';
import { useWater } from '../hooks/useWater';
import { useToastStore } from '../store/toastStore';
import {
  sendNutritionChatMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '../services/aiChatService';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { dailyLog } = useNutrition();
  const { dailyWater } = useWater();
  const addToast = useToastStore((state) => state.addToast);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultGreeting = {
    role: 'model',
    text: `Olá, ${user?.displayName?.split(' ')[0] || 'Atleta'}! 🤖 Sou o **PulseBot**, seu assistente virtual de nutrição e treinamento do FitPulseAI.\n\nComo posso te ajudar hoje a bater suas metas de calorias, macros ou ajustar seus treinos?`,
  };

  const [messages, setMessages] = useState([defaultGreeting]);
  const messagesEndRef = useRef(null);
  const userId = user?.uid || 'guest';

  // Load chat history from local storage on mount or when user changes
  useEffect(() => {
    const saved = loadChatHistory(userId);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([defaultGreeting]);
    }
  }, [userId]);

  // Save to local storage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(userId, messages);
    }
  }, [messages, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleClearChat = () => {
    clearChatHistory(userId);
    setMessages([defaultGreeting]);
    addToast('Histórico de conversa limpo.', 'info');
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMessage = { role: 'user', text: queryText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    const goalName =
      profile?.goal === 'perda_peso'
        ? 'Emagrecimento / Queima de Gordura'
        : profile?.goal === 'ganho_massa'
        ? 'Hipertrofia / Ganho de Massa'
        : 'Manutenção / Saúde';

    const context = {
      name: user?.displayName || user?.email?.split('@')[0] || 'Atleta',
      goal: goalName,
      calorieGoal: profile?.calorieGoal || 2000,
      consumedCalories: dailyLog?.totalCalories || 0,
      proteinGoal: profile?.proteinGoal || 150,
      carbsGoal: profile?.carbsGoal || 200,
      fatGoal: profile?.fatGoal || 60,
      consumedProtein: dailyLog?.totalProtein || 0,
      consumedCarbs: dailyLog?.totalCarbs || 0,
      consumedFat: dailyLog?.totalFat || 0,
      hydrationGoal: profile?.hydrationGoal || 2500,
      consumedHydration: dailyWater?.totalMl || 0,
    };

    try {
      // Exclude initial greeting if it's the only one or pass full history
      const historyForApi = updatedMessages.filter((_, idx) => idx > 0);
      const reply = await sendNutritionChatMessage(queryText.trim(), historyForApi, context);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      console.error('PulseBot Chat error:', err);
      const errMsg = err?.message?.includes('TIMEOUT')
        ? '⏱️ Tempo limite de conexão com o PulseBot esgotado. Tente novamente em instantes.'
        : 'Tive um pequeno problema ao processar sua pergunta. Por favor, tente novamente.';
      setMessages((prev) => [...prev, { role: 'model', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-container animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 90px)' }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitleWrap}>
          <div className={styles.botBadge}>
            <Bot size={22} color="var(--accent-green)" />
            <span className={styles.onlineDot} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 className="page-header__title" style={{ fontSize: '1.25rem' }}>
                PulseBot IA
              </h1>
              <span className={styles.tagFlash}>
                <Zap size={11} /> 1.5 Flash
              </span>
            </div>
            <p className="page-header__subtitle">Nutrição, macros e treinos em tempo real</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClearChat}
            title="Limpar histórico"
            aria-label="Limpar histórico"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className={styles.messagesArea}>
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}

        {loading && (
          <div className={styles.loadingBubble}>
            <Loader size={18} />
            <span>PulseBot está analisando seus dados...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions if few messages */}
      {messages.length <= 2 && !loading && (
        <ChatSuggestions onSelect={(t) => handleSend(t)} />
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={styles.inputForm}
      >
        <input
          type="text"
          className={styles.inputField}
          placeholder="Pergunte sobre refeições, calorias, treinos..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!input.trim() || loading}
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
