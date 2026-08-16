import { useEffect, useState } from 'react';
import './App.css';
import BlogList from './components/BlogList.jsx';
import Editor from './components/Editor.jsx';

const STORAGE_KEY = 'posts';

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// 惰性初始化：坏数据不崩，旧数据补 id/date 字段
function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const posts = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(posts)) return [];
    return posts.map((p) => ({
      id: p.id ?? createId(),
      title: p.title ?? '',
      content: p.content ?? '',
      date: p.date ?? null,
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [view, setView] = useState('list');
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState(loadPosts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const handleNewPost = () => {
    setEditingPost(null);
    setView('editor');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setView('editor');
  };

  const handleSave = ({ title, content }) => {
    setPosts((prev) => {
      if (editingPost) {
        return prev.map((p) =>
          p.id === editingPost.id ? { ...p, title, content } : p,
        );
      }
      return [
        ...prev,
        { id: createId(), title, content, date: new Date().toISOString() },
      ];
    });
    setView('list');
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定删除这篇文章吗？')) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {view === 'list' ? (
        <BlogList
          posts={posts}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
          onDeletePost={handleDelete}
        />
      ) : (
        <Editor
          initialPost={editingPost}
          onSave={handleSave}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}
