import { useEffect, useState } from 'react';
import './App.css';
import BlogList from './components/BlogList.jsx';
import Editor from './components/Editor.jsx';
import Login from './components/Login.jsx';

export default function App() {
  const [view, setView] = useState('list');
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]); // loadPosts()
  const [token, setToken] = useState(localStorage.getItem('token'));

  
  useEffect(() => {                                                                                                                                                                        
       fetch('http://localhost:3000/posts')                                                                                                                                                   
         .then((res) => res.json())                                                                                                                                                           
         .then(setPosts);                                                                                                                                                                     
     }, []);                

  // 从 token 解出当前登录用户名(JWT payload 可读)
  const getUsername = () => {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)).username;
    } catch {
      return null;
    }
  };
  const isAdmin = getUsername() === 'fool';

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
        fetch(`http://localhost:3000/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
      fetch('http://localhost:3000/posts', {                                                                                                                                               
           method: 'POST',                                                                                                                                                                    
           headers: { 'Content-Type': 'application/json'
                     , 'Authorization': `Bearer ${token}`,
            },                                                                                                                                   
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
    fetch(`http://localhost:3000/posts/${id}`, {
      method: 'DELETE',
      headers:{'Authorization': `Bearer ${token}`},
    })
      .then((res) => {
        if (res.ok) {
          setPosts((prev) => prev.filter((post) => post.id !== id));
        } else {
          alert('删除失败');
        }

      });
  };
   const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    setView('list');
  };
    const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setView('list');
  }
  return (
      <div>
        <header className="header">
          <h1>我的博客</h1>
          <div>
            {isAdmin && (
              <button onClick={handleNewPost}>新建文章</button>
            )}
            {token ? (
              <button onClick={handleLogout}>登出</button>
            ) : (
              <button onClick={() => setView('login')}>登录/注册</button>
            )}
          </div>
        </header>
        {view === 'list' ? (                                                                                                                                                                 
           <BlogList posts={posts} onEditPost={isAdmin ? handleEditPost : null} onDeletePost={isAdmin ? handleDelete : null} />                                                                 
         ) : view === 'editor' ? (                                                                                                                                                            
           <Editor initialPost={editingPost} onSave={handleSave} onBack={() => setView('list')} />                                                                                                                                                                     
         ) : (                                                                                                                                                                                
           <Login onLogin={handleLogin} />  
         )}
      </div>
  );
  
}
