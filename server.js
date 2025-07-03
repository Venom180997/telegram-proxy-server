require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const FormData = require('form-data');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const upload = multer();
const app    = express();
app.use(cors());
app.use(express.json());
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;
app.use((req, res, next) => { console.log(`${req.method} ${req.path}`); next(); });
app.post('/send', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });
  try {
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id:CHAT_ID, text:message, parse_mode:'HTML'})
    });
    const j=await resp.json(); if(!j.ok) throw new Error(JSON.stringify(j));
    res.json({status:'ok'});
  } catch(e) { console.error(e); res.status(500).json({error:e.toString()}); }
});
app.post('/sendPhoto', upload.single('photo'), async (req, res) => {
  if(!req.file||!req.file.buffer) return res.status(400).json({error:'No photo'});
  try {
    const chatId=req.body.chat_id||CHAT_ID; const buffer=req.file.buffer;
    const form=new FormData(); form.append('chat_id',chatId);
    form.append('photo',buffer,{filename:'selfie.jpg',contentType:'image/jpeg'});
    const resp=await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method:'POST', headers:form.getHeaders(), body:form
    });
    const j=await resp.json(); if(!j.ok) throw new Error(JSON.stringify(j));
    res.json({status:'ok'});
  } catch(e){ console.error(e); res.status(500).json({error:e.toString()}); }
});
app.get('/', (req, res)=>res.send('Server running'));
const PORT=process.env.PORT||3000; app.listen(PORT,()=>console.log(`Listening ${PORT}`));
