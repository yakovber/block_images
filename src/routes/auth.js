const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { registerSchema, loginSchema } = require('../utils/validators');
const {hashedPassword , comparePassword} = require('../utils/hashedPassword');
const { JWT_SECRET , ADMIN_CODE_HASH} = require('../../config/default');

router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, adminCode } = req.body;
  const  password = hashedPassword(req.body.password);
  
  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) return res.status(400).send('כבר רשום');

    const isAdmin = adminCode && await bcrypt.compare(adminCode, ADMIN_CODE_HASH);
   console.log(password);
    await db('users').insert({ email, password, isadmin: isAdmin });
    res.send('נרשמת בהצלחה');
  } catch (err) {
    console.error(err);
    res.status(500).send('שגיאת שרת');
  }
});

router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).send('קלט לא תקין');

  const  {email , password} = req.body;
  
console.log(email);
  console.log(password);
  try {
    const user = await db('users').where({ email}).first();
    if (!user) return res.status(401).send('���������� ������������');

    // ���������� isAdmin ��-token
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return res.status(401).send('סיסמא לא נכונה');
    // אם הסיסמא נכונה, ניצור את ה-token
    const token = jwt.sign(
      { email, isAdmin: user.isadmin }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      isAdmin: user.isadmin  // שליחת המידע גם בתגובה
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('שגיאת שרת');
  }
});
module.exports = router;