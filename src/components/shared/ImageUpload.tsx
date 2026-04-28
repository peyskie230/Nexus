'use client'

import { useRef, useState } from 'react'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload'

interface ImageUploadProps {
  userId: string
  folder: 'posts' | 'messages' | 'avatars'
  onUpload: (url: string) => void
  onRemove?: () => void
  previewUrl?: string | null
  compact?: boolean
}

export function ImageUpload({
  userId,
  folder,
  onUpload,
  onRemove,
  previewUrl,
  compact = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const url = await uploadImage(file, folder, userId)
      if (url) onUpload(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={compact ? 'flex-shrink-0' : 'w-full'}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="relative mb-3 inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 rounded-xl object-cover border border-slate-200"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Upload button */}
      {!previewUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50 ${
            compact ? 'p-1.5' : 'px-3 py-2 rounded-xl hover:bg-slate-50 text-sm'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          {!compact && (uploading ? 'Uploading...' : 'Add image')}
        </button>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
