import axios from "axios";
import authorizedAxiosInstance from "../utils/authorizeAxios";
import { API_ROOT } from "../utils/constants";

/** API User */
export const loginUserApi = async (data) => {
  const res = await axios.post(`${API_ROOT}/api/users/login`, data);
  return res.data;
}

export const registerUserApi = async (data) => {
  const res = await axios.post(`${API_ROOT}/api/users/register`, data);
  return res.data;
}

export const refreshTokenApi = async (refreshToken) => {
  const res = await axios.put(`${API_ROOT}/api/users/refresh-token`, { refreshToken });
  return res.data;
}

/** API Account */
export const fetchProfileByIdApi = async (userId) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/users/${userId}`);
  return res.data;
}

export const changePasswordApi = async (userId, data) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/api/users/change-password/${userId}`, data);
  return res.data;
}

export const updateProfileApi = async (userId, data) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/api/users/update-profile/${userId}`, data);
  return res.data;
}

/** API Movies */
export const fetchMoviesApi = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/movies`);
  return res.data;
}

export const fetchMovieByIdApi = async (movieId) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/movies/${movieId}`);
  return res.data;
}

export const createMovieApi = async (payload) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/movies`, payload);
  return res.data;
}

export const updateMovieApi = async (movieId, payload) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/api/movies/${movieId}`, payload);
  return res.data;
}

export const deleteMovieApi = async (movieId) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/api/movies/${movieId}`);
  return res.data;
}

export const searchMoviesApi = async (query) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/movies/search`, {
    params: { q: query },
  });
  return res.data;
}

/** Subtitles */
export const fetchSubtitlesByMovie = async (movieId, withContent = 0) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/subtitles/${movieId}`, {
    params: { withContent }
  });
  return res.data;
}

export const uploadSubtitleApi = async (formData) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/subtitles`, formData);
  return res.data;
}



/** Quizzes */
export const createQuizApi = async (payload) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/quizzes`, payload);
  return res.data;
}

export const fetchQuizzesSummary = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/quizzes/summary`);
  return res.data;
}

export const fetchQuizzes = async (params = {}) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/quizzes`, { params });
  return res.data;
}

export const updateQuizApi = async (quizId, payload) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/api/quizzes/${quizId}`, payload);
  return res.data;
}

export const deleteQuizApi = async (quizId) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/api/quizzes/${quizId}`);
  return res.data;
}

export const createQuizByAiApi = async (payload) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/quizzes/createQuizByAi`, payload);
  return res.data;
}

/** API Result */
export const submitResultApi = async (payload) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/results`, payload);
  return res.data;
}

export const fetchResultsByUserApi = async (userId) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/results/${userId}`);
  return res.data;
}


/** API Exercise Interactive */
export const createInteractiveQuizByAiApi = async (payload) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/api/quizzes/createInteractiveQuizByAi`, payload);
  return res.data;
}

// API Manage Users (Admin)
export const fetchAllUsersApi = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/api/users`);
  return res.data;
}

export const deleteUserApi = async (userId) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/api/users/${userId}`);
  return res.data;
}

export const updateUserApi = async (userId, data) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/api/users/update-user/${userId}`, data);
  return res.data;
}