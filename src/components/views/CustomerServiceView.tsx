import React, { useState } from 'react';
import { Headphones, Phone, MessageSquare, MapPin, Send, UserCheck, Clock, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'banker' | 'user';
  text: string;
  time: string;
}

export const CustomerServiceView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'banker',
      text: 'Hello Paulina! Welcome to My Dream Bank Dedicated Priority Support. How can I assist you with your checking, savings, or cards today?',
      time: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'What is my routing number?',
    'Are there foreign transaction fees on my card?',
    'How do I dispute an unauthorized charge?',
    'How long do mobile deposits take to clear?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulated banker response
    setTimeout(() => {
      let reply = "Thank you for reaching out, Paulina. I have reviewed your accounts and can confirm that all your balances are verified and in good standing. Is there anything else you'd like me to look into?";
      const lower = text.toLowerCase();
      if (lower.includes('routing')) {
        reply = 'Your routing number (ABA) for My Dream Bank is 021000021. You can use this for domestic wires and direct payroll deposits.';
      } else if (lower.includes('foreign') || lower.includes('travel')) {
        reply = 'Your Dream Freedom Unlimited® card features zero foreign transaction fees abroad! You can also easily activate travel notices under Account Services.';
      } else if (lower.includes('dispute')) {
        reply = 'To dispute a charge, simply tap any item in your Recent Transactions list and select "Dispute this charge". Our fraud resolution team will immediately issue a provisional credit while we investigate.';
      } else if (lower.includes('deposit') || lower.includes('clear')) {
        reply = 'Mobile check deposits submitted before 9:00 PM ET are typically credited next morning. In this app, mobile deposits clear immediately for your convenience!';
      }

      const bankerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'banker',
        text: reply,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, bankerMsg]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Support & Priority Concierge</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect with dedicated My Dream Bank representatives 24 hours a day, 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Chat with Banker (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                MDB
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">David Ross · Senior Banker Specialist</h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online · Average reply &lt; 1 min
                </span>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0A4D8C] text-white rounded-tr-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] bg-white border border-slate-200 hover:border-blue-400 text-slate-700 rounded-full transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or describe an issue..."
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-[#0A4D8C] hover:bg-[#083E72] text-white p-2 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Support Channels & Branch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Direct Phone Channels</h3>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Phone className="w-4 h-4 text-blue-700" />
                <span>24/7 General Customer Service</span>
              </div>
              <p className="font-mono text-blue-700 font-bold text-sm">1-800-432-3117</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Wait time: Less than 2 minutes</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Priority Fraud Hotlines</span>
              </div>
              <p className="font-mono text-red-600 font-bold text-sm">1-800-955-9060</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Immediate 24/7 emergency dispatch</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Closest Branch & ATM</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">Downtown Financial Tower Branch</p>
              <p>500 University St, Suite 100, Seattle, WA 98101</p>
              <p className="text-slate-400 font-mono text-[11px]">0.4 miles away · Open today until 5:00 PM</p>
              <div className="pt-2">
                <button
                  onClick={() => alert('Appointment schedule booked with branch representative.')}
                  className="px-3 py-1.5 bg-blue-50 text-blue-800 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-xs cursor-pointer"
                >
                  Schedule in-person appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
