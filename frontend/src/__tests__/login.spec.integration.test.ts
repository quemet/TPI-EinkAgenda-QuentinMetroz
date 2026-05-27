import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'

vi.mock('@/services/httpclient', () => ({
  default: {
    post: vi.fn(),
  },
}))

import httpClient from '@/services/httpclient'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login/:familyId?/:requesterId?', component: LoginPage, props: true },
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/signup', component: { template: '<div>Signup</div>' } },
  ],
})

const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'admin',
  personType: 'adult',
}

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('logs in and redirects to / without family props', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { user: mockUser, token: 'test-token' },
    })

    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    })
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('logs in and redirects to /dashboard when family props are provided', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { user: mockUser, token: 'test-token' },
    })

    const wrapper = mount(LoginPage, {
      props: { familyId: 'family-1', requesterId: 'requester-1' },
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    })
    expect(httpClient.post).toHaveBeenCalledWith('/api/family/family-1/users', {
      requesterUserId: 'requester-1',
    })
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('shows error message when the API call fails', async () => {
    vi.mocked(httpClient.post).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Une erreur est survenue lors de la connexion')
  })
})
