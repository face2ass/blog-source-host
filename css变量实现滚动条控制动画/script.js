(function () {
  const $body = document.body
  const $scroller = document.querySelector('#scroller')
  const $scrollItem = document.querySelector('#scroll-item')
  const contentHeight = $scrollItem.clientHeight
  const $indicators = document.querySelectorAll('.indicator')

  const animeList = [
    {
      ele: document.querySelector('#hair-1-1'),
      inEnter: 0,
      inLeave: 0.2,
      outEnter: 0.25,
      outLeave: 0.35,
    },
    {
      ele: document.querySelector('#hair-1-2'),
      inEnter: 0,
      inLeave: 0.2,
      outEnter: 0.25,
      outLeave: 0.35,
    },
    {
      ele: document.querySelector('#hair-1-3'),
      inEnter: 0,
      inLeave: 0.2,
      outEnter: 0.25,
      outLeave: 0.35,
    },
    {
      ele: document.querySelector('#hair-2'),
      inEnter: 0.3,
      inLeave: 0.5,
      outEnter: 0.55,
      outLeave: 0.65,
    },
    {
      ele: document.querySelector('#hair-3'),
      inEnter: 0.6,
      inLeave: 0.8,
      outEnter: 0.85,
      outLeave: 1,
    },
  ]
  const scrollBarLeftHeight = window.innerHeight * (1 - window.innerHeight / $scrollItem.clientHeight)
  $indicators[0].style.top = 0
  $indicators[1].style.top = (0.3 * scrollBarLeftHeight) + 'px'
  $indicators[2].style.top = (0.6 * scrollBarLeftHeight) + 'px'

  $scroller.addEventListener('scroll', (e) => {
    console.log($scroller.scrollTop)
    const progress = $scroller.scrollTop / 4000
    for (const { ele, inEnter, inLeave, outEnter, outLeave } of animeList) {
      if (progress >= outLeave) {
        ele.className = 'out-leave'
        ele.style.setProperty('--progress', 0)
      }
      else if (progress >= outEnter) {
        ele.className = 'out-enter'
        ele.style.setProperty('--progress', (progress - outEnter) / (outLeave - outEnter))
      }
      else if (progress >= inLeave) {
        ele.className = 'in-leave'
        ele.style.setProperty('--progress', (progress - inLeave) / (outEnter - inLeave))
      }
      else if (progress >= inEnter) {
        ele.className = 'in-enter'
        ele.style.setProperty('--progress', (progress - inEnter) / (inLeave - inEnter))
      }
      else {
        ele.className = ''
        ele.style.setProperty('--progress', 1)
      }
    }
  })
})()