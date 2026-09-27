"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'
import { FullscreenLoader } from '@/components/ui/FullscreenLoader'
import Image from 'next/image'

export type GalleryRecord = {
  id: string
  url: string
  created_at: string
}

export function GalleryTable() {
  const supabase = createClient()
  const [images, setImages] = useState<GalleryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gallery:', error)
    } else {
      setImages(data || [])
    }
    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Filter to allow pictures only
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      alert('Some files were ignored because only image files are allowed!')
    }
    
    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    setLoadingMessage(`Uploading ${validFiles.length} image(s)...`)
    let uploadedCount = 0
    
    try {
      let i = 0;
      for (const file of validFiles) {
        i++;
        setLoadingMessage(`Uploading image ${i} of ${validFiles.length}...`);

        // Fetch a fresh token per file — ImageKit tokens are single-use
        const authRes = await fetch("/api/imagekit-auth");
        if (!authRes.ok) {
          throw new Error("Failed to get ImageKit upload authentication");
        }
        const authParams = await authRes.json();
        
        // Sanitize filename to prevent ImageKit API crashes
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileName", safeFileName)
        formData.append("folder", '/gallery')
        formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
        formData.append("signature", authParams.signature)
        formData.append("expire", authParams.expire.toString())
        formData.append("token", authParams.token)
        formData.append("useUniqueFileName", "true")

        const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          let errorMsg = `Upload failed for ${file.name}`;
          try {
            const errData = await response.json();
            if (errData.message) errorMsg = `${errorMsg}: ${errData.message}`;
          } catch {}
          
          alert(errorMsg);
          console.error(errorMsg);
          continue;
        }

        const data = await response.json()
        
        // Save to database
        const { error: dbError } = await supabase
          .from('gallery')
          .insert({ url: data.url })
          
        if (dbError) {
          const errMsg = `Database insert failed for ${file.name}: ${dbError.message}`;
          console.error(errMsg, dbError);
          alert(errMsg);
          continue;
        }
        
        uploadedCount++
      }
      
      if (uploadedCount > 0) {
        await fetchImages()
      } else {
        alert('No images were successfully uploaded.')
      }
    } catch (error: any) {
      alert(`Error uploading image(s): ` + error.message)
    } finally {
      setLoadingMessage(null)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    // Optimistic update — remove from UI instantly
    const itemToDelete = images.find(img => img.id === id);
    setImages(prev => prev.filter(img => img.id !== id));
    
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)
        
      if (error) throw error

      if (itemToDelete?.url) {
        fetch('/api/imagekit-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: itemToDelete.url })
        }).catch(err => console.error('Failed to delete from ImageKit:', err));
      }
    } catch (error: any) {
      // Rollback on failure
      if (itemToDelete) setImages(prev => [itemToDelete, ...prev]);
      alert('Error deleting image: ' + error.message)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      {loadingMessage && <FullscreenLoader message={loadingMessage} />}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-heading">Gallery Images</h2>
        <label className="cursor-pointer bg-accent hover:bg-accent-warm px-4 py-2 rounded-lg text-background text-sm font-bold flex items-center transition-colors">
          + Add New Image
          <input 
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
            <Image 
              src={img.url} 
              alt="Gallery image" 
              fill 
              className="object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button 
                onClick={() => handleDelete(img.id)}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-secondary bg-surface/30 rounded-xl border border-dashed border-border">
            No images in the gallery yet. Click "Add New Image" to upload one.
          </div>
        )}
      </div>
    </div>
  )
}
