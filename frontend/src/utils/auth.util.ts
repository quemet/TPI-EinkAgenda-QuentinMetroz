const getSignupPath = (familyId: string, requestId: string) => {
  if (!familyId || !requestId) {
    return '/signup'
  }

  return `/signup/${familyId}/${requestId}`
}

const getLoginPath = (familyId: string, requestId: string) => {
  if (!familyId || !requestId) {
    return '/login'
  }

  return `/login/${familyId}/${requestId}`
}

const validateLoginForm = (email: string, password: string) => {
  if (!email || !password) {
    return false
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!isEmailValid) {
    return false
  }

  return true
}

const validateSignupForm = (email: string, password: string, confirmPassword: string) => {
  if (!email || !password || !confirmPassword) {
    return false
  }

  if (password !== confirmPassword) {
    return false
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!isEmailValid) {
    return false
  }

  return true
}

export { getSignupPath, getLoginPath, validateLoginForm, validateSignupForm }
