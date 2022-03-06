const http = require('http')
const path = require('path')
const express = require('express')
const app = express()
const httpServer = http.createServer(app)
const {Server: SocketServer} = require('socket.io')
const io = new SocketServer(httpServer)

app.use(express.static(path.join(__dirname, '../dist')))

httpServer.listen(3000, function () {
  console.log('\x1b[32m%s\x1b[0m', '服务启动成功')
})

// 每个房间对应的同步数据
const room2content = {}

io.on('connection', (socket) => {
  // socket鉴权
  const authorization = socket.handshake.auth?.token
  const userInfo = authorization ? userDict[authorization] : null
  if (userInfo) {
    userInfo.socket = socket
    socket.join(userInfo.room)
    socket.emit('welcome', `欢迎[${userInfo.name}]加入房间[${userInfo.room}]`)
    socket.broadcast.to(userInfo.room).emit('broadcast', `[${userInfo.name}]加入房间[${userInfo.room}]`)

    // 进入时初始化编辑器内容
    socket.emit('quill-sync', room2content[userInfo.room] || '')

    // 将收到的内容记录到服务器，并广播给其他用户
    socket.on('quill-sync', function (contentStr) {
      room2content[userInfo.room] = contentStr
      socket.broadcast.to(userInfo.room).emit('quill-sync', contentStr)
    })
    socket.on('disconnecting', function () {
      socket.broadcast.to(userInfo.room).emit('broadcast', `[${userInfo.name}]离开房间[${userInfo.room}]`)
      userInfo.room = null
      userInfo.socket = null
    })
  }
})

const userDict = {}

// 登录/注册
app.get('/join', function (req, res) {
  const authorization = req.headers.authorization
  const encodeAuthStr = authorization ? authorization.replace('Basic ', '') : ''
  // 进入登录/注册
  if (encodeAuthStr && encodeAuthStr !== 'logout') {
    const name = Buffer.from(encodeAuthStr, 'base64').toString().split(':')[0]
    let userInfo = userDict[authorization]
    // 有用户信息则更新房间号
    if (userInfo) {
      userInfo.room = req.query.room
    }
    // 没有用户信息就注册一个
    else {
      userInfo = {
        name: name,
        room: req.query.room
      }
      userDict[authorization] = userInfo
    }
    res.send(authorization)
  }
  // 请求Basic鉴权
  else {
    res.set({'WWW-Authenticate': 'Basic'})
    res.status(401)
    res.end()
  }
})

// 退出登录（用于清除 base authorization）
app.get('/logout', function (req, res) {
  res.status(401).end()
})