import { Toaster } from "sonner"
import {  BrowserRouter ,Routes, Route } from "react-router"
import NotFound from "./pages/NotFound"
import HomePage from "./pages/Admin/HomePage"
import MoviePlayerPage from "./pages/Admin/MoviePlayerPage"
import ManagerMovie from "./pages/Admin/ManagerMovie"

function App() {

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePlayerPage />} />
          <Route path="movie" element={<ManagerMovie />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
