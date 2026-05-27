import { describe, it, expect } from 'vitest'

import { getSignupPath, validateSignupForm } from '@/utils/auth.util'

describe('Signup Utils Unit Tests', () => {
  describe('getSignupPath', () => {
    it('should return the correct signup path with familyId and requesterId', () => {
      const familyId = 'family123'
      const requesterId = 'requester456'

      const signupPath = getSignupPath(familyId, requesterId)

      expect(signupPath).toBe(`/signup/${familyId}/${requesterId}`)
    })

    it('should return the default signup path when familyId and requesterId are not provided', () => {
      const signupPath = getSignupPath('', '')

      expect(signupPath).toBe('/signup')
    })
  })

  describe('validateSignupForm', () => {
    it('should return true for valid email and password', () => {
      const email = 'test@gmail.com'
      const password = 'password123'
      const confirmPassword = 'password123'
      const isValid = validateSignupForm(email, password, confirmPassword)
      expect(isValid).toBe(true)
    })

    it('should return false for invalid email', () => {
      const email = 'invalid-email'
      const password = 'password123'
      const confirmPassword = 'password123'
      const isValid = validateSignupForm(email, password, confirmPassword)
      expect(isValid).toBe(false)
    })

    it('should return false for empty field', () => {
      const email = ''
      const password = 'password123'
      const confirmPassword = 'password123'
      const isValid = validateSignupForm(email, password, confirmPassword)
      expect(isValid).toBe(false)
    })

    it('should return false for non-matching passwords', () => {
      const email = 'test@gmail.com'
      const password = 'password123'
      const confirmPassword = 'differentPassword'
      const isValid = validateSignupForm(email, password, confirmPassword)
      expect(isValid).toBe(false)
    })
  })
})
