import { useState, useEffect, useRef } from 'react'
import { Monitor, Check, Image as ImageIcon, Upload, Trash2, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getWallpapers, setWallpaper, uploadWallpaper, deleteWallpaper } from '@/api/wallpapers'
import { useToast } from '@/hooks/useToast'

interface Wallpaper {
  _id: string
  filename: string
  path: string
  thumbnail: string
  isActive: boolean
}

export function WallpaperSetter() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadWallpapers()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const cols = 4
        const newIndex = Math.min(selectedIndex + cols, wallpapers.length - 1)
        setSelectedIndex(newIndex)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const cols = 4
        const newIndex = Math.max(selectedIndex - cols, 0)
        setSelectedIndex(newIndex)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, wallpapers.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (wallpapers[selectedIndex]) {
          handleSetWallpaper(wallpapers[selectedIndex])
        }
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 12, wallpapers.length - 1))
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 12, 0))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setSelectedIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setSelectedIndex(wallpapers.length - 1)
      } else if (e.key === 'Delete') {
        e.preventDefault()
        if (wallpapers[selectedIndex] && !wallpapers[selectedIndex].isActive) {
          handleDeleteWallpaper(wallpapers[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [wallpapers, selectedIndex])

  const loadWallpapers = async () => {
    try {
      console.log('Loading wallpapers...')
      const data = await getWallpapers()
      setWallpapers(data.wallpapers)

      // Find and set the active wallpaper as selected
      const activeIndex = data.wallpapers.findIndex((w: Wallpaper) => w.isActive)
      if (activeIndex !== -1) {
        setSelectedIndex(activeIndex)
      }

      setLoading(false)
    } catch (error: any) {
      console.error('Failed to load wallpapers:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load wallpapers",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleSetWallpaper = async (wallpaper: Wallpaper) => {
    try {
      console.log('Setting wallpaper:', wallpaper.filename)
      await setWallpaper(wallpaper._id)

      // Update local state
      setWallpapers(prev => prev.map(w => ({
        ...w,
        isActive: w._id === wallpaper._id
      })))

      toast({
        title: "Wallpaper Set",
        description: `${wallpaper.filename} is now your wallpaper`,
      })
    } catch (error: any) {
      console.error('Failed to set wallpaper:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to set wallpaper",
        variant: "destructive",
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      console.log('Uploading wallpaper:', file.name)
      const result = await uploadWallpaper(file)

      // Add new wallpaper to the list
      setWallpapers(prev => [result.wallpaper, ...prev])

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded`,
      })
    } catch (error: any) {
      console.error('Failed to upload wallpaper:', error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload wallpaper",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteWallpaper = async (wallpaper: Wallpaper) => {
    if (wallpaper.isActive) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the active wallpaper. Set another wallpaper as active first.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Deleting wallpaper:', wallpaper.filename)
      await deleteWallpaper(wallpaper._id)

      // Remove wallpaper from the list
      setWallpapers(prev => prev.filter(w => w._id !== wallpaper._id))

      // Adjust selected index if necessary
      if (selectedIndex >= wallpapers.length - 1) {
        setSelectedIndex(Math.max(0, wallpapers.length - 2))
      }

      toast({
        title: "Wallpaper Deleted",
        description: `${wallpaper.filename} has been deleted`,
      })
    } catch (error: any) {
      console.error('Failed to delete wallpaper:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete wallpaper",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full mx-auto mb-4" />
        <p className="text-white/70">Loading wallpapers...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-white/80" />
          <h2 className="text-lg font-semibold text-white">Choose Wallpaper</h2>
        </div>

        <Button
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          {uploading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Upload Wallpaper
            </>
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Wallpapers grid */}
      <ScrollArea className="h-96">
        {wallpapers.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No wallpapers found</p>
            <p className="text-sm mt-2">Upload images to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wallpapers.map((wallpaper, index) => (
              <div
                key={wallpaper._id}
                onClick={() => handleSetWallpaper(wallpaper)}
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group",
                  index === selectedIndex
                    ? "ring-2 ring-white/60 scale-105 shadow-lg"
                    : "ring-1 ring-white/20 hover:ring-white/40 hover:scale-102"
                )}
              >
                {/* Wallpaper preview */}
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  {wallpaper.thumbnail ? (
                    <img
                      src={wallpaper.thumbnail}
                      alt={wallpaper.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-white/40" />
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                {/* Active indicator */}
                {wallpaper.isActive && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Delete button */}
                {!wallpaper.isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteWallpaper(wallpaper)
                    }}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete wallpaper"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                )}

                {/* Selection indicator */}
                {index === selectedIndex && (
                  <div className="absolute inset-0 border-2 border-white/80 rounded-lg" />
                )}

                {/* Filename */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                  <p className="text-white text-xs truncate font-medium">
                    {wallpaper.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Status bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
        <span>
          {wallpapers.length} wallpaper{wallpapers.length !== 1 ? 's' : ''} available
        </span>
        {wallpapers.length > 0 && (
          <span>
            {selectedIndex + 1} of {wallpapers.length} selected
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-white/50 text-center">
        Use arrow keys to navigate • Press Enter to set wallpaper • Press Delete to remove wallpaper
      </div>
    </div>
  )
}