import httpClient from './httpclient'

export const getFamilies = async (token: string) => {
  try {
    const res = await httpClient.get('/api/families')
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
  const results = await Promise.all(
    families.map(async (fam) => {
      try {
        const agendaRes = await httpClient.get(`/api/agendas/${fam.id}`)
        return agendaRes.data
      } catch {
        console.info(`No agendas found for family ${fam.name}`)
        return null
      }
    }),
  )
  return results.filter(Boolean)
}

export const getUserInfo = async (token: string) => {
  try {
    const res = await httpClient.get('/api/users/me')
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
    const res = await httpClient.post('/api/families', { name: familyName })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating family:', error.message)
    } else {
      console.error('Unknown error creating family:', error)
    }
  }
}
