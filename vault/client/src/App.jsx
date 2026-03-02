import { useEffect, useMemo, useState } from 'react';
import {
  Lock,
  Shield,
  KeyRound,
  FileText,
  TerminalSquare,
  History,
  UserCheck,
  Siren,
  Share2,
} from 'lucide-react';
import { authApi, auditApi, securityApi, setAuthToken, vaultApi } from './lib/api';
import {
  decryptWithVaultKey,
  deriveVaultKey,
  encryptWithVaultKey,
  generateRandomSalt,
} from './lib/crypto';

const sections = [
  { id: 'vault', label: 'My Vault', icon: Lock },
  { id: 'add', label: 'Add Item', icon: FileText },
  { id: 'audit', label: 'Audit Logs', icon: History },
  { id: 'security', label: 'Security Settings', icon: Shield },
  { id: 'twofa', label: '2FA Setup', icon: UserCheck },
  { id: 'deadman', label: 'Dead Man Switch', icon: Siren },
];

const cardClass =
  'rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 shadow-glass backdrop-blur';

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
  />
);

const Select = (props) => (
  <select
    {...props}
    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
  />
);

const Button = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
  >
    {children}
  </button>
);

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const masterSalt = generateRandomSalt();
      const response = await authApi.register({
        email,
        password,
        masterSalt,
      });
      setQrCodeDataUrl(response.data.qrCodeDataUrl);
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const loginResponse = await authApi.login({ email, password, totpToken });
      const token = loginResponse.data.token;
      setAuthToken(token);
      const meResponse = await authApi.me();
      const user = meResponse.data.user;
      const cryptoKey = await deriveVaultKey(masterPassword, user.masterSalt);
      onAuthenticated({ token, user, cryptoKey, masterPassword });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-3">
            <Lock className="h-7 w-7 animate-pulseLock text-cyan-400" />
            <h1 className="text-2xl font-bold text-slate-100">Vault</h1>
          </div>
          <p className="mb-6 text-sm text-slate-400">
            Zero-knowledge encrypted asset manager. All encryption happens in your browser.
          </p>

          <div className="space-y-3">
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              type="password"
              placeholder="Account Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Master Password (encryption key)"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />

            {mode === 'login' && (
              <Input
                placeholder="2FA TOTP Code"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
              />
            )}
          </div>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            {mode === 'register' ? (
              <Button disabled={loading} onClick={handleRegister}>
                Register + Setup 2FA
              </Button>
            ) : (
              <Button disabled={loading} onClick={handleLogin}>
                Login Securely
              </Button>
            )}

            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-cyan-300 underline"
            >
              {mode === 'login' ? 'Need account?' : 'Already registered?'}
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">2FA QR Setup</h2>
          {qrCodeDataUrl ? (
            <div>
              <img src={qrCodeDataUrl} alt="2FA QR" className="mx-auto w-56 rounded-lg bg-white p-2" />
              <p className="mt-3 text-xs text-slate-400">
                Scan with Google Authenticator or Microsoft Authenticator, then sign in with the TOTP code.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Register to generate a TOTP QR code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VaultSection({ section, token, cryptoKey, user, onLogout }) {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [events, setEvents] = useState([]);
  const [decryptedItem, setDecryptedItem] = useState(null);
  const [shareLink, setShareLink] = useState('');

  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  const [trustedEmail, setTrustedEmail] = useState(user.trustedEmail || '');
  const [inactivityMonths, setInactivityMonths] = useState(user.inactivityMonths || 6);
  const [deadManEnabled, setDeadManEnabled] = useState(Boolean(user.deadManEnabled));

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshItems = async () => {
    const response = await vaultApi.list();
    setItems(response.data.items);
  };

  const refreshAudit = async () => {
    const response = await auditApi.list();
    setLogs(response.data.logs);
  };

  const refreshDashboard = async () => {
    const response = await securityApi.dashboard();
    setDashboard(response.data);
  };

  const refreshEvents = async () => {
    const response = await securityApi.deadManEvents();
    setEvents(response.data.events);
  };

  useEffect(() => {
    setAuthToken(token);
    refreshItems();
  }, [token]);

  useEffect(() => {
    if (section === 'audit') {
      refreshAudit();
    }
    if (section === 'security') {
      refreshDashboard();
    }
    if (section === 'deadman') {
      refreshEvents();
    }
  }, [section]);

  const handleAddItem = async () => {
    setStatus('');
    setLoading(true);
    try {
      let plaintextData = content;
      let fileMetadata;

      if (type === 'file' && file) {
        plaintextData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        fileMetadata = {
          name: file.name,
          mimeType: file.type,
          size: file.size,
        };
      }

      const encrypted = await encryptWithVaultKey(
        JSON.stringify({ content: plaintextData, type, createdAt: new Date().toISOString() }),
        cryptoKey,
        user.masterSalt
      );

      await vaultApi.create({
        type,
        title,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        salt: encrypted.salt,
        fileMetadata,
      });

      setStatus('Encrypted item stored successfully.');
      setTitle('');
      setContent('');
      setFile(null);
      await refreshItems();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to store item');
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptItem = async (itemId) => {
    setStatus('');
    try {
      const response = await vaultApi.get(itemId);
      const item = response.data.item;
      const plaintext = await decryptWithVaultKey(
        {
          encryptedContent: item.encryptedContent,
          iv: item.iv,
        },
        cryptoKey
      );
      setDecryptedItem({ item, plaintext: JSON.parse(plaintext) });
    } catch (err) {
      setStatus('Decrypt failed. Ensure master password is correct for this session.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    await vaultApi.remove(itemId);
    await refreshItems();
  };

  const handleShare = async (itemId) => {
    const response = await vaultApi.share(itemId, 30);
    setShareLink(response.data.shareLink);
  };

  const saveDeadManSwitch = async () => {
    setStatus('');
    await securityApi.updateDeadManSwitch({
      trustedEmail,
      inactivityMonths,
      deadManEnabled,
    });
    setStatus('Dead man switch settings updated.');
    await refreshEvents();
  };

  const triggerDeadManSwitch = async () => {
    setStatus('');
    const response = await securityApi.triggerDeadManSwitch();
    setStatus(response.data.message);
    await refreshEvents();
  };

  const regenerate2fa = async () => {
    const response = await authApi.regenerate2fa();
    setDecryptedItem({
      item: { title: '2FA QR Code' },
      plaintext: { content: response.data.qrCodeDataUrl },
    });
  };

  const sectionContent = useMemo(() => {
    if (section === 'vault') {
      return (
        <div className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Encrypted Vault Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div>
                  <p className="font-medium text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.type} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-slate-200 text-slate-900 hover:bg-white" onClick={() => handleDecryptItem(item._id)}>View</Button>
                  <Button className="bg-emerald-400 text-slate-900 hover:bg-emerald-300" onClick={() => handleShare(item._id)}><Share2 className="mr-1 inline h-4 w-4" />Share</Button>
                  <Button className="bg-rose-500 text-white hover:bg-rose-400" onClick={() => handleDeleteItem(item._id)}>Delete</Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-400">No items yet.</p>}
          </div>
        </div>
      );
    }

    if (section === 'add') {
      return (
        <div className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Add Secure Item</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="note">Secure Note</option>
              <option value="apiKey">API Key</option>
              <option value="credential">Credential</option>
              <option value="file">Private File</option>
            </Select>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item title" />
          </div>

          {type === 'file' ? (
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-3" />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Sensitive content"
              className="mt-3 h-36 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            />
          )}

          <div className="mt-4">
            <Button disabled={loading} onClick={handleAddItem}>
              Encrypt & Save
            </Button>
          </div>
        </div>
      );
    }

    if (section === 'audit') {
      return (
        <div className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Immutable Audit History</h2>
          <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log._id} className="rounded border border-slate-700 bg-slate-800/60 p-3 text-sm">
                <p className="font-medium text-cyan-300">{log.action}</p>
                <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()} · IP {log.ipAddress}</p>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-slate-400">No logs found.</p>}
          </div>
        </div>
      );
    }

    if (section === 'security') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass}>
            <h2 className="mb-3 text-lg font-semibold text-slate-100">Security Dashboard</h2>
            <div className="space-y-2 text-sm">
              <p>Last login: <span className="text-slate-300">{dashboard?.lastLogin ? new Date(dashboard.lastLogin).toLocaleString() : 'N/A'}</span></p>
              <p>Failed attempts: <span className="text-amber-300">{dashboard?.totalFailedLogins ?? 0}</span></p>
              <p>Last login IP: <span className="text-slate-300">{dashboard?.lastLoginIp || 'N/A'}</span></p>
            </div>
          </div>
          <div className={cardClass}>
            <h2 className="mb-3 text-lg font-semibold text-slate-100">Access Locations</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {(dashboard?.accessLocations || []).map((ip) => (
                <li key={ip} className="rounded border border-slate-700 bg-slate-800/60 p-2">{ip}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (section === 'twofa') {
      return (
        <div className={cardClass}>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">2FA Setup</h2>
          <p className="mb-4 text-sm text-slate-400">Regenerate your TOTP QR and reconnect authenticator apps.</p>
          <Button onClick={regenerate2fa}>Regenerate 2FA QR</Button>
        </div>
      );
    }

    return (
      <div className={cardClass}>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Dead Man Switch</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={trustedEmail} onChange={(e) => setTrustedEmail(e.target.value)} placeholder="Trusted contact email" />
          <Input
            type="number"
            min={1}
            max={24}
            value={inactivityMonths}
            onChange={(e) => setInactivityMonths(Number(e.target.value))}
            placeholder="Inactivity months"
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={deadManEnabled} onChange={(e) => setDeadManEnabled(e.target.checked)} />
          Enable dead man switch
        </label>

        <div className="mt-4 flex gap-3">
          <Button onClick={saveDeadManSwitch}>Save Settings</Button>
          <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={triggerDeadManSwitch}>
            Test Recovery Email
          </Button>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-300">
          {events.map((event) => (
            <div key={event._id} className="rounded border border-slate-700 bg-slate-800/60 p-2">
              Recovery {event.status} · {new Date(event.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    );
  }, [
    section,
    items,
    logs,
    dashboard,
    type,
    title,
    content,
    file,
    loading,
    trustedEmail,
    inactivityMonths,
    deadManEnabled,
    events,
  ]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-vault-900 to-slate-900 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-6 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-cyan-400" />
          <span className="font-semibold">Vault</span>
        </div>
        <div className="space-y-2">
          {sections.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.id}
                onClick={() => window.dispatchEvent(new CustomEvent('vault-section', { detail: entry.id }))}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === entry.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
              >
                <Icon className="h-4 w-4" />
                {entry.label}
              </button>
            );
          })}
        </div>
        <button onClick={onLogout} className="mt-8 text-sm text-rose-300 underline">Logout</button>
      </aside>

      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Security Control Center</h1>
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <TerminalSquare className="h-4 w-4" />
            Zero Knowledge Mode Active
          </div>
        </div>

        {sectionContent}

        {status && <p className="mt-4 text-sm text-cyan-300">{status}</p>}
        {shareLink && <p className="mt-2 break-all text-xs text-emerald-300">One-time share link: {shareLink}</p>}

        {decryptedItem && (
          <div className="mt-5 rounded-xl border border-cyan-600/40 bg-slate-900/80 p-4">
            <h3 className="mb-2 text-sm font-semibold text-cyan-300">Decrypted Preview: {decryptedItem.item.title}</h3>
            {decryptedItem.item.title === '2FA QR Code' ? (
              <img src={decryptedItem.plaintext.content} alt="2FA QR" className="w-56 rounded bg-white p-2" />
            ) : (
              <pre className="overflow-x-auto text-xs text-slate-200">{JSON.stringify(decryptedItem.plaintext, null, 2)}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [section, setSection] = useState('vault');

  useEffect(() => {
    const handler = (event) => setSection(event.detail);
    window.addEventListener('vault-section', handler);
    return () => window.removeEventListener('vault-section', handler);
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-vault-900 to-slate-900 p-6 text-slate-100">
        <AuthScreen onAuthenticated={(payload) => setSession(payload)} />
      </div>
    );
  }

  return (
    <VaultSection
      section={section}
      token={session.token}
      cryptoKey={session.cryptoKey}
      user={session.user}
      onLogout={() => {
        setAuthToken(null);
        setSession(null);
      }}
    />
  );
}
