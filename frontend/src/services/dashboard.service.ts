import axios from 'axios'

const getAllFamilyAgenda = async (token: string, familyId: string) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/agendas/${familyId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching family agenda:', error)
    return []
  }
}

const getAllFamilyUsers = async (token: string, familyId: string) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/users/family/${familyId}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const data = response.data
    return data
  } catch (error) {
    console.error('Error fetching family users:', error)
    return []
  }
}

const createAgenda = async (token: string, familyId: string, agendaName: string) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/agendas/${familyId}`,
      {
        name: agendaName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const data = response.data
    return data
  } catch (error) {
    console.error('Error creating agenda:', error)
  }
}

const modifyAgendaName = async (token: string, agendaId: string, newName: string) => {
  try {
    const res = await axios.put(
      `http://localhost:3000/api/agendas/${agendaId}`,
      { name: newName },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const data = res.data
    return data
  } catch (error) {
    console.error('Error modifying agenda name:', error)
  }
}

const deleteAgenda = async (token: string, agendaId: string) => {
  try {
    await axios.delete(`http://localhost:3000/api/agendas/${agendaId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Error deleting agenda:', error)
  }
}

const removeUserFromFamily = async (token: string, userId: string, familyId: string) => {
  try {
    await axios.delete(`http://localhost:3000/api/families/${familyId}/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Error removing user from family:', error)
  }
}

const changeUserRole = async (token: string, userId: string, familyId: string) => {
  try {
    await axios.post(
      `http://localhost:3000/api/families/${familyId}/admins`,
      { userId: userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
  } catch (error) {
    console.error('Error changing user role:', error)
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
}
