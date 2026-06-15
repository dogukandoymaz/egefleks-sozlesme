import { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 520);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('egefleks_auth_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Kullanıcı adı veya şifre hatalı.');
        triggerShake();
      }
    } catch {
      setError('Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #07100d 0%, #0d1f17 40%, #091510 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'inherit'
    }}>
      {/* Decorative background glows */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '520px', height: '520px', borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(158,85%,37%,0.18) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-12%', right: '-6%',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(36,85%,45%,0.12) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '45%', right: '18%',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(158,85%,37%,0.09) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(14, 24, 18, 0.88)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '24px',
        padding: '48px 40px 40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
        zIndex: 1,
        animation: shake ? 'loginShake 0.52s ease' : 'loginFadeIn 0.45s ease'
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, hsl(158,85%,37%) 0%, hsl(158,85%,27%) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 10px 28px hsla(158,85%,37%,0.45)',
            fontSize: '30px', fontWeight: '900', color: '#fff',
            fontFamily: 'inherit', letterSpacing: '-1px'
          }}>e</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '5px' }}>
            egefleks
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
            Zemin Sistemleri · Yönetici Girişi
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.28)',
            borderRadius: '10px', padding: '11px 14px',
            marginBottom: '22px', color: '#fca5a5',
            fontSize: '13px', fontWeight: '500'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Username */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: '700',
              color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
              letterSpacing: '0.8px', marginBottom: '8px'
            }}>Kullanıcı Adı</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                autoFocus
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 14px 13px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px', color: '#fff',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'hsl(158,85%,37%)';
                  e.target.style.boxShadow = '0 0 0 3px hsla(158,85%,37%,0.22)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: '700',
              color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
              letterSpacing: '0.8px', marginBottom: '8px'
            }}>Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 42px 13px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px', color: '#fff',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'hsl(158,85%,37%)';
                  e.target.style.boxShadow = '0 0 0 3px hsla(158,85%,37%,0.22)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '11px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.32)', cursor: 'pointer',
                  padding: '4px', display: 'flex', alignItems: 'center',
                  borderRadius: '4px', transition: 'color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px', width: '100%', padding: '14px',
              background: loading
                ? 'rgba(16,185,129,0.35)'
                : 'linear-gradient(135deg, hsl(158,85%,37%) 0%, hsl(158,85%,29%) 100%)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: loading ? 'none' : '0 6px 22px hsla(158,85%,37%,0.42)',
              transition: 'all 0.2s ease', fontFamily: 'inherit', letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 9px 28px hsla(158,85%,37%,0.55)'; }}}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 22px hsla(158,85%,37%,0.42)'; }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '17px', height: '17px',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'loginSpin 0.7s linear infinite'
                }} />
                Giriş Yapılıyor...
              </>
            ) : (
              <><LogIn size={17} /> Giriş Yap</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.18)', lineHeight: '1.7' }}>
          Egefleks Satış Sözleşme Sistemi · v1.0.0<br />
          Yetkisiz erişim yasaktır.
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          18%      { transform: translateX(-9px); }
          36%      { transform: translateX(9px); }
          54%      { transform: translateX(-5px); }
          72%      { transform: translateX(5px); }
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
