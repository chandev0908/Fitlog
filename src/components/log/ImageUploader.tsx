'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

interface ImageUploaderProps {
  logId: string
  userId: string
  logDate: string
  existingImages: {
    id: string
    storage_path: string
    caption: string | null
    publicUrl: string
  }[]
  onUploadComplete: () => void
}

export function ImageUploader({
  logId, userId, logDate, existingImages, onUploadComplete
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setError(null)

    try {
      for (const file of acceptedFiles) {
        // Enforce 5MB limit client-side
        if (file.size > 5 * 1024 * 1024) {
          setError('Images must be under 5MB')
          continue
        }

        const ext = file.name.split('.').pop()
        // Path: userId/logId/timestamp.ext — userId folder enforces storage RLS
        const path = `${userId}/${logId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('log-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        // Save reference in DB
        const { error: dbError } = await supabase
          .from('log_images')
          .insert({ log_id: logId, user_id: userId, storage_path: path })

        if (dbError) throw dbError
      }

      onUploadComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [logId, userId, supabase, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 4,
    disabled: uploading,
  })

  const handleDelete = async (imageId: string, storagePath: string) => {
    setDeletingId(imageId)
    try {
      await supabase.storage.from('log-images').remove([storagePath])
      await supabase.from('log_images').delete().eq('id', imageId)
      onUploadComplete()
    } catch {
      setError('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <span className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
        Photos
      </span>

      {/* Existing images grid */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group aspect-square bg-surface border border-base overflow-hidden">
              <Image
                src={img.publicUrl}
                alt={img.caption || 'Log image'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <button
                onClick={() => handleDelete(img.id, img.storage_path)}
                disabled={deletingId === img.id}
                className={cn(
                  'absolute top-1.5 right-1.5 w-6 h-6 rounded-full',
                  'bg-black/70 text-white flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-red-600'
                )}
              >
                {deletingId === img.id
                  ? <Loader2 size={10} className="animate-spin" />
                  : <X size={10} />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {existingImages.length < 4 && (
        <div
          {...getRootProps()}
          className={cn(
            'border border-dashed p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-[hsl(var(--brand-glow))] bg-[hsl(var(--brand)/0.06)]'
              : 'border-base hover:border-[hsl(var(--foreground)/0.3)] bg-surface',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading
              ? <Loader2 size={20} className="animate-spin text-muted" />
              : <ImagePlus size={20} className="text-muted" />
            }
            <p className="text-xs text-muted font-display">
              {uploading
                ? 'Uploading...'
                : isDragActive
                ? 'Drop to upload'
                : 'Drop images or click to browse'
              }
            </p>
            <p className="text-xs text-muted opacity-60">JPG, PNG, WebP · Max 5MB · Up to 4 photos</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  )
}