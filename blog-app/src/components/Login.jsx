import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = mode === 'login'
      ? 'http://localhost:3000/login'
      : 'http://localhost:3000/register';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (mode === 'register') {
          if (data.message === '注册成功') {
            setMode('login');
            setError('注册成功，请登录');
          } else {
            setError(data.message || '注册失败');
          }
        } else {
          if (data.token) {
            onLogin(data.token);
          } else {
            setError(data.message || '登录失败');
          }
        }
      })
      .catch(() => setError('网络错误'));
  };

  return (
    <div>
      <h1>{mode === 'login' ? '登录' : '注册'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
        <button type="submit">{mode === 'login' ? '登录' : '注册'}</button>
      </form>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
      </button>
    </div>
  );
}
