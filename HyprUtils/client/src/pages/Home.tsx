import { useState, useEffect, useRef } from 'react'
import { Search, Monitor, Terminal, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLauncher } from '@/components/AppLauncher'
import { WallpaperSetter } from '@/components/WallpaperSetter'
import { ScriptRunner } from '@/components/ScriptRunner'
import { ThemeSelector } from '@/components/ThemeSelector'

type Section = 'apps' | 'wallpapers' | 'scripts'

export function Home() {
  const [activeSection, setActiveSection] = useState<Section>('apps')
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts
      if (e.key === 'Escape') {
        if (showThemeSelector) {
          setShowThemeSelector(false)
        } else {
          // In a real implementation, this would close the window
          console.log('Closing application...')
        }
        return
      }

      if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        setShowThemeSelector(!showThemeSelector)
        return
      }

      if (e.ctrlKey && e.key === 'q') {
        e.preventDefault()
        console.log('Quitting application...')
        return
      }

      // Section navigation
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const sections: Section[] = ['apps', 'wallpapers', 'scripts']
        const currentIndex = sections.indexOf(activeSection)
        const nextIndex = (currentIndex + 1) % sections.length
        setActiveSection(sections[nextIndex])
        return
      }

      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        const sections: Section[] = ['apps', 'wallpapers', 'scripts']
        const currentIndex = sections.indexOf(activeSection)
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1
        setActiveSection(sections[prevIndex])
        return
      }

      // Direct section navigation
      if (e.key === '1') {
        setActiveSection('apps')
        return
      }
      if (e.key === '2') {
        setActiveSection('wallpapers')
        return
      }
      if (e.key === '3') {
        setActiveSection('scripts')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeSection, showThemeSelector])

  useEffect(() => {
    // Auto-focus the container on mount
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [])

  const sections = [
    { id: 'apps' as Section, label: 'App Launcher', icon: Search, shortcut: '1' },
    { id: 'wallpapers' as Section, label: 'Wallpaper Setter', icon: Monitor, shortcut: '2' },
    { id: 'scripts' as Section, label: 'Script Runner', icon: Terminal, shortcut: '3' },
  ]

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      tabIndex={-1}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      {/* Main container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header with theme toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white/80">
              <Search className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Hyprland Utilities</h1>
            </div>
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
              title="Theme Selector (Ctrl+T)"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>

          {/* Section navigation */}
          <div className="flex gap-2 mb-6">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200",
                    activeSection === section.id
                      ? "bg-white/20 border-white/30 text-white shadow-lg"
                      : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{section.label}</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                    {section.shortcut}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Main content area */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {activeSection === 'apps' && <AppLauncher />}
            {activeSection === 'wallpapers' && <WallpaperSetter />}
            {activeSection === 'scripts' && <ScriptRunner />}
          </div>

          {/* Keyboard shortcuts help */}
          <div className="mt-4 text-center text-white/60 text-sm">
            <p>
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs mr-2">Tab</kbd>
              Navigate sections
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs mx-2">Ctrl+T</kbd>
              Theme selector
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs mx-2">Esc</kbd>
              Close
            </p>
          </div>
        </div>
      </div>

      {/* Theme selector overlay */}
      {showThemeSelector && (
        <ThemeSelector onClose={() => setShowThemeSelector(false)} />
      )}
    </div>
  )
}