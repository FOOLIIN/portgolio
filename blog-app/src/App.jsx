import { useEffect, useState } from 'react';
import './App.css';
import BlogList from './components/BlogList.jsx';
import Editor from './components/Editor.jsx';

export default function App() {
  const [view, setView] = useState('list');
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]); // loadPosts()

  useEffect(() => {                                                                                                                                                                        
       fetch('http://localhost:3000/posts')                                                                                                                                                   
         .then((res) => res.json())                                                                                                                                                           
         .then(setPosts);                                                                                                                                                                     
     }, []);                

  const handleNewPost = () => {
    setEditingPost(null);
    setView('editor');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setView('editor');
  };

  const handleSave = ({ title, content }) => {
    
      if (editingPost) {
        return prev.map((p) =>
          p.id === editingPost.id ? { ...p, title, content } : p,
        );
      }
      else{
        fetch('http://localhost:3000/posts', {                                                                                                                                               
           method: 'POST',                                                                                                                                                                    
           headers: { 'Content-Type': 'application/json' },                                                                                                                                   
           body: JSON.stringify({ title, content }), 
      })
      .then((res) => res.json())
      .then((newPost) => {
        setPosts((prev) => [...prev, newPost]);
      });
      }
    setView('list');
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定删除这篇文章吗？')) return;
    fetch(`http://localhost:3000/posts/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setPosts((prev) => prev.filter((post) => post.id !== id));
        } else {
          alert('删除失败');
        }

      });
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
