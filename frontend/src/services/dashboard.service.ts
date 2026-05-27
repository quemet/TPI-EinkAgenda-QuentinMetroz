import httpClient from './httpclient'

const getAllFamilyAgenda = async (token: string, familyId: string) => {
  try {
    const response = await httpClient.get(`/api/agendas/${familyId}`)
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching family agenda:', error)
    return []
  }
}

const getAllFamilyUsers = async (token: string, familyId: string) => {
  try {
    const response = await httpClient.get(`/api/users/family/${familyId}/users`)
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching family users:', error)
    return []
  }
}

const createAgenda = async (token: string, familyId: string, agendaName: string) => {
  try {
    const response = await httpClient.post(`/api/agendas/${familyId}`, {
      name: agendaName,
    })
    const data = response.data
    return data
  } catch (error) {
    console.error('Error creating agenda:', error)
  }
}

const modifyAgendaName = async (token: string, agendaId: string, newName: string) => {
  try {
    const res = await httpClient.put(`/api/agendas/${agendaId}`, {
      name: newName,
    })
    const data = res.data
    return data
  } catch (error) {
    console.error('Error modifying agenda name:', error)
  }
}

const deleteAgenda = async (token: string, agendaId: string) => {
  try {
    await httpClient.delete(`/api/agendas/${agendaId}`)
  } catch (error) {
    console.error('Error deleting agenda:', error)
  }
}

const removeUserFromFamily = async (userId: string, familyId: string) => {
  try {
    await httpClient.delete(`/api/families/${familyId}/users/${userId}`)
  } catch (error) {
    console.error('Error removing user from family:', error)
  }
}

const changeUserRole = async (userId: string, familyId: string) => {
  try {
    await httpClient.post(`/api/families/${familyId}/admins`, { userId: userId })
  } catch (error) {
    console.error('Error changing user role:', error)
  }
}

const getMe = async (token: string) => {
  try {
    const response = await httpClient.get(`/api/users/me`)
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export {
  getAllFamilyAgenda,
  getAllFamilyUsers,
  createAgenda,
  modifyAgendaName,
  deleteAgenda,
  removeUserFromFamily,
  changeUserRole,
  getMe,
}
