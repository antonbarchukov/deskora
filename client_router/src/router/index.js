import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import HomePage from "../components/HomePage.vue";
import LoginPage from "../components/LoginPage.vue";
import ProfilePage from "../components/ProfilePage.vue";
import NotFoundPage from "../components/NotFoundPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", redirect: "/login" },
        { path: "/login", component: LoginPage, name: "Login" },
        { path: "/home", component: HomePage, name: "Home", meta: { requiresAuth: true } },
        { path: "/profile", component: ProfilePage, name: "Profile", meta: { requiresAuth: true } },
        { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundPage },
    ],
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (requiresAuth && !store.state.isAuthenticated) {
        next("/login");
    } else {
        next();
    }
});

export default router;
