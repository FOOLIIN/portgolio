const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error('SECRET_KEY 未设置,拒绝启动(请在 .env 中配置)');
  process.exit(1);
}
const {MongoClient,ObjectId} = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');


  let posts = [
     { id: 1, title: '第一篇', content: 'hello backend', date: '2026-07-20' },
     { id: 2, title: '第二篇', content: 'world', date: '2026-07-21' },
  ];
   app.use(express.json());
   app.use(cookieParser());
   app.use(cors({
     origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
     credentials: true,
   }));

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
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === '1',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登录失败' });
  }
});
function auth(req,res,next){
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;
  if(!token)return res.status(401).json({message:'未授权'});
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
app.get('/me', auth, (req,res) => {
  res.json({ username: req.user.username });
});
app.post('/logout', (req,res) => {
  res.clearCookie('token');
  res.json({ message: '已登出' });
});
function validatePost(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!title || !content) return { error: '标题和内容必填' };
  if (title.length > 100) return { error: '标题过长(最多100字)' };
  if (content.length > 20000) return { error: '内容过长(最多20000字)' };
  return { title, content };
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
    const { title, content, error } = validatePost(req.body);
    if (error) return res.status(400).json({ message: error });
    const doc = {
      title,
      content,
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
        if (!collection) return res.status(503).json({ message: '数据库未就绪' });
        const result = await collection.deleteOne({_id: new ObjectId(req.params.id)});
        result.deletedCount ? res.sendStatus(204) : res.status(404).json({ message: 'Post not found' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: '删除失败' });
      }
    });

    app.put('/posts/:id', auth, requireAdmin, async (req, res) => {
      try {
        if (!collection) return res.status(503).json({ message: '数据库未就绪' });
        const { title, content, error } = validatePost(req.body);
        if (error) return res.status(400).json({ message: error });
        const result = await collection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { title, content } }
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
  