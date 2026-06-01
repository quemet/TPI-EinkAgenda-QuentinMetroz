import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

vi.mock('@/services/httpclient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import httpClient from '@/services/httpclient'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/agenda/:agendaId', component: { template: '<div>Agenda</div>' }, props: true },
    { path: '/dashboard/:familyId', component: { template: '<div>Dashboard</div>' }, props: true },
  ],
})

const mockUser = { id: 'user-1', username: 'Alice', email: 'alice@test.com' }
const mockFamilies = [{ id: 'family-1', name: 'Family One' }]
const mockAgendas = [
  { id: 'agenda-1', name: 'Agenda One' },
  { id: 'agenda-2', name: 'Agenda Two' },
]

function setupAuthMocks() {
  vi.mocked(httpClient.get).mockImplementation((url: string) => {
    if (url === '/api/users/me') return Promise.resolve({ data: mockUser })
    if (url === '/api/families') return Promise.resolve({ data: mockFamilies })
    if (url === '/api/agendas/family-1') return Promise.resolve({ data: mockAgendas })
    return Promise.resolve({ data: [] })
  })
}

describe('HomePage Integration Tests', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    localStorage.clear()
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    await router.push('/')
  })

  it('redirects to /login when not authenticated', async () => {
    mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('calls the correct API endpoints on mount', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    expect(httpClient.get).toHaveBeenCalledWith('/api/users/me')
    expect(httpClient.get).toHaveBeenCalledWith('/api/families')
    expect(httpClient.get).toHaveBeenCalledWith('/api/agendas/family-1')
  })

  it('displays username in the greeting after data loads', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Bonjour Mr. Alice')
  })

  it('displays agenda cards when agendas exist', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Agenda One')
    expect(wrapper.text()).toContain('Agenda Two')
  })

  it('shows empty state when there are no agendas', async () => {
    localStorage.setItem('token', 'test-token')

    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url === '/api/users/me') return Promise.resolve({ data: mockUser })
      if (url === '/api/families') return Promise.resolve({ data: [] })
      return Promise.resolve({ data: [] })
    })

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune agenda trouvée.')
  })

  it('navigates to /agenda/:id when clicking an agenda card', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    const agendaCards = wrapper.findAll('.aspect-square')
    await agendaCards[0]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/agenda/agenda-1')
  })

  it('calls createFamily and adds the family when submitting the dialog', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { id: 'family-new', name: 'New Family' },
    })

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('input[name="familyName"]').setValue('New Family')
    await wrapper.findAll('button').find((b) => b.text() === 'Créer')?.trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith('/api/families', { name: 'New Family' })
  })

  it('does not call createFamily when clicking Cancel in the dialog', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Annuler')?.trigger('click')
    await flushPromises()

    expect(httpClient.post).not.toHaveBeenCalledWith('/api/families', expect.any(Object))
  })
})
