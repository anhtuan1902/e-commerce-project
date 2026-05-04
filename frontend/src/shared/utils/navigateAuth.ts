import type { NavigateFunction, Location } from 'react-router-dom';

const navigateAuth = (navigate: NavigateFunction, location: Location): void => {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirectPath}`, { replace: true });
};

export default navigateAuth;