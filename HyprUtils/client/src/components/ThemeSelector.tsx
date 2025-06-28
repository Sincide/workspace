import { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface ThemeSelectorProps {
  onClose: () => void
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [themes] = useState<Theme[]>([
    {
      id: 'dark',
      name: 'Dark',
      colors: { primary: '#1e293b', secondary: '#334155', accent: '#6366f1' }
    },
    {
      id: 'light',
      name: 'Light',
      colors: { primary: '#f8fafc', secondary: '#e2e8f0', accent: '#3b82f6' }
    },
    {
      id: 'nord',
      name: 'Nord',
      colors: { primary: '#2e3440', secondary: '#3b4252', accent: '#88c0d0' }
    },
    {
      id: 'dracula',
      name: 'Dracula',
      colors: { primary: '#282a36', secondary: '#44475a', accent: '#bd93f9' }
    },
    {
      id: 'catppuccin',
      name: 'Catppuccin',
      colors: { primary: '#1e1e2e', secondary: '#313244', accent: '#cba6f7' }
    }
  ])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedTheme(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedTheme(prev => Math.min(prev + 1, themes.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        applyTheme(themes[selectedTheme])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTheme, themes, onClose])

  const applyTheme = (theme: Theme) => {
    console.log('Applying theme:', theme.name)
    // In a real implementation, this would update CSS variables or theme context
    document.documentElement.style.setProperty('--theme-primary', theme.colors.primary)
    document.documentElement.style.setProperty('--theme-secondary', theme.colors.secondary)
    document.documentElement.style.setProperty('--theme-accent', theme.colors.accent)
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-white/80" />
          <h2 className="text-lg font-semibold text-white">Select Theme</h2>
        </div>

        {/* Theme options */}
        <div className="space-y-2">
          {themes.map((theme, index) => (
            <button
              key={theme.id}
              onClick={() => applyTheme(theme)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200",
                index === selectedTheme
                  ? "bg-white/20 border border-white/40"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <span className="text-white font-medium">{theme.name}</span>
              </div>
              {index === selectedTheme && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-white/50 text-center">
          Use ↑↓ to navigate • Enter to apply • Esc to close
        </div>
      </div>
    </div>
  )
}