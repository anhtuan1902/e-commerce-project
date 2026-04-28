import { useAuthStore } from "@/store/auth.store";


const useCheckRole = ({ role }: { role: string }) => {
    const userRole = useAuthStore((state) => state.user?.role);

    if (!userRole) {
        return false;
    }

    if (userRole !== role) {
        return false;
    }

    return true;
}

export default useCheckRole
