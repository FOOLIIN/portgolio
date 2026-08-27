import { useEffect, useState } from 'react';
import './App.css';
import BlogList from './components/BlogList.jsx';
import Editor from './components/Editor.jsx';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Footer({ onNavigate }) {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <button type="button" className="footer-name" onClick={() => onNavigate('home')}>fool</button>
        <p className="footer-bio">我是一名普通的大学生,这个站点是我用来学习和展示的</p>
        <ul className="footer-social">
          <li>
            <a href="https://github.com/FOOLIIN" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.3 2 1.8 6.6 1.8 12.2c0 4.5 2.9 8.4 7 9.7.5.1.7-.2.7-.5v-1.7c-2.9.7-3.5-1.3-3.5-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.3-.3-4.7-1.1-4.7-5 0-1.1.4-2 1.1-2.8-.2-.4-.5-1.5 0-2.8 0 0 .9-.3 2.8 1 .8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.8 0 3.9-2.4 4.8-4.7 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4.1-1.4 7-5.2 7-9.7C22.2 6.6 17.7 2 12 2z" /></svg>
            </a>
          </li>
        </ul>
      </div>
      <div className="footer-col">
        <p className="footer-title">导航</p>
        <ul>
          <li><button type="button" onClick={() => onNavigate('home')}>首页</button></li>
          <li><button type="button" onClick={() => onNavigate('list')}>博客</button></li>
        </ul>
      </div>
      <div className="footer-col">
        <p className="footer-title">其他</p>
        <ul>
          <li><a href="https://github.com/FOOLIIN" target="_blank" rel="noopener noreferrer">GitHub 主页</a></li>
          <li><button type="button" onClick={scrollTop}>回到顶部</button></li>
        </ul>
      </div>
    </footer>
  );
}

export default function App() {
  const [view, setView] = useState('home'); // 'list', 'editor', 'login'
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]); // loadPosts()
  const [username, setUsername] = useState(null);

  
  useEffect(() => {                                                                                                                                                                        
       fetch(`${API_BASE}/posts`)                                                                                                                                                   
         .then((res) => res.json())                                                                                                                                                           
         .then(setPosts);                                                                                                                                                                     
       fetch(`${API_BASE}/me`, { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : null))
         .then((data) => setUsername(data?.username ?? null))
         .catch(() => setUsername(null));
     }, []);                

  const isAdmin = username === 'fool';

  const handleNewPost = () => {
    if (!isAdmin) {
      alert('无权限：仅作者可操作');
      return;
    }
    setEditingPost(null);
    setView('editor');
  };

  const handleEditPost = (post) => {
    if (!isAdmin) {
      alert('无权限：仅作者可操作');
      return;
    }
    setEditingPost(post);
    setView('editor');
  };

  const handleSave = ({ title, content }) => {
    
      if (editingPost) {
        fetch(`${API_BASE}/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, content }),
        })
          .then((res) => {
            if (res.ok) {
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === editingPost.id ? { ...p, title, content } : p,
                ),
              );
              setView('list');
            } else {
              alert('更新失败');
            }
          });
        return;
      }
      fetch(`${API_BASE}/posts`, {                                                                                                                                               
           method: 'POST',                                                                                                                                                                    
           headers: { 'Content-Type': 'application/json' },                                                                                                                                   
           credentials: 'include',
           body: JSON.stringify({ title, content }), 
      })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || '保存失败');
          return;
        }
        setPosts((prev) => [...prev, data]);
        setView('list');
      })
      .catch(() => {
        alert('保存失败');
      }); 
  };
      

  const handleDelete = (id) => {
    if (!window.confirm('确定删除这篇文章吗？')) return;
    fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          setPosts((prev) => prev.filter((post) => post.id !== id));
        } else {
          alert('删除失败');
        }

      });
  };
   const handleLogin = (loggedInUser) => {
    setUsername(loggedInUser);
    setView('list');
  };
    const handleLogout = () => {
    fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    setUsername(null);
    setView('list');
  }
  return (
      <div>
        <header className="header">
          <h1>我的博客</h1>
          <nav>
             <button onClick={() => setView('home')}>首页</button>
             <button onClick={() => setView('list')}>博客</button>
          </nav>
          <div>
            {isAdmin && (
              <button onClick={handleNewPost}>新建文章</button>
            )}
            {username ? (
              <button onClick={handleLogout}>登出</button>
            ) : (
              <button onClick={() => setView('login')}>登录/注册</button>
            )}
          </div>
        </header>
        {view === 'home' ? (
          <Home />
        ) : view === 'list' ? (                                                                                                                                                                 
           <BlogList posts={posts} onEditPost={isAdmin ? handleEditPost : null} onDeletePost={isAdmin ? handleDelete : null} />                                                                 
         ) : view === 'editor' ? (                                                                                                                                                            
           <Editor initialPost={editingPost} onSave={handleSave} onBack={() => setView('list')} />                                                                                                                                                                     
          ) : (                                                                                                                                                                                
            <Login onLogin={handleLogin} />  
          )}
          <Footer onNavigate={setView} />
      </div>
  );
  
}
