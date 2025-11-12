export default defineNuxtRouteMiddleware((to, __from) => {
    const auth = useAuth();

    const publicRoutes = ['/', '/login', '/dashboard'];

    if (!publicRoutes.includes(to.path) && !auth.isAuthenticated.value) {
        return navigateTo('/login');
    }
});
