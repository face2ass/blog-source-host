let offscreen
let ctx

const colors = [
  '#a09d1d',
  '#84b826',
  '#168a30',
  '#155fbf',
  '#40148c',
  '#5f168b',
  '#93148c',
  '#970c0d',
  '#af2e15',
  '#ab4913',
  '#a45a12',
  '#514e0e',
]
let cvsWidth, cvsHeight
let particleSize
let particleSpacing
let particleList
let wordLeft
let wordTop
let generating

addEventListener('message', function (e) {

  if (e.data.signal === 'init') {
    cvsWidth = e.data.width
    cvsHeight = e.data.height
    particleSpacing = e.data.particleSpacing
    offscreen = new OffscreenCanvas(cvsWidth, cvsHeight)
    ctx = offscreen.getContext('2d')
    postMessage({ signal: 'initialized' })
  }
  else if (e.data.signal === 'generate') {
    generate(e.data.word, e.data.fontSize)
  }
}, false)

function generate (word, fontSize) {
  generating = true
  offscreen = new OffscreenCanvas(cvsWidth, cvsHeight)
  // 自动计算字体大小
  if (fontSize === 'auto') {
    fontSize = cvsWidth / word.length
    fontSize = Math.min(cvsHeight * 0.8, fontSize)
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  ctx.font = 'bold ' + fontSize + 'px Tahoma'
  const wordWidth = ctx.measureText(word).width
  particleSize = Math.max(wordWidth / 140, 5)
  wordLeft = (cvsWidth - wordWidth) / 2
  wordTop = cvsHeight / 2
  ctx.clearRect(0, 0, cvsWidth, cvsHeight)
  ctx.fillText(word, (cvsWidth - ctx.measureText(word).width) / 2, cvsHeight / 2) // 轻微调整绘制字符位置

  particleList = []
  let imageData = ctx.getImageData(0, 0, cvsWidth, cvsHeight).data
  let i, j // 采样的坐标
  const sampleOffset = Math.floor(particleSize + particleSpacing)
  for (i = 0; i < cvsWidth; i += sampleOffset) {
    for (j = 0; j < cvsHeight; j += sampleOffset) {
      // 若采样点alpha通道的值不是0
      if (imageData[4 * (j * cvsWidth + i) + 3]) {
        particleList.push({
          from: { x: cvsWidth * Math.random(), y: cvsHeight * Math.random() }, // 动画随机起始位置
          to: { x: i, y: j },
          color: colors[Math.floor(Math.random() * colors.length)], // 随机选取颜色
          speed: 0.08 + 0.04 * Math.random(),
          size: 0, // 初始大小为0
          done: false, // 是否完成动画
        })
      }
    }
  }
  postMessage({ signal: 'generated', particleList, particleSize })
  generating = false
}