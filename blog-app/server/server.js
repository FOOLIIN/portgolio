const express = require('express');
  const app = express();
  const cors = require('cors');
  let posts = [
     { id: 1, title: '第一篇', content: 'hello backend', date: '2026-07-20' },
     { id: 2, title: '第二篇', content: 'world', date: '2026-07-21' },
  ];
   app.use(express.json());
   app.use(cors());
   app.get('/', (req, res) => {
     res.send('hello from my server');
   });
  
    app.get('/posts', (req, res) => {
      res.json(posts);
    });

    app.post('/posts', (req, res) => {
      const newPost = {
         id: Date.now(),
         title: req.body.title,
         content: req.body.content,
         date: new Date().toISOString().split('T')[0],
      };
      posts.push(newPost);
      res.status(201).json(newPost);
    });

    app.delete('/posts/:id', (req, res) => {
      const postId = parseInt(req.params.id);
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        res.sendStatus(204);
      }
      else {
        res.sendStatus(404).json({ message: 'Post not found' });
      }
    });
  app.listen(3000, () => { 
     console.log('server running at http://localhost:3000');
  });