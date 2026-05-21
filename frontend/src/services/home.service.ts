import axios from 'axios'

export const getFamilies = async (token: string) => {
  try {
    const res = await axios.get('http://localhost:3000/api/families', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching families:', error.message)
    } else {
      console.error('Unknown error fetching families:', error)
    }
  }
}

export const getAllAgendas = async (token: string, families: { id: string; name: string }[]) => {
  return await Promise.all(
    families.map(async (fam) => {
      try {
        const agendaRes = await axios.get(`http://localhost:3000/api/agendas/${fam.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const agenda = agendaRes.data
        return agenda
      } catch {
        console.info(`No agendas found for family ${fam.name}`)
      }
    }),
  )
}

export const getUserInfo = async (token: string) => {
  try {
    const res = await axios.get('http://localhost:3000/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching user info:', error.message)
    } else {
      console.error('Unknown error fetching user info:', error)
    }
  }
}

export const createFamily = async (familyName: string, token: string) => {
  try {
    const res = await axios.post(
      'http://localhost:3000/api/families',
      { name: familyName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating family:', error.message)
    } else {
      console.error('Unknown error creating family:', error)
    }
  }
}
