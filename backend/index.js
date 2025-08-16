const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')
const swaggerUi = require('swagger-ui-express')
const openapi = require('./openapi.json')
require('dotenv').config()


const http = require('http')
const { Server } = require('socket.io')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: false }))
app.use(express.json())

const DB_PATH = path.join(__dirname, 'db.json')

async function ensureDB() {
  try {
    await fs.access(DB_PATH)
  } catch (e) {
    const initial = {
      ownerAccessCodes: {}, 
      employeeAccessCodes: {}, 
      employees: {}, 
      chats: {}, 
    }
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf8')
  }
}

async function readDB() {
  await ensureDB()
  const raw = await fs.readFile(DB_PATH, 'utf8')
  return JSON.parse(raw)
}

async function writeDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}


let transporter = null
let mailFrom = null

async function initMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER
  } else {
    
    const account = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    })
    mailFrom = account.user
    console.log('Using Ethereal test SMTP account. Login URL will be logged after sending emails.')
  }
}

async function sendCodeEmail(to, code) {
  if (!transporter) await initMailer()
  const info = await transporter.sendMail({
    from: mailFrom,
    to,
    subject: 'Your access code',
    text: `Your access code is: ${code}`,
    html: `<p>Your access code is: <b>${code}</b></p>`
  })
  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
  }
}


app.post('/owner/CreateNewAccessCode', async (req, res) => {
  try {
    const { phoneNumber } = req.body || {}
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' })
    const code = generateAccessCode()
    const db = await readDB()
    db.ownerAccessCodes[phoneNumber] = code
    await writeDB(db)
    res.json({ accessCode: code })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/owner/ValidateAccessCode', async (req, res) => {
  try {
    const { accessCode, phoneNumber } = req.body || {}
    if (!accessCode || !phoneNumber) return res.status(400).json({ success: false, error: 'accessCode and phoneNumber are required' })
    const db = await readDB()
    const saved = db.ownerAccessCodes[phoneNumber]
    if (saved && saved === accessCode) {
      db.ownerAccessCodes[phoneNumber] = '' 
      await writeDB(db)
      return res.json({ success: true })
    }
    return res.status(401).json({ success: false, error: 'Invalid code' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})


app.post('/owner/GetEmployee', async (req, res) => {
  try {
    const { employeeId } = req.body || {}
    if (!employeeId) return res.status(400).json({ error: 'employeeId is required' })
    const db = await readDB()
    const emp = db.employees[employeeId]
    if (!emp) return res.status(404).json({ error: 'Employee not found' })
    res.json(emp)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/owner/CreateEmployee', async (req, res) => {
  try {
    const { name, email, role, status, phone, address } = req.body || {}
    console.log('req.body', req.body);
    if (!name || !email || !role || !status) return res.status(400).json({ success: false, error: 'name, email, role, status are required' })
    const normalizedStatus = String(status).toLowerCase()
    if (!['active', 'deactive'].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, error: "status must be 'active' or 'deactive'" })
    }
    const db = await readDB()
    const id = uuidv4()
    const employee = {
      id,
      name,
      email,
      phone,
      address,
      role,
      status: normalizedStatus,
      createdAt: new Date().toISOString()
    }
    db.employees[id] = employee
    await writeDB(db)
    res.json({ success: true, employeeId: id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

app.post('/owner/DeleteEmployee', async (req, res) => {
  try {
    const { employeeId } = req.body || {}
    if (!employeeId) return res.status(400).json({ success: false, error: 'employeeId is required' })
    const db = await readDB()
    if (db.employees[employeeId]) {
      delete db.employees[employeeId]
      await writeDB(db)
      return res.json({ success: true })
    }
    res.status(404).json({ success: false, error: 'Employee not found' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})


app.get('/owner/ListEmployees', async (req, res) => {
  try {
    const db = await readDB()
    const list = Object.values(db.employees || {})
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/owner/UpdateEmployee', async (req, res) => {
  try {
    const { employeeId, name, email, phone, address, role, status } = req.body || {}
    if (!employeeId) return res.status(400).json({ success: false, error: 'employeeId is required' })
    const db = await readDB()
    const existing = db.employees[employeeId]
    if (!existing) return res.status(404).json({ success: false, error: 'Employee not found' })

    let nextStatus = existing.status
    if (typeof status !== 'undefined') {
      const normalized = String(status).toLowerCase()
      if (!['active', 'deactive'].includes(normalized)) {
        return res.status(400).json({ success: false, error: "status must be 'active' or 'deactive'" })
      }
      nextStatus = normalized
    }

    db.employees[employeeId] = {
      ...existing,
      name: typeof name !== 'undefined' ? name : existing.name,
      email: typeof email !== 'undefined' ? email : existing.email,
      phone: typeof phone !== 'undefined' ? phone : (existing.phone || ''),
      address: typeof address !== 'undefined' ? address : (existing.address || ''),
      role: typeof role !== 'undefined' ? role : existing.role,
      status: nextStatus,
    }
    await writeDB(db)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})


app.post('/employee/LoginEmail', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'email is required' })
    const code = generateAccessCode()
    const db = await readDB()
    db.employeeAccessCodes[email] = code
    await writeDB(db)

    try {
      await sendCodeEmail(email, code)
    } catch (mailErr) {
      console.error('Email send failed:', mailErr)
   
    }

    res.json({ accessCode: code })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.post('/employee/ValidateAccessCode', async (req, res) => {
  try {
    const { accessCode, email } = req.body || {}
    if (!accessCode || !email) return res.status(400).json({ success: false, error: 'accessCode and email are required' })
    const db = await readDB()
    const saved = db.employeeAccessCodes[email]
    if (saved && saved === accessCode) {
      db.employeeAccessCodes[email] = '' 
      await writeDB(db)
      return res.json({ success: true })
    }
    return res.status(401).json({ success: false, error: 'Invalid code' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})


app.get('/owner/ChatHistory', async (req, res) => {
  try {
    const employeeId = String(req.query.employeeId || '')
    if (!employeeId) return res.status(400).json({ error: 'employeeId is required' })
    const db = await readDB()
    const history = (db.chats && db.chats[employeeId]) || []
    res.json(history)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.get('/health', (_, res) => res.json({ ok: true }))

app.get('/docs.json', (_, res) => res.json(openapi))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi))


const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  
  socket.on('join', ({ employeeId, role }) => {
    if (!employeeId) return
    socket.join(employeeId)
    socket.data = { employeeId, role }
  })

  
  socket.on('chat:message', async (payload) => {
    try {
      const { employeeId, from, text } = payload || {}
      if (!employeeId || !text || !from) return

      const db = await readDB()
      if (!db.chats) db.chats = {}
      if (!db.chats[employeeId]) db.chats[employeeId] = []

      const message = { id: uuidv4(), from, text: String(text), at: new Date().toISOString() }
      db.chats[employeeId].push(message)
      await writeDB(db)

      io.to(employeeId).emit('chat:message', { employeeId, ...message })
    } catch (err) {
      console.error('Failed to persist chat message', err)
    }
  })

  socket.on('disconnect', () => {
    
  })
})

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
