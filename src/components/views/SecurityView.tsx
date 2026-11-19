import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Key, Lock, CheckCircle2, Laptop, AlertCircle } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const triggerStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const activeSessions = [
    { device: 'Safari on macOS Sequoia (Current Device)', ip: '73.189.42.11', location: 'Seattle, WA', time: 'Active now' },
    { device: 'Dream Mobile App on iPhone 16 Pro', ip: '172.56.21.90', location: 'Seattle, WA', time: 'Yesterday at 8:14 PM' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Privacy Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Your security score is <strong>98/100 (Excellent)</strong>. Zero unauthorized attempts recorded.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Security Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Sign-in & Verification</h2>

          {/* 2FA */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-700" />
              <div>
                <p className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-500">Require an authenticator code or SMS on new logins</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                triggerStatus(twoFactorEnabled ? '2FA disabled (not recommended)' : '2FA successfully enabled.');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Biometrics */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-purple-700" />
              <div>
                <p className="font-bold text-xs text-slate-900">Touch ID / Face ID</p>
                <p className="text-[11px] text-slate-500">Quickly unlock mobile and web sessions</p>
              </div>
            </div>
            <button
              onClick={() => {
                setBiometricsEnabled(!biometricsEnabled);
                triggerStatus(biometricsEnabled ? 'Biometrics disabled' : 'Biometrics enabled');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                biometricsEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  biometricsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Instant Alerts */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <p className="font-bold text-xs text-slate-900">Fraud & Large Purchase Alerts</p>
                <p className="text-[11px] text-slate-500">Receive SMS notifications for transactions &gt; $100</p>
              </div>
            </div>
            <button
              onClick={() => {
                setInstantAlerts(!instantAlerts);
                triggerStatus(instantAlerts ? 'Alerts disabled' : 'Instant transaction alerts enabled');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                instantAlerts ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  instantAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Logins & Trusted Devices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3">Recognized Devices & Sessions</h2>
            <div className="space-y-3">
              {activeSessions.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Laptop className="w-4 h-4 text-slate-500" />
                      <span>{s.device}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {s.time}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-6">
                    IP: {s.ip} · {s.location}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => triggerStatus('All other device sessions have been terminated.')}
              className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Sign out of all other sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
