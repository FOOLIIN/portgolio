const express = require('express');
const {MongoClient,ObjectId} = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
const app = express();
const cors = require('cors');


  let posts = [
     { id: 1, title: '第一篇', content: 'hello backend', date: '2026-07-20' },
     { id: 2, title: '第二篇', content: 'world', date: '2026-07-21' },
  ];
   app.use(express.json());
   app.use(cors());

// collection will be set after the Mongo client connects
let collection;

// GET /posts - try DB first, fallback to in-memory posts
app.get('/posts', async (req, res) => {
  try {
    if (!collection) return res.json(posts);
    const postsFromDB = await collection.find().toArray();
    res.json(postsFromDB.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      date: post.date,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const doc = {
      title: req.body.title,
      content: req.body.content,
      date: new Date().toISOString().split('T')[0],
    };
    if (!collection) {
      // fallback to in-memory storage
      const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
      const newPost = { id, ...doc };
      posts.push(newPost);
      return res.status(201).json(newPost);
    }
    const result = await collection.insertOne(doc);
    res.status(201).json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '保存失败' });
  }
});

    app.delete('/posts/:id', async (req, res) => {
      try{
        const result = await collection.deleteOne({_id: new ObjectId(req.params.id)});
        result.deletedCount ? res.sendStatus(204) : res.status(404).json({ message: 'Post not found' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: '删除失败' });
      }
    });

  async function start(){
    await client.connect();
    // initialize collection after connecting
    collection = client.db('blog').collection('posts');
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000')
    });
  }
   start().catch(console.error);
  