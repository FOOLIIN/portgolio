import { useState, useEffect } from 'react';

export default function Home() {                                                                                                                                                         
       const [repos, setRepos] = useState([]);                                                                                                                                                
       const [loading, setLoading] = useState(true);                                                                                                                                          
       const [error, setError] = useState('');

       useEffect(() => {                                                                                                                                                                      
         fetch('https://api.github.com/users/FOOLIIN/repos')
              .then((res) => {
                if (!res.ok) {
                  throw new Error('GitHub API 请求失败');
                }
                return res.json();
              })
              .then((data) => {
                setRepos(data);
                setLoading(false);
              })
              .catch((err) => {
                setError(err.message);
                setLoading(false);
              });
         }, []);
         
         return(
            <main>
              <p>我是一名普通的大学生</p>                                                                                                                                                        
           <p>这个站点是我用来学习和展示的</p>                                                                                                                                                
           <section id="projects">                                                                                                                                                            
             <h2>我的项目</h2>                                                                                                                                                                
             {loading && <div>加载中...</div>}                                                                                                                                                
             {error && <div style={{ color: 'red' }}>{error}</div>}                                                                                                                           
             <div id="repo-list">                                                                                                                                                             
               {repos.map((r) => (                                                                                                                                                            
                 <div className="repo-card" key={r.id}>                                                                                                                                       
                   <h3>                                                                                                                                                                       
                     <a href={r.html_url} target="_blank" rel="noopener">{r.name}</a>                                                                                                         
                   </h3>                                                                                                                                                                      
                   <p>{r.description || '暂无描述'}</p>                                                                                                                                       
                   <span>⭐ {r.stargazers_count}</span>                                                                                                                                       
                 </div>                                                                                                                                                                       
               ))}                                                                                                                                                                            
             </div>                                                                                                                                                                           
           </section>                                 
            </main>
         )
        }