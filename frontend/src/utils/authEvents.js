// Tên sư kiện khi profile được cập nhật
export const AUTH_PROFILE_UPDATED = "auth:profile-updated"

// Hàm phát tín hiệu khi profile được cập nhật
export const emitProfileUpdated = (detail) => {
  window.dispatchEvent(new CustomEvent(AUTH_PROFILE_UPDATED, { detail }))
}
