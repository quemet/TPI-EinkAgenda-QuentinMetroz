import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AgendaPage from '@/pages/AgendaPage.vue'

vi.mock('@/services/agenda.service', () => ({
  getEvents: vi.fn(),
  getAllFamilies: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}))

import { getEvents, getAllFamilies } from '@/services/agenda.service'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/agenda/:agendaId', component: AgendaPage, props: true },
    { path: '/login', component: { template: '<div>Login</div>' } },
  ],
})

describe('AgendaPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.setItem('token', 'test-token')
    vi.clearAllMocks()
  })

  it('fetches events on mount and renders them in the calendar', async () => {
    vi.mocked(getEvents).mockResolvedValue([
      {
        id: '1',
        name: 'Event 1',
        description: 'Description 1',
        type: 'Type 1',
        startDatetime: new Date().toISOString(),
        endDatetime: new Date(Date.now() + 3600000).toISOString(),
      },
    ])
    vi.mocked(getAllFamilies).mockResolvedValue([])

    const wrapper = mount(AgendaPage, {
      props: { agendaId: 'test-agenda-id' },
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(getEvents).toHaveBeenCalledWith('test-token', 'test-agenda-id')
    expect(wrapper.text()).toContain('Event 1')
  })
})
