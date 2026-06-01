import axios from 'axios'
import httpClinent from '@/services/httpclient'

const fetchFamilies = async (token: string) => {
  try {
    const res = await httpClinent.get('/api/families')
    const data = res.data
    return data
  } catch (error) {
    console.error('Error fetching families:', error)
  }
}

export default fetchFamilies
