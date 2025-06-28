import { useState, useEffect, useRef } from 'react'
import { Search, Play, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getApplications, launchApplication } from '@/api/applications'
import { useToast } from '@/hooks/useToast'

interface Application {
  _id: string
  name: string
  description: string
  icon: string
  command: string
  categories: string[]
  isRecent: boolean
}

export function AppLauncher() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApps, setFilteredApps] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    // Auto-focus search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Filter applications based on search query
    if (!searchQuery.trim()) {
      setFilteredApps(applications)
    } else {
      const filtered = applications.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        app.command.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredApps(filtered)
    }
    setSelectedIndex(0)
  }, [searchQuery, applications])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredApps.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const cols = 3
        const currentRow = Math.floor(selectedIndex / cols)
        const currentCol = selectedIndex % cols
        
        if (e.key === 'ArrowRight') {
          const newIndex = currentRow * cols + Math.min(currentCol + 1, cols - 1)
          setSelectedIndex(Math.min(newIndex, filteredApps.length - 1))
        } else {
          const newIndex = currentRow * cols + Math.max(currentCol - 1, 0)
          setSelectedIndex(Math.max(newIndex, 0))
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredApps[selectedIndex]) {
          handleLaunchApp(filteredApps[selectedIndex])
        }
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 9, filteredApps.length - 1))
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 9, 0))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setSelectedIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setSelectedIndex(filteredApps.length - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredApps, selectedIndex])

  const loadApplications = async () => {
    try {
      console.log('Loading applications...')
      const data = await getApplications()
      setApplications(data.applications)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load applications:', error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleLaunchApp = async (app: Application) => {
    try {
      console.log('Launching application:', app.name)
      await launchApplication(app._id)
      toast({
        title: "Application Launched",
        description: `${app.name} has been started`,
      })
    } catch (error) {
      console.error('Failed to launch application:', error)
      toast({
        title: "Error",
        description: "Failed to launch application",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full mx-auto mb-4" />
        <p className="text-white/70">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40"
        />
      </div>

      {/* Applications grid */}
      <ScrollArea className="h-96">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications found</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredApps.map((app, index) => (
              <div
                key={app._id}
                onClick={() => handleLaunchApp(app)}
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm border cursor-pointer transition-all duration-200 group",
                  index === selectedIndex
                    ? "bg-white/20 border-white/40 shadow-lg scale-105"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {app.icon || app.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">
                        {app.name}
                      </h3>
                      {app.isRecent && (
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2 mb-2">
                      {app.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {app.categories.slice(0, 2).map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs bg-white/10 text-white/80 hover:bg-white/20"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <code className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded truncate">
                    {app.command}
                  </code>
                  <Play className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Status bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
        <span>
          {filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''} found
        </span>
        {filteredApps.length > 0 && (
          <span>
            {selectedIndex + 1} of {filteredApps.length} selected
          </span>
        )}
      </div>
    </div>
  )
}