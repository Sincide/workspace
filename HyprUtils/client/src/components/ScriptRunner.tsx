import { useState, useEffect, useRef } from 'react'
import { Terminal, Play, History, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { executeCommand, getCommandHistory, clearCommandHistory } from '@/api/commands'
import { useToast } from '@/hooks/useToast'

interface CommandExecution {
  _id: string
  command: string
  output: string
  exitCode: number
  timestamp: string
}

export function ScriptRunner() {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCommandHistory()
    // Auto-focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleExecuteCommand()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (history.length > 0) {
          const newIndex = Math.min(historyIndex + 1, history.length - 1)
          setHistoryIndex(newIndex)
          setCommand(history[newIndex] || '')
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setCommand(history[newIndex] || '')
        } else if (historyIndex === 0) {
          setHistoryIndex(-1)
          setCommand('')
        }
      } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        setOutput('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [command, history, historyIndex])

  const loadCommandHistory = async () => {
    try {
      console.log('Loading command history...')
      const data = await getCommandHistory()
      setHistory(data.history)
    } catch (error) {
      console.error('Failed to load command history:', error)
      toast({
        title: "Error",
        description: "Failed to load command history",
        variant: "destructive",
      })
    }
  }

  const handleExecuteCommand = async () => {
    if (!command.trim() || isExecuting) return

    setIsExecuting(true)
    const currentCommand = command.trim()

    try {
      console.log('Executing command:', currentCommand)

      // Add to output immediately
      setOutput(prev => prev + `$ ${currentCommand}\n`)

      const result = await executeCommand(currentCommand)

      // Update output with result
      setOutput(prev => prev + result.output + '\n')

      // Update history
      setHistory(prev => [currentCommand, ...prev.filter(cmd => cmd !== currentCommand)].slice(0, 50))
      setHistoryIndex(-1)
      setCommand('')

      // Scroll to bottom of output
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }

      if (result.exitCode === 0) {
        toast({
          title: "Command Executed",
          description: "Command completed successfully",
        })
      } else {
        toast({
          title: "Command Failed",
          description: `Command exited with code ${result.exitCode}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to execute command:', error)
      setOutput(prev => prev + `Error: ${error}\n`)
      toast({
        title: "Execution Error",
        description: "Failed to execute command",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await clearCommandHistory()
      setHistory([])
      toast({
        title: "History Cleared",
        description: "Command history has been cleared",
      })
    } catch (error) {
      console.error('Failed to clear history:', error)
      toast({
        title: "Error",
        description: "Failed to clear command history",
        variant: "destructive",
      })
    }
  }

  const selectHistoryCommand = (cmd: string) => {
    setCommand(cmd)
    setShowHistory(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-white/80" />
          <h2 className="text-lg font-semibold text-white">Script Runner</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Command input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={isExecuting}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40"
            />
          </div>
          <Button
            onClick={handleExecuteCommand}
            disabled={!command.trim() || isExecuting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* History dropdown */}
      {showHistory && history.length > 0 && (
        <div className="mb-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2 max-h-32 overflow-y-auto">
          {history.map((cmd, index) => (
            <button
              key={index}
              onClick={() => selectHistoryCommand(cmd)}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Output area */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4 h-64 overflow-hidden">
        <ScrollArea className="h-full">
          <pre
            ref={outputRef}
            className="text-sm text-green-400 font-mono whitespace-pre-wrap"
          >
            {output || 'Command output will appear here...'}
          </pre>
        </ScrollArea>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-white/50 text-center">
        Press Enter to execute • Use ↑↓ for history • Ctrl+L to clear output
      </div>
    </div>
  )
}