import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SignupPage from '@/pages/SignupPage.vue'

vi.mock('@/services/httpclient', () => ({
  default: {
    post: vi.fn(),
  },
}))

import httpClient from '@/services/httpclient'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/signup/:familyId?/:requesterId?', component: SignupPage, props: true },
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
  ],
})

const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'admin',
  personType: 'adult',
}

describe('SignupPage Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the signup form', () => {
    const wrapper = mount(SignupPage, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('input[name="username"]').exists()).toBe(true)
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('input[name="confirmPassword"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows error and does not call API when passwords do not match', async () => {
    const wrapper = mount(SignupPage, {
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="username"]').setValue('testuser')
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('input[name="confirmPassword"]').setValue('differentPassword')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Les mots de passe ne correspondent pas')
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('shows error and does not call API when required fields are empty', async () => {
    const wrapper = mount(SignupPage, {
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('input[name="confirmPassword"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Veuillez remplir tous les champs')
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('signs up and redirects to / without family props', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { user: mockUser, token: 'test-token' },
    })

    const wrapper = mount(SignupPage, {
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="username"]').setValue('testuser')
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('input[name="confirmPassword"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('signs up and redirects to /dashboard when family props are provided', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { user: mockUser, token: 'test-token' },
    })

    const wrapper = mount(SignupPage, {
      props: { familyId: 'family-1', requesterId: 'requester-1' },
      global: { plugins: [router] },
    })

    await wrapper.find('input[name="username"]').setValue('testuser')
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('input[name="confirmPassword"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })
    expect(httpClient.post).toHaveBeenCalledWith('/api/family/family-1/users', {
      requesterUserId: 'requester-1',
    })
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})
