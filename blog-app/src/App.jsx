import { useState } from 'react';
function BlogList({onNewPost}) {  
  return (                                                                                                                                                                               
         <section id="list-view">                                                                                                                                                             
           <h1>博客</h1>                                                                                                                                                                      
           <button onClick={onNewPost}>写新文章</button>                                                                                                          
           <div id="post-list"></div>                                                                                                                                                               
         </section>                                                                                                                                                                           
       );                                                                                                                                                                                     
 }                                                                                                                               
     function Editor({onBack})   { 
      return (                                                                                                                                                                               
         <section id="editor-view">  
           <h1>写文章</h1>                                                                                                                                           
           <input type="text" id="title-input" placeholder="文章标题" autoComplete="off" />                                                                                                   
           <textarea id="editor" placeholder="写点什么..."></textarea>                                                                                                                        
           <div id="preview"></div>                                                                                                                                                           
           <div className="button-actions">                                                                                                                                                              
              <button onClick={onBack}>保存</button>                                                                                                                                
              <button onClick={onBack}>返回列表</button>                                                                                                                            
           </div>                                                                                                                                                                             
         </section>                                                                                                                                                                           
       );                                                                                                                                                                                     
      }                                                                                                                                        
     function PostCard({onback}) { return <div>卡片</div>; }                                                                                                                                     
     function App() {                                                                                                                                                                                                                     
                  const [view, setView] = useState('list');                                                                                                                                              
              return (                                                                                                                                                                   
         <div>                                                                                              
           
            {view === 'list' ? <BlogList onNewPost={()=>setView('editor')}/> 
            : <Editor onBack={()=>setView('list')}/>}                                                                                                           
         </div>                                                                                                                                                                              
       );                                                                                                                                                                      
                                                                                                                                                                                           
     }                         
     export default App;
