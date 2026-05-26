'use client';

import { Copy, CheckCircle, KeyRound } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

interface AccountInfoModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
  name: string;
}

export default function AccountInfoModal({ open, onClose, email, password, name }: AccountInfoModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const copy = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    else { setCopiedPass(true); setTimeout(() => setCopiedPass(false), 2000); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Akun Login Berhasil Dibuat" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <KeyRound size={24} className="text-emerald-600" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">Akun login untuk</p>
          <p className="font-semibold text-slate-900">{name}</p>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Simpan informasi berikut dan berikan ke yang bersangkutan. Password default adalah <strong>Kode Bayar</strong> siswa. Password <strong>tidak dapat dilihat lagi</strong> setelah modal ini ditutup.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Login</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <span className="flex-1 text-sm font-medium text-slate-800 break-all">{email}</span>
              <button onClick={() => copy(email, 'email')} className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                {copiedEmail ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Password Default</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <span className="flex-1 text-sm font-mono font-bold text-slate-800">{password}</span>
              <button onClick={() => copy(password, 'pass')} className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                {copiedPass ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Sudah Disimpan, Tutup
        </button>
      </div>
    </Modal>
  );
}
