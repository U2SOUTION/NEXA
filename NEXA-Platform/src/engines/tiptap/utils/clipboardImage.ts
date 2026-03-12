// 클립보드의 image item을 File 객체로 변환
export async function convertClipboardImageToFile(imageItem: DataTransferItem) {
  const blob = imageItem.getAsFile()
  if (!blob) {
    throw new Error('클립보드에서 이미지를 가져올 수 없습니다.')
  }

  const mimeType = imageItem.type // e.g. image/png
  const mimeParts = mimeType.split('/')
  if (mimeParts.length !== 2 || mimeParts[0] !== 'image') {
    throw new Error('지원하지 않는 이미지 형식입니다.')
  }

  const extensionMap = {
    jpeg: 'jpg',
    png: 'png',
    gif: 'gif',
    webp: 'webp',
    bmp: 'bmp',
    svg: 'svg',
  }
  const ext = mimeParts[1] as keyof typeof extensionMap
  const extension = extensionMap[ext] ?? mimeParts[1]
  const filename = `image.${extension}`

  return new File([blob], filename, { type: mimeType })
}

export default convertClipboardImageToFile
