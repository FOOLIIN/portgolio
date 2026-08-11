import { useState } from 'react';
function BlogList({onNewPost,posts}) {  
  return (                                                                                                                                                                               
         <section id="list-view">                                                                                                                                                             
           <h1>博客</h1>                                                                                                                                                                      
           <button onClick={onNewPost}>写新文章</button>                                                                                                          
           <div id="post-list">
            {posts.map((post,index)=>(<PostCard key={index} title={post.title} content={post.content}/>))}
            </div>                                                                                                                                                               
         </section>                                                                                                                                                                           
       );                                                                                                                                                                                     
 }                                                                                                                               
     function Editor({onBack,onSave})   { 
      const [content, setContent] = useState('');
      const [title, setTitle] = useState('');
      return (                                                                                                                                                                               
         <section id="editor-view">  
           <h1>写文章</h1>                                                                                                                                           
           <input type="text" id="title-input" placeholder="文章标题" autoComplete="off"
            value={title} onChange={(e) => setTitle(e.target.value)} />
           <textarea id="editor" placeholder="写点什么..."
           value={content} onChange={(e) => setContent(e.target.value)}></textarea>                                                                                                                        
           <div id="preview">{content}</div>                                                                                                                                                           
           <div className="button-actions">                                                                                                                                                              
              <button onClick={() => onSave({ title, content })}>保存</button>                                                                                                                                
              <button onClick={onBack}>返回列表</button>                                                                                                                            
           </div>                                                                                                                                                                             
         </section>                                                                                                                                                                           
       );                                                                                                                                                                                     
      }                                                                                                                                        
     function PostCard({title,content}) { 
      return( 
      <div className="post-card">
        <h3>{title}</h3>
        <p>{content}</p>
        </div> );}                                                                                                                                     
     function App() {                                                                                                                                                                                                                     
                  const [view, setView] = useState('list');
                  const [posts, setPosts] = useState(JSON.parse(localStorage.getItem('posts')) || []);                                                                                                                                              
              return (                                                                                                                                                                   
         <div>                                                                                              
           
            {view === 'list' ? <BlogList onNewPost={()=>setView('editor')} posts={posts}/> 
            : <Editor onBack={()=>setView('list')}
            onSave={(post) => { const updatedPosts = [...posts, post]; setPosts(updatedPosts); localStorage.setItem('posts', JSON.stringify(updatedPosts)); setView('list'); }}
             />}                                                                                                           
         </div>                                                                                                                                                                              
       );                                                                                                                                                                      
                                                                                                                                                                                           
     }                         
     export default App;
