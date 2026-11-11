const LEGACY_DEFAULT_ADMIN_NAMES = new Set([
  '',
  'ahmad ali',
  'ahmed ali',
  'mrs. samina khurram',
  'beaconhouse school admin',
  'school principal',
  'institute admin',
  'unknown user'
])

/**
 * Returns the school admin display name, defaulting to 'Unknown User' until customized.
 */
export const getAdminDisplayName = (user) => {
  if (!user) return 'Unknown User'
  if (user.hasCustomName && user.name?.trim()) {
    return user.name.trim()
  }
  const raw = String(user.name || '').trim()
  if (!raw || LEGACY_DEFAULT_ADMIN_NAMES.has(raw.toLowerCase())) {
    return 'Unknown User'
  }
  return raw
}

/**
 * Compresses an uploaded image File into a lightweight base64 data URL (<= 256px)
 * suitable for persistent localStorage profile storage.
 */
export const compressAvatarImage = (file, maxSize = 256) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image format.'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
