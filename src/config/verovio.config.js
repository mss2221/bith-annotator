export const vrvPresets = {
  fullScore: {
    scale: 30,
    breaks: 'none',
    openControlEvents: true,
    svgBoundingBoxes: true,
    svgRemoveXlink: true,
    svgHtml5: true,
    header: 'none',
    footer: 'none',
    mnumInterval: 5
  },
  preview: {
    scale: 20,
    breaks: 'auto',
    openControlEvents: true,
    svgBoundingBoxes: true,
    svgRemoveXlink: true,
    header: 'none',
    footer: 'none',
    pageWidth: 1600,
    pageHeight: 600
  },
  annotationPreview: {
    scale: 45,
    breaks: 'none',
    openControlEvents: true,
    svgBoundingBoxes: true,
    svgRemoveXlink: true,
    svgHtml5: true,
    header: 'none',
    footer: 'none',
    mnumInterval: 1
  }
}

export const vrvSelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'beam',
  'artic',
  'accid',
  'clef',
  'slur',
  'dynam',
  'dir',
  'staff',
  'measure'
]
