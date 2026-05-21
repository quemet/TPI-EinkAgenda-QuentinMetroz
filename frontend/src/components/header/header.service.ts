import axios from 'axios'

const fetchFamilies = async (token: string) => {
  try {
    const res = await axios.get('http://localhost:3000/api/families', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = res.data
    return data
  } catch (error) {
    console.error('Error fetching families:', error)
  }
}

export default fetchFamilies
