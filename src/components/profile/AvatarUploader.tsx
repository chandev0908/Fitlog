'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAvatar } from '@/lib/actions/profile.actions'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

interface AvatarUploaderProps {
  userId: string
  currentUrl: string | null
  username: string
  size?: 'sm' | 'lg'
}

export function AvatarUploader({ userId, currentUrl, username, size = 'lg' }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar must be under 2MB')
      return
    }

    setUploading(true)
    setError(null)

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const result = await updateAvatar(path)
      if (result?.error) throw new Error(result.error)

      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentUrl) // revert preview on failure
    } finally {
      setUploading(false)
    }
  }

  const dim = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10'
  const iconSize = size === 'lg' ? 14 : 10

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn('relative group rounded-full overflow-hidden flex-shrink-0', dim)}
      >
        {preview ? (
          <Image
            src={preview}
            alt={username}
            fill
            className="object-cover"
            sizes={size === 'lg' ? '80px' : '40px'}
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            'bg-[hsl(var(--brand)/0.15)] text-brand font-display font-bold',
            size === 'lg' ? 'text-2xl' : 'text-sm'
          )}>
            {username[0]?.toUpperCase()}
          </div>
        )}

        {/* Hover overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/50 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          uploading && 'opacity-100'
        )}>
          {uploading
            ? <Loader2 size={iconSize} className="text-white animate-spin" />
            : <Camera size={iconSize} className="text-white" />
          }
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {size === 'lg' && (
        <p className="text-xs text-muted">Click to change · Max 2MB</p>
      )}
    </div>
  )
}