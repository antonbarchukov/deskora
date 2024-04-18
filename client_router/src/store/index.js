import { createStore } from "vuex";
import axios from "axios";

export default createStore({
    state() {
        return {
            isAuthenticated: false,
            user: null, // Store user details
            token: localStorage.getItem("token") || null, // Retrieve the token from localStorage if it exists
            authError: null, // Store authentication errors
        };
    },
    mutations: {
        setAuthentication(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        setUser(state, user) {
            state.user = user;
        },
        setToken(state, token) {
            state.token = token;
            localStorage.setItem("token", token); // Store token in localStorage
        },
        setAuthError(state, error) {
            state.authError = error;
        },
        clearAuthState(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.authError = null;
            localStorage.removeItem("token"); // Clear the token from localStorage
        },
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await axios.post("http://localhost:3000/login", credentials);
                if (response.data.status) {
                    commit("setAuthentication", true);
                    commit("setUser", response.data.user); // Assuming the backend sends user details
                    commit("setToken", response.data.token);
                    commit("setAuthError", null);
                } else {
                    throw new Error("Failed to login");
                }
            } catch (error) {
                console.error("Login error:", error);
                commit("setAuthentication", false);
                commit("setAuthError", error.message || "Login failed due to server error.");
            }
        },
        async register({ commit }, userData) {
            try {
                const response = await axios.post("http://localhost:3000/register", userData);
                if (response.status === 201) {
                    commit("setAuthentication", true);
                    commit("setUser", response.data.user); // Assuming the backend sends user details
                    commit("setToken", response.data.token);
                    commit("setAuthError", null);
                } else {
                    throw new Error("Registration failed");
                }
            } catch (error) {
                console.error("Registration error:", error);
                commit("setAuthError", error.message || "Registration failed due to server error.");
            }
        },
        logout({ commit }) {
            commit("clearAuthState"); // Clear all authentication-related information
        },
    },
});
