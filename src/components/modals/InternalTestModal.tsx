import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface InternalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: () => void;
}

export const InternalTestModal: React.FC<InternalTestModalProps> = ({
  isOpen,
  onClose,
  onAccessGranted,
}) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('verifying');
    setMessage('');

    try {
      const res = await fetch('/api/internal/verify-test-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'VIP Studio Test Access Verified.');
        setTimeout(() => {
          onAccessGranted();
          onClose();
        }, 1200);
      } else {
        setStatus('error');
        setMessage(data.error || 'Server rejected access code.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Failed to reach verification endpoint. Please verify server connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0d0f15] border border-amber-500/30 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-cinzel">Owner & Dev Verification</h3>
            <p className="text-[11px] text-gray-400">Private server-side test authorization</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Enter an authorized development passkey to test internal pipelines without production customer charges. All validation runs server-side.
        </p>

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter secure test token"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
              autoFocus
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-medium text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'verifying' || !code.trim()}
              className="flex-1 py-2 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 disabled:opacity-50"
            >
              {status === 'verifying' ? 'Verifying...' : 'Authenticate'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[10px] text-gray-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500/60" />
          <span>Restricted to application developers and studio owners.</span>
        </div>
      </div>
    </div>
  );
};
