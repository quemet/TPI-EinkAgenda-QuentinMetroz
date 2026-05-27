import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/pages/DashboardView.vue'

vi.mock('@/services/httpclient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import httpClient from '@/services/httpclient'

const FAMILY_ID = 'family-1'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/dashboard/:familyId', component: DashboardView, props: true },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/agenda/:agendaId', component: { template: '<div>Agenda</div>' }, props: true },
    { path: '/', component: { template: '<div>Home</div>' } },
  ],
})

const mockMe = {
  id: 'user-1',
  username: 'Alice',
  email: 'alice@test.com',
  role: 'admin',
  personType: 'elder' as const,
}
const mockAgendas = [
  { id: 'agenda-1', name: 'Agenda One' },
  { id: 'agenda-2', name: 'Agenda Two' },
]
const mockUsers = [
  { id: 'user-1', username: 'Alice', email: 'alice@test.com', role: 'admin', personType: 'elder' as const },
  { id: 'user-2', username: 'Bob', email: 'bob@test.com', role: 'user', personType: 'young' as const },
]

function setupAuthMocks() {
  vi.mocked(httpClient.get).mockImplementation((url: string) => {
    if (url === '/api/users/me') return Promise.resolve({ data: mockMe })
    if (url === `/api/agendas/${FAMILY_ID}`) return Promise.resolve({ data: mockAgendas })
    if (url === `/api/users/family/${FAMILY_ID}/users`) return Promise.resolve({ data: mockUsers })
    if (url === '/api/families') return Promise.resolve({ data: [{ id: FAMILY_ID, name: 'Family One' }] })
    return Promise.resolve({ data: [] })
  })
}

describe('DashboardView Integration Tests', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    localStorage.clear()
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    await router.push(`/dashboard/${FAMILY_ID}`)
  })

  it('redirects to /login when not authenticated', async () => {
    mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('calls the correct API endpoints on mount', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(httpClient.get).toHaveBeenCalledWith(`/api/agendas/${FAMILY_ID}`)
    expect(httpClient.get).toHaveBeenCalledWith(`/api/users/family/${FAMILY_ID}/users`)
    expect(httpClient.get).toHaveBeenCalledWith('/api/users/me')
  })

  it('displays agendas fetched from the API', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Agenda One')
    expect(wrapper.text()).toContain('Agenda Two')
  })

  it('displays family users fetched from the API', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('navigates to /agenda/:id when clicking an agenda card', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    const agendaCards = wrapper.findAll('.aspect-square')
    await agendaCards[0]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/agenda/agenda-1')
  })

  it('calls deleteAgenda and removes the agenda from the list', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()
    vi.mocked(httpClient.delete).mockResolvedValue({ data: {} })

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Agenda One')

    const deleteButtons = wrapper.findAll('.hover\\:text-red-500')
    await deleteButtons[0]!.trigger('click')
    await flushPromises()

    expect(httpClient.delete).toHaveBeenCalledWith('/api/agendas/agenda-1')
    expect(wrapper.text()).not.toContain('Agenda One')
  })

  it('calls modifyAgendaName and updates the agenda name in the list', async () => {
    localStorage.setItem('token', 'test-token')
    vi.mocked(httpClient.get).mockImplementation((url: string) => {
      if (url === '/api/users/me') return Promise.resolve({ data: mockMe })
      if (url === `/api/agendas/${FAMILY_ID}`) return Promise.resolve({ data: [mockAgendas[0]] })
      if (url === `/api/users/family/${FAMILY_ID}/users`) return Promise.resolve({ data: mockUsers })
      if (url === '/api/families') return Promise.resolve({ data: [{ id: FAMILY_ID, name: 'Family One' }] })
      return Promise.resolve({ data: [] })
    })
    const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('Updated Agenda')
    vi.mocked(httpClient.put).mockResolvedValue({ data: { id: 'agenda-1', name: 'Updated Agenda' } })

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('.hover\\:text-gray-700').trigger('click')
    await flushPromises()

    expect(httpClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/agendas/'),
      { name: 'Updated Agenda' },
    )
    expect(wrapper.text()).toContain('Updated Agenda')
    mockPrompt.mockRestore()
  })

  it('calls createAgenda and adds the new agenda to the list', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { id: 'agenda-new', name: 'New Agenda' },
    })

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('input[name="agendaName"]').setValue('New Agenda')
    await wrapper.findAll('button').find((b) => b.text() === 'Créer')?.trigger('click')
    await flushPromises()

    expect(httpClient.post).toHaveBeenCalledWith(`/api/agendas/${FAMILY_ID}`, { name: 'New Agenda' })
    expect(wrapper.text()).toContain('New Agenda')
  })

  it('does not call createAgenda when clicking Cancel in the dialog', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Annuler')?.trigger('click')
    await flushPromises()

    expect(httpClient.post).not.toHaveBeenCalledWith(`/api/agendas/${FAMILY_ID}`, expect.any(Object))
  })

  it('shows the invite link in the add member dialog', async () => {
    localStorage.setItem('token', 'test-token')
    setupAuthMocks()

    const wrapper = mount(DashboardView, {
      props: { familyId: FAMILY_ID },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain(`http://localhost:5173/login/${FAMILY_ID}/${mockMe.id}`)
  })
})
