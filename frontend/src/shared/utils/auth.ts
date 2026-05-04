import { getToken, isTokenValid } from '../services/jwt.services'

const isAuthenticated = () => {
    return !!isTokenValid(getToken())
}

export default isAuthenticated
