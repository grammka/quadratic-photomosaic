import merge from 'deepmerge'


function QuadraticPhotoMosaic(container, imageUrls, opts) {
  const Data = {
    container: null,
    images: [],
    thumbs: [],
    maxW: null,
    maxH: null,
  }

  const options = merge({
    editable: false,
    sizes: {
      gutter: 5,
      containerMaxWidth: null,
      containerMaxHeight: 0.8,
      firstThumbMaxWidth: 0.666,
      firstThumbMaxHeight: 0.666,
    }
  }, opts || {})


  function size (value) {
    return `${ value }px`
  }


  function renderThumb ({ img, width, height }, isLastChild) {
    const thumb = document.createElement('div')

    thumb.style.width  = size(width - options.sizes.gutter)
    thumb.style.height = size(height - options.sizes.gutter)

    thumb.style.backgroundImage      = `url(${ img.src })`
    thumb.style.backgroundSize       = 'cover'
    thumb.style.backgroundPosition   = 'center'

    thumb.style.marginTop  = size(options.sizes.gutter)
    thumb.style.marginLeft = size(options.sizes.gutter)

    thumb.style.position   = 'relative'
    thumb.style.overflow   = 'hidden'
    thumb.style.float      = 'left'

    if (isLastChild && imageUrls.length > 5) {
      const moreButton = document.createElement('div')

      moreButton.style.width  = size(width - options.sizes.gutter)
      moreButton.style.height = size(height - options.sizes.gutter)

      moreButton.style.backgroundColor = 'rgba(0,0,0, 0.35)'
      moreButton.style.transition = 'all 0.13s linear'
      moreButton.style.cursor = 'pointer'

      moreButton.style.lineHeight = size(height - options.sizes.gutter)
      moreButton.style.textAlign  = 'center'
      moreButton.style.fontSize   = size(36)
      moreButton.style.color      = '#fff'
      moreButton.style.textShadow = '#000 0 1px 2px'

      moreButton.innerText = `+${ imageUrls.length - 5 }`

      moreButton.addEventListener('mouseenter', () => {
        moreButton.style.backgroundColor  = 'rgba(0,0,0, 0.4)'
      })

      moreButton.addEventListener('mouseleave', () => {
        moreButton.style.backgroundColor  = 'rgba(0,0,0, 0.35)'
      })

      moreButton.addEventListener('click', () => {
        moreButton.style.backgroundColor  = 'rgba(0,0,0, 0.6)'
      })

      thumb.appendChild(moreButton)
    }

    return thumb
  }

  function renderThumbs () {
    const subContainer = document.createElement('div')

    subContainer.style.marginTop  = size(-1 * options.sizes.gutter)
    subContainer.style.marginLeft = size(-1 * options.sizes.gutter)
    subContainer.style.overflow = 'hidden'


  	Data.thumbs.forEach((thumb, index) => {
      subContainer.appendChild(renderThumb(thumb, index == Data.thumbs.length - 1))
    })

    Data.container.elm.style.overflow = 'hidden'

    Data.container.elm.appendChild(subContainer)
  }

  function processThumb (img, sizes) {
    const width   = Data.containerWidth * sizes[0]
    const height  = sizes[1] == 'auto' ? width : Data.containerWidth * sizes[1]

  	return {
      img,
      width,
      height,
    }
  }

  function processThumbs () {
    Data.containerWidth = Data.container.width + options.sizes.gutter

    const count         = Data.images.length
    const combination   = Data.images.reduce((res, curr) => res += curr.orient, '')

    // Number - calculate from container width
    // 'auto' - equals to calculated width
    let sizes = []

    if (count == 1) {
      sizes = [ [1, 1] ]
    }

    else if (count == 2) {
      if (combination == 'll') {
        sizes = [ [1, .5], [1, .5] ]
      } else {
        sizes = [ [.5, 1], [.5, 1] ]
      }
    }

    else if (count == 3) {
      if (/^p/.test(combination)) {
        sizes = [ [.5, 1], [.5, .5], [.5, .5] ]
      } else {
        sizes = [ [1, .5], [.5, .5], [.5, .5] ]
      }
    }

    else if (count == 4) {
      if (/^l/.test(combination)) {
        sizes = [ [1, .5], [.333, 'auto'], [.333, 'auto'], [.333, 'auto'] ]
      } else {
        sizes = [ [.5, .5], [.5, .5], [.5, .5], [.5, .5] ]
      }
    }

    else if (count == 5) {
      sizes = [ [.5, .5], [.5, .5], [.333, 'auto'], [.333, 'auto'], [.333, 'auto'] ]

      // TODO write this...
      // if (/^l/.test(combination) || /^.l/.test(combination)) {
      //   sizes = [ [.5, .5], [.5, .5], [.333, 'auto'], [.333, 'auto'], [.333, 'auto'] ]
      // } else {
      //
      // }
    }

    Data.thumbs = Data.images.map((img, index) => processThumb(img, sizes[index]))
  }

  function setImageIndexes () {
    Data.images.map((img, index) => {
      img.index = index
    })
  }

  async function loadImages () {
    const loadedImages = await Promise.all(imageUrls.slice(0,5).map((url) => {
      return new Promise((fulfill) => {
        const img = new Image()

        img.onload = () => {
          const params = {}

          params.elm      = img
          params.src      = url
          params.width    = img.width
          params.height   = img.height
          params.ratio    = img.width / img.height
          params.orient   = params.ratio > 1.2 ? 'l' /* landscape */ : params.ratio < 0.8 ? 'p' /* portrait */ : 'q' /* quadratic */

          fulfill(params)
        }

        img.src = url
      })
    }))

    Data.images = loadedImages
  }

  function setContainer () {
    const containerElm = typeof container == 'string' ? document.getElementById(container) : container

    Data.container = {
      elm: containerElm,
      width: containerElm.offsetWidth,
    }
  }

  async function init () {
    await loadImages(imageUrls)
    setContainer()
    setImageIndexes()
    processThumbs()
    renderThumbs()
  }

  init()
}


export default QuadraticPhotoMosaic
