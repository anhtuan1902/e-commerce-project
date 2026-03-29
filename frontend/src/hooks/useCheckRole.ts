import { useAppSelector } from ".";


const useCheckRole = ({ role }: { role: string }) => {
    const userRole = useAppSelector(state => state.auth.user?.role);

    if (!userRole) {
        return false;
    }

    if (userRole !== role) {
        return false;
    }

    return true;
}

export default useCheckRole
