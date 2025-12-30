import { Routes, Route, Navigate, Outlet } from "react-router"

import AuthLayout from "@/components/TaskBars/AuthLayout"
import NotFound from "@/pages/NotFound"
import RegisterPage from "@/pages/Auth/RegisterPage"
import LoginPage from "@/pages/Auth/LoginPage"

import ManagerMoviePage from "@/pages/Admin/ManageMoviePage/ManagerMoviePage"
import ManagerExercisePage from "@/pages/Admin/ManageExercisePage/ManagerExercisePage"
import ManageUserPage from "@/pages/Admin/ManageUserPage/ManageUsersPage"
import QuizEditorPage from "@/pages/Admin/QuizEditorPage/QuizEditorPage"
import CreateQuizPage from "@/pages/Admin/CreateQuizPage/CreateQuizPage"

import HomePage from "@/pages/User/HomePage/HomePage"
import MoviePlayerPage from "@/pages/User/MoviePlayerPage/MoviePlayerPage"
import ExercisePage from "@/pages/User/ExercisePage/ExercisePage"
import ExamPage from "@/pages/User/ExamPage/ExamPage"
import ResultPage from "@/pages/User/ResultPage/ResultPage"

import ProfilePage from "@/pages/Shared/ProfilePage"
import EditProfilePage from "@/pages/Shared/EditProfilePage"
import ChangePasswoedPage from "@/pages/Shared/ChangePasswoedPage"

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit/:id" element={<EditProfilePage />} />
          <Route path="/profile/change-password/:id" element={<ChangePasswoedPage />} />
          
          {/* ----CLIENT---- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePlayerPage />} />
          <Route path="/client/exercises" element={<ExercisePage />} />
          <Route path="/client/exam" element={<ExamPage />} />
          <Route path="/client/results" element={<ResultPage />} />

          {/* ----ADMIN---- */}
          <Route path="/admin/users" element={<ManageUserPage />} />
          <Route path="/admin/movie" element={<ManagerMoviePage />} />
          <Route path="/admin/exercise" element={<ManagerExercisePage />} />
          <Route path="/admin/exercise/:movieId/:type/edit" element={<QuizEditorPage />} />
          <Route path="/admin/exercise/create" element={<CreateQuizPage />} />
        </Route>  
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
