import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { Home } from "./pages/Home"
import { BlankPage } from "./pages/BlankPage"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App