import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, setAuthToken } from '../services/api';
import {
  User, Mail, Lock, Trash2, Camera, Check, AlertCircle, Loader2,
  Shield, Activity, Bot, MessageSquare, Calendar, Clock, Edit3,
  Save, X, Eye, EyeOff, RefreshCw, Download, LogOut, Zap,
  ChevronRight, Star, Globe, Key, Bell, AlertTriangle, BarChart2, PanelLeft,
} from 'lucide-react';

/* ─── tiny helpers ─── */
/* ─── avatar gradient presets ─── */
const AVATAR_PRESETS = [
  { id: 'sunset',   style: 'linear-gradient(135deg,#FF6B9D,#FFE500)' },
  { id: 'ocean',    style: 'linear-gradient(135deg,#4D9FFF,#34d399)' },
  { id: 'aurora',   style: 'linear-gradient(135deg,#a78bfa,#60a5fa)' },
  { id: 'fire',     style: 'linear-gradient(135deg,#fb923c,#f87171)' },
  { id: 'mint',     style: 'linear-gradient(135deg,#34d399,#4D9FFF)' },
  { id: 'candy',    style: 'linear-gradient(135deg,#FF6B9D,#a78bfa)' },
  { id: 'gold',     style: 'linear-gradient(135deg,#FFE500,#fb923c)' },
  { id: 'neon',     style: 'linear-gradient(135deg,#4D9FFF,#a78bfa)' },
  { id: 'forest',   style: 'linear-gradient(135deg,#34d399,#fbbf24)' },
  { id: 'rose',     style: 'linear-gradient(135deg,#f87171,#fbbf24)' },
  { id: 'cosmic',   style: 'linear-gradient(135deg,#1e1b4b,#a78bfa)' },
  { id: 'nb-plain', style: '#FFE500' },
];

// legacy fallback: map old hex to nearest preset id
const hexToPreset = (hex) => AVATAR_PRESETS.find(p => p.style === hex) ? hex : AVATAR_PRESETS[0].id;

const Section = ({ title, icon: Icon, children, accent = 'bg-nb-yellow' }) => (
  <div className="bg-white border-2 border-black shadow-nb">
    <div className={`${accent} border-b-2 border-black px-5 py-3 flex items-center gap-2`}>
      <Icon size={16} className="flex-shrink-0" />
      <h3 className="font-black text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="mb-4 last:mb-0">
    <label className="block text-xs font-bold text-nb-muted mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Toast = ({ msg, type = 'success', onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border-2 border-black shadow-nb px-4 py-3 font-bold text-sm animate-in slide-in-from-bottom-4
    ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-60"><X size={14} /></button>
  </div>
);

const StatPill = ({ icon: Icon, label, value, bg }) => (
  <div className={`${bg} border-2 border-black p-4 flex flex-col gap-1`}>
    <Icon size={18} className="mb-0.5" />
    <span className="text-2xl font-black">{value}</span>
    <span className="text-xs font-bold uppercase tracking-wide text-black/60">{label}</span>
  </div>
);

/* ─── MAIN COMPONENT ─── */
const ProfileView = ({ bots = [] }) => {
  const { currentUser, logout, resetPassword, updateDisplayName, updatePhotoURL, deleteAccount, getIdToken } = useAuth();

  // ── backend sync ──
  const [backendProfile, setBackendProfile] = useState(null);
  const [backendStats, setBackendStats]     = useState(null);

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const token = await getIdToken();
        if (token) {
          setAuthToken(token);
          const [profileRes, statsRes] = await Promise.all([
            userService.getProfile(),
            userService.getStats(),
          ]);
          setBackendProfile(profileRes.data);
          setBackendStats(statsRes.data);
        }
      } catch (e) {
        console.warn('Could not load backend profile:', e.message);
      }
    };
    fetchBackend();
  }, []);

  // detect provider
  const isGoogle = currentUser?.providerData?.[0]?.providerId === 'google.com';
  const isEmailPass = currentUser?.providerData?.[0]?.providerId === 'password';

  // ── profile edit state ──
  const [displayName, setDisplayName]     = useState(currentUser?.displayName || '');
  const [savingName, setSavingName]       = useState(false);
  const [nameEditing, setNameEditing]     = useState(false);

  // ── avatar ──
  const [avatarPreset, setAvatarPreset]   = useState(() => localStorage.getItem('raghost_avatar_preset') || 'sunset');
  const [avatarColor, setAvatarColor]     = useState(() => localStorage.getItem('raghost_avatar_color') || AVATAR_PRESETS[0].style);
  const [avatarEmoji, setAvatarEmoji]     = useState(() => localStorage.getItem('raghost_avatar_emoji') || '');
  const [avatarMode, setAvatarMode]       = useState(() => localStorage.getItem('raghost_avatar_mode') || 'initials'); // initials | emoji | url
  const [avatarUrl, setAvatarUrl]         = useState(currentUser?.photoURL || '');

  // ── password ──
  const [pwLoading, setPwLoading]         = useState(false);
  const [pwSent, setPwSent]               = useState(false);

  // ── delete account ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword]   = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting]               = useState(false);

  // ── preferences ──
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raghost_prefs') || '{}'); } catch { return {}; }
  });

  // ── toast ──
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync name from firebase on mount
  useEffect(() => { setDisplayName(currentUser?.displayName || ''); }, [currentUser]);

  // ── backend sync ──
  const syncTimer = useRef(null);
  const syncToBackend = (preferences) => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        const token = await getIdToken();
        setAuthToken(token);
        await userService.updateProfile({ preferences });
      } catch (e) { console.warn('Preferences sync failed:', e.message); }
    }, 600);
  };

  // Hydrate state from backend when profile loads
  useEffect(() => {
    if (!backendProfile) return;
    const p = backendProfile.preferences || {};
    if (p.avatarColor) {
      setAvatarColor(p.avatarColor);
      // try to match to preset
      const match = AVATAR_PRESETS.find(pr => pr.style === p.avatarColor);
      if (match) setAvatarPreset(match.id);
    }
    if (p.avatarEmoji !== undefined) setAvatarEmoji(p.avatarEmoji || '');
    if (p.avatarMode)              setAvatarMode(p.avatarMode);
    setPrefs({
      emailNotifications: p.emailNotifications ?? false,
      queryAlerts:        p.queryAlerts        ?? false,
      weeklyDigest:       p.weeklyDigest       ?? false,
      compactSidebar:     p.compactSidebar     ?? false,
    });
  }, [backendProfile]);

  // ── change handlers: update state + localStorage + backend ──
  const handleAvatarColorChange = (preset) => {
    setAvatarPreset(preset.id);
    setAvatarColor(preset.style);
    localStorage.setItem('raghost_avatar_preset', preset.id);
    localStorage.setItem('raghost_avatar_color', preset.style);
    syncToBackend({ avatarColor: preset.style, avatarEmoji, avatarMode, ...prefs });
  };
  const handleAvatarEmojiChange = (emoji) => {
    setAvatarEmoji(emoji);
    localStorage.setItem('raghost_avatar_emoji', emoji);
    syncToBackend({ avatarColor, avatarEmoji: emoji, avatarMode, ...prefs });
  };
  const handleAvatarModeChange = (mode) => {
    setAvatarMode(mode);
    localStorage.setItem('raghost_avatar_mode', mode);
    syncToBackend({ avatarColor, avatarEmoji, avatarMode: mode, ...prefs });
  };
  const handlePrefChange = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem('raghost_prefs', JSON.stringify(updated));
    syncToBackend({ avatarColor, avatarEmoji, avatarMode, ...updated });
  };

  // ── derived stats ──
  const totalQueries = bots.reduce((s, b) => s + (b.totalQueries || 0), 0);
  const activeBots   = bots.filter(b => b.status === 'active').length;
  const memberSince  = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const lastLogin    = currentUser?.metadata?.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  // ── avatar rendering ──
  const initials = (currentUser?.displayName || currentUser?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const AvatarDisplay = ({ size = 96, className = '' }) => {
    if (avatarMode === 'url' && avatarUrl) {
      return <img src={avatarUrl} alt="avatar" className={`object-cover border-2 border-black ${className}`} style={{ width: size, height: size }} />;
    }
    if (avatarMode === 'emoji' && avatarEmoji) {
      return (
        <div className={`border-2 border-black flex items-center justify-center ${className}`}
          style={{ width: size, height: size, background: avatarColor, fontSize: size * 0.4 }}>
          {avatarEmoji}
        </div>
      );
    }
    // initials with gradient
    return (
      <div className={`border-2 border-black flex items-center justify-center font-black ${className}`}
        style={{ width: size, height: size, background: avatarColor, fontSize: size * 0.32, color: avatarColor.includes('1e1b4b') ? '#fff' : '#000' }}>
        {initials}
      </div>
    );
  };

  // ── handlers ──
  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      // 1. Update Firebase Auth
      await updateDisplayName(displayName.trim());
      // 2. Sync to MongoDB
      const token = await getIdToken();
      setAuthToken(token);
      await userService.updateProfile({ displayName: displayName.trim() });
      setNameEditing(false);
      showToast('Display name updated!');
    } catch (e) {
      showToast(e.message || 'Failed to update name', 'error');
    } finally { setSavingName(false); }
  };

  const handlePasswordReset = async () => {
    setPwLoading(true);
    try {
      await resetPassword(currentUser.email);
      setPwSent(true);
      showToast('Password reset email sent!');
    } catch (e) {
      showToast(e.message || 'Failed to send reset email', 'error');
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      // 1. Delete all MongoDB data first
      const token = await getIdToken();
      setAuthToken(token);
      await userService.deleteAccount();
      // 2. Delete Firebase Auth account
      await deleteAccount(isEmailPass ? deletePassword : undefined);
      showToast('Account deleted');
    } catch (e) {
      showToast(e.message || 'Failed to delete account', 'error');
      setDeleting(false);
    }
  };

  const exportData = () => {
    const data = {
      profile: { email: currentUser?.email, displayName: currentUser?.displayName, memberSince },
      bots: bots.map(b => ({ id: b._id, name: b.name, type: b.type, status: b.status, totalQueries: b.totalQueries })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'raghost-data.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!');
  };

  const EMOJI_OPTIONS = ['🤖', '🦊', '🐉', '🔥', '⚡', '🎯', '💡', '🚀', '🌟', '💎', '🦋', '🐼'];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">

      {/* ── PROFILE HERO ── */}
      <div className="bg-nb-yellow border-2 border-black shadow-nb p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative flex-shrink-0">
          <AvatarDisplay size={88} className="rounded-none" />
          <button onClick={() => document.getElementById('avatar-editor').scrollIntoView({ behavior: 'smooth' })}
            className="absolute -bottom-2 -right-2 w-7 h-7 border-2 border-black bg-white flex items-center justify-center hover:bg-nb-yellow transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-black">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}</h2>
          <p className="text-sm text-black/70 mt-0.5">{currentUser?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            <span className={`text-xs font-black border-2 border-black px-2 py-0.5 ${isGoogle ? 'bg-nb-blue' : 'bg-nb-pink'}`}>
              {isGoogle ? '🔵 Google' : '📧 Email'}
            </span>
            <span className="text-xs font-black border-2 border-black bg-white px-2 py-0.5">
              Joined {memberSince}
            </span>
            <span className="text-xs font-black border-2 border-black bg-white px-2 py-0.5 flex items-center gap-1">
              <Clock size={11} />Last login: {lastLogin}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={exportData} className="nb-btn bg-white border-black px-3 py-2 text-xs flex items-center gap-1.5 font-bold">
            <Download size={13} />Export Data
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Bot}            label="Total Bots"    value={backendStats?.totalBots    ?? bots.length}                    bg="bg-nb-yellow" />
        <StatPill icon={Zap}            label="Active Bots"   value={backendStats?.activeBots   ?? activeBots}                     bg="bg-nb-pink" />
        <StatPill icon={MessageSquare}  label="Total Queries" value={(backendStats?.totalQueries ?? totalQueries).toLocaleString()} bg="bg-nb-blue" />
        <StatPill icon={Star}           label="Tokens Used"   value={backendStats ? `${(backendStats.totalTokens/1000).toFixed(1)}k` : bots.filter(b => b.status !== 'inactive').length} bg="bg-purple-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── EDIT PROFILE ── */}
        <Section title="Edit Profile" icon={Edit3} accent="bg-nb-yellow">
          <Field label="Display Name">
            {nameEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="nb-input flex-1 py-2 text-sm"
                  placeholder="Your name"
                />
                <button onClick={handleSaveName} disabled={savingName}
                  className="nb-btn bg-nb-yellow border-black px-3 py-2 flex items-center gap-1 text-xs font-bold disabled:opacity-50">
                  {savingName ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}Save
                </button>
                <button onClick={() => { setNameEditing(false); setDisplayName(currentUser?.displayName || ''); }}
                  className="nb-btn bg-white border-black px-2 py-2">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-2 border-black bg-gray-50 px-3 py-2">
                <span className="text-sm font-bold">{currentUser?.displayName || <span className="text-nb-muted italic">Not set</span>}</span>
                <button onClick={() => setNameEditing(true)} className="text-xs font-bold flex items-center gap-1 text-nb-muted hover:text-black">
                  <Edit3 size={12} />Edit
                </button>
              </div>
            )}
          </Field>

          <Field label="Email Address">
            <div className="flex items-center justify-between border-2 border-black bg-gray-50 px-3 py-2">
              <span className="text-sm font-bold truncate">{currentUser?.email}</span>
              <span className={`text-xs font-black px-1.5 py-0.5 border border-black ml-2 flex-shrink-0 ${currentUser?.emailVerified ? 'bg-green-200' : 'bg-nb-yellow'}`}>
                {currentUser?.emailVerified ? '✓ verified' : 'unverified'}
              </span>
            </div>
            <p className="text-xs text-nb-muted mt-1">Email changes require re-authentication — contact support.</p>
          </Field>

          <Field label="Account Provider">
            <div className="flex items-center gap-2 border-2 border-black bg-gray-50 px-3 py-2">
              <Globe size={14} />
              <span className="text-sm font-bold">{isGoogle ? 'Google OAuth' : 'Email & Password'}</span>
            </div>
          </Field>

          <Field label="Firebase UID">
            <div className="flex items-center gap-2 border-2 border-black bg-gray-50 px-3 py-2 overflow-hidden">
              <Key size={13} className="flex-shrink-0 text-nb-muted" />
              <span className="text-xs font-mono text-nb-muted truncate">{currentUser?.uid}</span>
            </div>
          </Field>
        </Section>

        {/* ── AVATAR EDITOR ── */}
        <Section title="Avatar" icon={Camera} accent="bg-nb-blue" id="avatar-editor">
          <div className="flex items-center gap-4 mb-4">
            <AvatarDisplay size={64} />
            <div>
              <p className="text-sm font-bold">{initials}</p>
              <p className="text-xs text-nb-muted">Your current avatar</p>
            </div>
          </div>

          <Field label="Avatar Style">
            <div className="flex gap-2">
              {[['initials', 'Initials'], ['emoji', 'Emoji'], ['url', 'Image URL']].map(([mode, label]) => (
                <button key={mode} onClick={() => handleAvatarModeChange(mode)}
                  className={`flex-1 py-1.5 text-xs font-bold border-2 border-black transition-colors ${avatarMode === mode ? 'bg-nb-yellow' : 'bg-white hover:bg-gray-50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {avatarMode === 'initials' && (
            <Field label="Gradient Preset">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    title={preset.id.replace('-',' ')}
                    onClick={() => handleAvatarColorChange(preset)}
                    className={`h-9 border-2 transition-all relative overflow-hidden ${
                      avatarPreset === preset.id ? 'border-black scale-110 shadow-[3px_3px_0px_0px_#000]' : 'border-transparent hover:border-black'
                    }`}
                    style={{ background: preset.style }}
                  >
                    {avatarPreset === preset.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check size={13} className={preset.id === 'cosmic' ? 'text-white' : 'text-black'} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-nb-muted mt-2 capitalize">{avatarPreset.replace('-',' ')} gradient</p>
            </Field>
          )}

          {avatarMode === 'emoji' && (
            <Field label="Choose Emoji">
              <div className="flex flex-wrap gap-2 mb-2">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} onClick={() => handleAvatarEmojiChange(e)}
                    className={`w-9 h-9 text-xl border-2 flex items-center justify-center transition-all ${avatarEmoji === e ? 'border-black bg-nb-yellow scale-110' : 'border-gray-300 hover:border-black bg-white'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.slice(0,8).map(preset => (
                  <button key={preset.id} onClick={() => handleAvatarColorChange(preset)}
                    className={`w-6 h-6 border-2 transition-all ${avatarPreset === preset.id ? 'border-black scale-110' : 'border-gray-300 hover:border-black'}`}
                    style={{ background: preset.style }} />
                ))}
              </div>
            </Field>
          )}

          {avatarMode === 'url' && (
            <Field label="Image URL">
              <div className="flex gap-2">
                <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                  className="nb-input flex-1 py-2 text-sm" placeholder="https://..." />
                <button onClick={async () => {
                  try {
                    await updatePhotoURL(avatarUrl);
                    const token = await getIdToken();
                    setAuthToken(token);
                    await userService.updateProfile({ photoURL: avatarUrl });
                    showToast('Avatar updated!');
                  } catch(e){ showToast(e.message,'error'); }}}
                  className="nb-btn bg-nb-blue border-black px-3 py-2 text-xs font-bold">Apply</button>
              </div>
            </Field>
          )}
        </Section>

        {/* ── SECURITY ── */}
        <Section title="Security" icon={Shield} accent="bg-nb-pink">
          {isEmailPass ? (
            <>
              <Field label="Password">
                <div className="space-y-3">
                  <p className="text-xs text-nb-muted">We'll send a password reset link to <strong>{currentUser?.email}</strong></p>
                  <button onClick={handlePasswordReset} disabled={pwLoading || pwSent}
                    className={`nb-btn w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 border-black disabled:opacity-60
                      ${pwSent ? 'bg-green-200' : 'bg-nb-yellow hover:bg-yellow-300'}`}>
                    {pwLoading ? <Loader2 size={15} className="animate-spin" />
                     : pwSent   ? <><Check size={15} />Reset email sent!</>
                     : <><Lock size={15} />Send Password Reset Email</>}
                  </button>
                </div>
              </Field>
            </>
          ) : (
            <div className="border-2 border-black bg-nb-blue/20 p-3 text-sm">
              <p className="font-bold flex items-center gap-2"><Globe size={14} />Google Account</p>
              <p className="text-xs text-nb-muted mt-1">Password management is handled by Google. Update it at <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="underline font-bold">myaccount.google.com</a></p>
            </div>
          )}

          <div className="mt-4 space-y-2 border-t-2 border-black pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold flex items-center gap-2"><Activity size={14} />MFA / 2FA</span>
              <span className={`text-xs font-black border border-black px-2 py-0.5 ${currentUser?.multiFactor?.enrolledFactors?.length > 0 ? 'bg-green-200' : 'bg-gray-100'}`}>
                {currentUser?.multiFactor?.enrolledFactors?.length > 0 ? 'Enabled' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold flex items-center gap-2"><Check size={14} />Email verified</span>
              <span className={`text-xs font-black border border-black px-2 py-0.5 ${currentUser?.emailVerified ? 'bg-green-200' : 'bg-nb-yellow'}`}>
                {currentUser?.emailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Section>

        {/* ── PREFERENCES ── */}
        <Section title="Preferences" icon={Star} accent="bg-purple-300">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates about your bots via email',    icon: Bell },
            { key: 'queryAlerts',        label: 'Query Limit Alerts',  description: 'Alert when a bot exceeds 80% of query limit', icon: AlertTriangle },
            { key: 'weeklyDigest',       label: 'Weekly Digest',       description: 'Weekly summary of bot performance',           icon: BarChart2 },
            { key: 'compactSidebar',     label: 'Compact Sidebar',     description: 'Default to collapsed sidebar on load',        icon: PanelLeft },
          ].map(({ key, label, description, icon: PrefIcon }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 border-2 border-black bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PrefIcon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-nb-muted">{description}</p>
                </div>
              </div>
              {/* pill toggle */}
              <button
                onClick={() => handlePrefChange(key)}
                role="switch"
                aria-checked={prefs[key]}
                className={`relative flex-shrink-0 w-12 h-6 border-2 border-black rounded-full transition-colors duration-200 ${
                  prefs[key] ? 'bg-nb-yellow' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full border-2 border-black bg-white shadow-[1px_1px_0px_0px_#000] transition-all duration-200 ${
                  prefs[key] ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </Section>

      </div>

      {/* ── ACTIVITY FEED ── */}
      <Section title="Recent Bots Activity" icon={Activity} accent="bg-nb-blue">
        {bots.length === 0 ? (
          <p className="text-sm text-nb-muted text-center py-6">No bots created yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {[...bots].sort((a, b) => (b.totalQueries || 0) - (a.totalQueries || 0)).slice(0, 6).map(bot => (
              <div key={bot._id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 text-xs font-black
                    ${bot.status === 'active' ? 'bg-nb-yellow' : bot.status === 'training' ? 'bg-nb-blue' : 'bg-gray-100'}`}>
                    <Bot size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{bot.name}</p>
                    <p className="text-xs text-nb-muted">{bot.type} · {bot.totalQueries || 0} queries</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-black border border-black px-1.5 py-0.5
                    ${bot.status === 'active' ? 'bg-green-200' : bot.status === 'training' ? 'bg-nb-blue' : 'bg-gray-100'}`}>
                    {bot.status}
                  </span>
                  <span className="text-xs text-nb-muted">{bot.accuracy ? `${bot.accuracy}% acc` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── DANGER ZONE ── */}
      <div className="bg-white border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
        <div className="bg-red-100 border-b-2 border-red-500 px-5 py-3 flex items-center gap-2">
          <Trash2 size={16} className="text-red-600" />
          <h3 className="font-black text-sm uppercase tracking-wide text-red-700">Danger Zone</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Delete Account</p>
              <p className="text-xs text-nb-muted mt-0.5">Permanently delete your account and all associated bots. <strong>This cannot be undone.</strong></p>
            </div>
            <button onClick={() => setShowDeleteModal(true)}
              className="nb-btn bg-red-100 border-red-500 text-red-700 hover:bg-red-200 px-4 py-2 text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
              <Trash2 size={13} />Delete Account
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="font-bold text-sm">Export All Data</p>
              <p className="text-xs text-nb-muted mt-0.5">Download your profile and all bot configurations as JSON.</p>
            </div>
            <button onClick={exportData}
              className="nb-btn bg-gray-100 border-black text-black hover:bg-gray-200 px-4 py-2 text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
              <Download size={13} />Export
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black shadow-nb-xl w-full max-w-md">
            <div className="bg-red-100 border-b-2 border-red-500 p-4 flex items-center justify-between">
              <h3 className="font-black text-red-700 flex items-center gap-2"><Trash2 size={16} />Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} className="nb-btn bg-white border-black p-1.5"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 border-2 border-red-300 p-3 text-sm text-red-700">
                <p className="font-bold">⚠️ This will permanently delete:</p>
                <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside">
                  <li>Your account and all profile data</li>
                  <li>All {bots.length} bot{bots.length !== 1 ? 's' : ''} and their knowledge bases</li>
                  <li>All embed configurations and history</li>
                </ul>
              </div>
              {isEmailPass && (
                <div>
                  <label className="block text-xs font-bold mb-1.5">Enter your password to confirm</label>
                  <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                    className="nb-input w-full py-2 text-sm" placeholder="Your current password" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Type <strong className="font-black">DELETE</strong> to confirm
                </label>
                <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                  className="nb-input w-full py-2 text-sm" placeholder="DELETE" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowDeleteModal(false)} className="nb-btn bg-white border-black flex-1 py-2 text-sm font-bold">Cancel</button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || (isEmailPass && !deletePassword) || deleting}
                  className="nb-btn bg-red-500 border-red-700 text-white flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProfileView;
