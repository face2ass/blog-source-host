import Quill from 'quill'
import './quill.snow.css'
import './main.scss'
import io from 'socket.io-client'

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{'header': [1, 2, 3, 4, 5, 6, false]}],
  [{'list': 'ordered'}, {'list': 'bullet'}],
  [{'indent': '-1'}, {'indent': '+1'}],
  [{'size': ['small', false, 'large', 'huge']}],
  [{'color': []}, {'background': []}],
  [{'font': []}],
  [{'align': []}],
  ['clean'],
]

const $editor = document.querySelector('#editor')
const $statusBar = document.getElementById('status-bar')
const $btnJoin = document.getElementById('btn-join')
const $numRoom = document.getElementById('num-room')
const $btnLeave = document.getElementById('btn-leave')
const quill = new Quill($editor, {
  modules: {
    toolbar,
  },
  theme: 'snow',
})
let socket = null
// 监听编辑器内容更新，发送到服务器
quill.on('text-change', function (delta, oldDelta, source) {
  if (source === 'user') {
    const content = quill.getContents()
    socket && socket.emit('quill-sync', JSON.stringify(content))
  }
})

// 加入房间
$btnJoin.onclick = async function () {
  const room = prompt('请输入你要进入的房间：')
  if (room) {
    // 进入 basic 校验
    const response = await fetch(`/join?room=${room}`)
    const token = await response.text()

    $statusBar.classList.add('joined')
    $numRoom.innerHTML = room

    if (!socket) {
      socket = io({auth: {token}})
    }
    socket.on('welcome', function (word) {
      console.log('welcome：', word)
    })
    socket.on('broadcast', function (word) {
      console.log('broadcast：', word)
    })
    // 接收远程内容同步
    socket.on('quill-sync', function (contentStr) {
      contentStr && quill.setContents(JSON.parse(contentStr))
    })
  }
}

// 离开房间
$btnLeave.onclick = function () {
  socket.disconnect()
  socket = null
  fetch('logout')
  $statusBar.classList.remove('joined')
}