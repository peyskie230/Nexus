import { createClient } from '@/lib/supabase'

export async function uploadImage(
  file: File,
  folder: 'posts' | 'messages' | 'avatars',
  userId: string
): Promise<string | null> {
  const supabase = createClient()

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, GIF and WEBP images are allowed')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be smaller than 5MB')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
