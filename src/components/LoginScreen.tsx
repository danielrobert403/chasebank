import React, { useState } from 'react';
import { BankLogo } from './BankLogo';

interface LoginScreenProps {
  onLogin: (role: 'user' | 'admin', username: string) => void;
  brandTheme: 'dream' | 'chase';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, brandTheme }) => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('mdb_saved_username') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(() => {
    return !!localStorage.getItem('mdb_saved_username');
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (rememberUsername) {
      localStorage.setItem('mdb_saved_username', username.trim());
    } else {
      localStorage.removeItem('mdb_saved_username');
    }

    // Admin login
    if (
      (cleanUser === 'admin' || cleanUser === 'administrator' || cleanUser === 'admin@mydreambank.com' || cleanUser === 'admin@chase.com') &&
      (cleanPass === 'admin2026' || cleanPass === 'ilovepau' || cleanPass === 'admin')
    ) {
      onLogin('admin', 'Administrator');
      return;
    }

    // Normal User Login: paulina villarreal / ilovepau
    const isPaulina =
      cleanUser === 'paulina villarreal' ||
      cleanUser === 'paulinavillarreal' ||
      cleanUser === 'paulina' ||
      cleanUser === 'paulina.villarreal' ||
      cleanUser === 'paulina@mydreambank.com';

    if (isPaulina && cleanPass === 'ilovepau') {
      onLogin('user', 'Paulina Villarreal');
      return;
    }

    setErrorMessage("We didn't recognize your username or password. Please try again.");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between font-sans selection:bg-[#0A4D8C] selection:text-white">
      {/* Top Banner Bar */}
      <header className="bg-[#0B3968] text-white py-3.5 px-6 shadow-xs flex items-center justify-between">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <BankLogo brandName={brandTheme === 'chase' ? 'CHASE' : 'MY DREAM BANK'} />
          <span className="text-xs text-blue-200/80 font-medium hidden sm:inline-block">
            Secure Digital Banking Gateway
          </span>
        </div>
      </header>

      {/* Main Login Card - Exactly Replicating Attached Screenshot image_83e48659.png */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-md border border-slate-200/80 p-8 sm:p-10">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Username Field with underline input */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-[15px] text-slate-800 font-normal mb-1"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full border-b border-slate-400/90 focus:border-[#0060DF] text-slate-900 py-1.5 text-base bg-transparent outline-hidden transition-colors font-normal"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Field with underline input & Show toggle */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-[15px] text-slate-800 font-normal mb-1"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#0060DF] hover:underline font-semibold text-sm cursor-pointer select-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full border-b border-slate-400/90 focus:border-[#0060DF] text-slate-900 py-1.5 text-base bg-transparent outline-hidden transition-colors font-normal"
                  required
                />
              </div>
            </div>

            {/* Remember username checkbox (Token option explicitly removed as requested) */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 text-sm select-none">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400 text-[#0060DF] focus:ring-[#0060DF] cursor-pointer"
                />
                <span>Remember username</span>
              </label>
            </div>

            {/* Solid Blue Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#0060DF] hover:bg-[#0054C4] active:bg-[#0048A8] text-white font-semibold text-base py-3 px-4 rounded-[4px] transition-colors shadow-none cursor-pointer tracking-wide"
            >
              Sign in
            </button>
          </form>

        </div>
      </main>

      {/* Discreet institutional footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        <p>© 2026 {brandTheme === 'chase' ? 'JPMorgan Chase Bank, N.A.' : 'My Dream Bank, N.A.'} Member FDIC. Equal Housing Lender.</p>
      </footer>
    </div>
  );
};
