import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AlertNotification } from '../types/bank';

interface MessagesWidgetProps {
  alerts: AlertNotification[];
  onSelectAlert: (alert: AlertNotification) => void;
  onViewAllMessages: () => void;
}

export const MessagesWidget: React.FC<MessagesWidgetProps> = ({
  alerts,
  onSelectAlert,
  onViewAllMessages,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      {/* Header */}
      <div
        onClick={onViewAllMessages}
        className="flex items-center justify-between cursor-pointer group mb-3.5"
      >
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1170C3] transition-colors">
          Messages & alerts
        </h3>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1170C3] transition-colors" />
      </div>

      {/* Items matching screenshot */}
      <div className="space-y-3">
        {alerts.slice(0, 3).map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onSelectAlert(item)}
            className="flex items-start gap-2.5 cursor-pointer group"
          >
            {/* Dot indicator: 1st is solid blue, 2nd & 3rd are hollow circles with dot */}
            <div className="mt-1 shrink-0">
              {idx === 0 ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#1170C3]" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border border-[#1170C3] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#1170C3]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-medium text-slate-900 group-hover:text-[#1170C3] transition-colors leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
