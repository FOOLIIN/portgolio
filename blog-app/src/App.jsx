import { useEffect, useState } from 'react';
import './App.css';
import BlogList from './components/BlogList.jsx';
import Editor from './components/Editor.jsx';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      </div>
  );
  
}
