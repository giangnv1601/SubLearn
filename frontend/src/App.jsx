import { Routes, Route, Navigate, Outlet } from "react-router"

import NotFound from "./pages/NotFound"
import HomePage from "./pages/Shared/Home/HomePage/HomePage"
import MoviePlayerPage from "./pages/Shared/Home/MoviePlayerPage/MoviePlayerPage"
import ManagerMovie from "./pages/Admin/ManageMovie/ManagerMoviePage"
import ManagerExercisesPage from "./pages/Admin/ManagerExercisesPage"
import ManageUsersPage from "./pages/Admin/ManageUsers/ManageUsersPage/ManageUsersPage"
import QuizEditorPage from "./pages/Admin/QuizEditorPage"
import CreateQuizTester from "./pages/Test"
import RegisterPage from "./pages/Auth/RegisterPage"
import LoginPage from "./pages/Auth/LoginPage"
import AuthLayout from "./components/TaskBars/AuthLayout"
import ExercisesPage from "./pages/User/ExercisesPage"
import ExamPage from "./pages/User/ExamPage"
import ResultsPage from "./pages/User/ResultsPage"
import ProfilePage from "./pages/Shared/Profile/ProfilePage"
import EditProfilePage from "./pages/Shared/Profile/EditProfilePage"
import ChangePasswoedPage from "./pages/Shared/Profile/ChangePasswoedPage"
import CreateQuizPage from "./pages/Admin/CreateQuizPage/CreateQuizPage"

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

const UnauthenticatedRoute = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (user) return <Navigate to="/" replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      {/* Public Routes (Accessible without login) */}
      <Route element={<UnauthenticatedRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes (Accessible only after login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          {/* ----SHARE---- */}
          
          {/* Home */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePlayerPage />} />
          {/* Account */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit/:id" element={<EditProfilePage />} />
          <Route path="/profile/change-password/:id" element={<ChangePasswoedPage />} />
          
          {/* ----CLIENT---- */}
          
          {/* Exercises */}
          <Route path="/client/exercises" element={<ExercisesPage />} />
          <Route path="/client/exam" element={<ExamPage />} />
          {/* Results */}
          <Route path="/client/results" element={<ResultsPage />} />

          {/* ----ADMIN---- */}

          {/* ManageUsers */}
          <Route path="/admin/users" element={<ManageUsersPage />} />
          {/* ManageMovie */}
          <Route path="/admin/movie" element={<ManagerMovie />} />
          {/* Manage Exercises */}
          <Route path="/admin/exercise" element={<ManagerExercisesPage />} />
          <Route path="/admin/exercise/:movieId/:type/edit" element={<QuizEditorPage />} />
          <Route path="/admin/exercise/create" element={<CreateQuizPage />} />

          <Route path="/test" element={<CreateQuizTester />} />
        </Route>  
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
