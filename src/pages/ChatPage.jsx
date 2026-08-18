import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RefreshCw } from 'lucide-react';
import ChatBubble from '../components/chat/ChatBubble';
import ChatSuggestions from '../components/chat/ChatSuggestions';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNutrition } from '../hooks/useNutrition';
import { sendNutritionChatMessage } from '../services/aiChatService';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { dailyLog } = useNutrition();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Olá ${user?.displayName?.split(' ')[0] || ''}! 🤖 Sou seu assistente nutricional FitPulse. Como posso te ajudar hoje com sua alimentação e treinos?`,
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', text: queryText.trim() }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    const context = {
      name: user?.displayName || user?.email?.split('@')[0],
      calorieGoal: profile?.calorieGoal || 2000,
      consumedCalories: dailyLog?.totalCalories || 0,
      proteinGoal: profile?.proteinGoal || 150,
      carbsGoal: profile?.carbsGoal || 200,
      fatGoal: profile?.fatGoal || 60,
      consumedProtein: dailyLog?.totalProtein || 0,
      consumedCarbs: dailyLog?.totalCarbs || 0,
      consumedFat: dailyLog?.totalFat || 0,
    };

    try {
      const history = newMessages.slice(1); // Exclude initial greeting from API history
      const reply = await sendNutritionChatMessage(queryText.trim(), history, context);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 90px)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={24} color="var(--accent-green)" />
          <h1 className="page-header__title">Assistente IA</h1>
        </div>
        <p className="page-header__subtitle">Dicas de nutrição baseadas no seu dia</p>
      </div>

      {/* Messages Scroll Area */}
      <div className={styles.messagesArea}>
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}

        {loading && (
          <div className={styles.loadingBubble}>
            <Loader size={18} />
            <span>FitPulse IA está pensando...</span>
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
          placeholder="Pergunte sobre sua dieta, treinos..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
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
