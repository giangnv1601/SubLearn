import { Toaster } from "sonner"
import {  BrowserRouter ,Routes, Route } from "react-router"
import NotFound from "./pages/NotFound"
import HomePage from "./pages/HomePage"
import MoviePlayerPage from "./pages/MoviePlayerPage"
import ManagerMovie from "./pages/ManagerMovie"
import TestPage from "./pages/TestPage"
function App() {

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MoviePlayerPage />} />
          <Route path="/movie" element={<MoviePlayerPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
