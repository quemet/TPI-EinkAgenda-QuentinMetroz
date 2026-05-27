import { describe, it, expect, vi } from 'vitest'
import {
  askForAgendaName,
  askConfirmationForTheChangmentOfRole,
  askUserConfirmation,
  copyLink,
  createAddMemberLink,
} from '@/utils/dashboard.util'

describe('Dashboard Utilities', () => {
  describe('askForAgendaName', () => {
    it('should return the new name if user provides one', () => {
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('New Agenda Name')
      const agenda = { id: '1', name: 'Old Agenda Name' }
      const result = askForAgendaName(agenda)
      expect(result).toBe('New Agenda Name')
      mockPrompt.mockRestore()
    })

    it('should return the original name if user cancels or provides an empty name', () => {
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('')
      const agenda = { id: '1', name: 'Old Agenda Name' }
      const result = askForAgendaName(agenda)
      expect(result).toBe('Old Agenda Name')
      mockPrompt.mockRestore()
    })
  })

  describe('askConfirmationForTheChangmentOfRole', () => {
    it('when changing role user to admin', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const result = askConfirmationForTheChangmentOfRole('user')
      expect(result).toBe(true)
      mockConfirm.mockRestore()
    })

    it('when changing role admin to admin', () => {
      const mockAlert = vi.spyOn(window, 'alert').mockReturnValue()
      const result = askConfirmationForTheChangmentOfRole('admin')
      expect(result).toBe(undefined)
      mockAlert.mockRestore()
    })
  })

  describe('askUserConfirmation', () => {
    it('should return true when user confirms', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const result = askUserConfirmation()
      expect(result).toBe(true)
      mockConfirm.mockRestore()
    })

    it('should return false when user cancels', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const result = askUserConfirmation()
      expect(result).toBe(false)
      mockConfirm.mockRestore()
    })
  })

  describe('copyLink', () => {
    it('should copy the correct link to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
        writable: true,
      })
      const linkCopied = { value: false }
      const familyId = 'family123'
      const userId = 'user456'
      await copyLink(linkCopied, familyId, userId)
      expect(mockWriteText).toHaveBeenCalledWith(
        `http://localhost:5173/login/${familyId}/${userId}`,
      )
      expect(linkCopied.value).toBe(true)
    })
  })

  describe('createAddMemberLink', () => {
    it('should create the correct link', () => {
      const familyId = 'family123'
      const userId = 'user456'
      const expectedLink = `http://localhost:5173/login/${familyId}/${userId}`
      const result = createAddMemberLink(familyId, userId)
      expect(result).toBe(expectedLink)
    })

    it('should throw when family ID or user ID is empty', () => {
      expect(() => createAddMemberLink('', '')).toThrow('Family ID and User ID must not be empty')
    })
  })
})
