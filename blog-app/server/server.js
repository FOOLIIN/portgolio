const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.SECRET_KEY || 'my key is this'; // Replace
const {MongoClient,ObjectId} = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
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

app.post('/register',async(req,res)=>{
  try{
    const {username,password} = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码必填' });
    }
    const existing = await client.db('blog').collection('users').findOne({ username });
    if (existing) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const result = await client.db('blog').collection('users').insertOne({username,password:hashedPassword});
    res.status(201).json({message:'注册成功'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '注册失败' });
  }
});
app.post('/login',async(req,res)=>{
  try{
    const {username,password} = req.body;
    const user = await client.db('blog').collection('users').findOne({username});
    if(!user) return res.status(401).json({message:'用户不存在'});
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid) return res.status(401).json({message:'密码错误'});
    const token = jwt.sign({username},SECRET_KEY,{expiresIn:'7d'});
    res.json({token});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登录失败' });
  }
});
function auth(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader)return res.status(401).json({message:'未授权'});
  const token = authHeader.split(' ')[1];
  try{
    const decoded = jwt.verify(token,SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({message:'无效的token'});
  }
}
const ADMIN_USER = 'fool';
function requireAdmin(req,res,next){
  if(!req.user || req.user.username !== ADMIN_USER){
    return res.status(403).json({message:'无权限：仅作者可操作'});
  }
  next();
}
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

app.post('/posts', auth, requireAdmin, async (req, res) => {
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

    app.delete('/posts/:id', auth, requireAdmin, async (req, res) => {
      try{
        const result = await collection.deleteOne({_id: new ObjectId(req.params.id)});
        result.deletedCount ? res.sendStatus(204) : res.status(404).json({ message: 'Post not found' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: '删除失败' });
      }
    });

    app.put('/posts/:id', auth, requireAdmin, async (req, res) => {
      try {
        const result = await collection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { title: req.body.title, content: req.body.content } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: '文章不存在' });
        }
        res.json({ message: '更新成功' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: '更新失败' });
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
  