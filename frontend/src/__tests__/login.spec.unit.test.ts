import { describe, it, expect } from 'vitest'

import { getLoginPath, validateLoginForm } from '@/utils/auth.util'

describe('Login Utils Unit Tests', () => {
  describe('getLoginPath', () => {
    it('should return the correct login path with familyId and requesterId', () => {
      const familyId = 'family123'
      const requesterId = 'requester456'

      const loginPath = getLoginPath(familyId, requesterId)

      expect(loginPath).toBe(`/login/${familyId}/${requesterId}`)
    })

    it('should return the default login path when familyId and requesterId are not provided', () => {
      const loginPath = getLoginPath('', '')

      expect(loginPath).toBe('/login')
    })
  })

  describe('validateLoginForm', () => {
    it('should return true for valid email and password', () => {
      const email = 'test@gmail.com'
      const password = 'password123'
      const isValid = validateLoginForm(email, password)
      expect(isValid).toBe(true)
    })

    it('should return false for invalid email', () => {
      const email = 'invalid-email'
      const password = 'password123'
      const isValid = validateLoginForm(email, password)
      expect(isValid).toBe(false)
    })

    it('should return false for empty field', () => {
      const email = ''
      const password = 'password123'
      const isValid = validateLoginForm(email, password)
      expect(isValid).toBe(false)
    })
  })
})
