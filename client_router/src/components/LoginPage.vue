<template>
    <div class="flex justify-center items-center h-screen">
        <div class="bg-white p-8 md:p-32 rounded shadow-md">
            <img src="deskora-logo-transparent.png" alt="Deskora" class="w-64 mx-auto mb-4 md:mb-8" />
            <div class="mb-4 md:mb-8">
                <label for="email" class="block text-gray-700 text-sm md:text-base font-bold mb-2">Email</label>
                <input type="email" id="email" v-model="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" required />
            </div>
            <div class="mb-4 md:mb-8">
                <label for="password" class="block text-gray-700 text-sm md:text-base font-bold mb-2">Password</label>
                <input type="password" id="password" v-model="password" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" required />
            </div>
            <div v-if="errorMessage" class="p-4 mb-4 text-red-500 bg-red-100 rounded">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="p-4 mb-4 text-green-500 bg-green-100 rounded">
                {{ successMessage }}
            </div>
            <div v-show="!register">
                <button type="submit" @click="handleLogin" class="w-full bg-blue-500 text-white md:text-lg py-2 px-4 rounded hover:bg-blue-600 mb-4 md:mb-8">Login</button>
                <div class="text-center">
                    <a href="#" @click="handleRegister" class="text-gray-700 text-sm md:text-base font-bold">Register</a>
                </div>
            </div>
            <div v-show="register">
                <button type="submit" @click="handleRegisteration" class="w-full bg-red-500 text-white md:text-lg py-2 px-4 rounded hover:bg-red-600 mb-4 md:mb-8">Register</button>
                <div class="text-center">
                    <a href="#" @click="handleRegister" class="text-gray-700 text-sm md:text-base font-bold">Login</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const register = ref(false);

function handleLogin() {
    store
        .dispatch("login", { email: email.value, password: password.value })
        .then(() => {
            if (store.state.isAuthenticated) {
                router.push({ name: "Home" });
            } else {
                errorMessage.value = "Login failed. Please check your credentials.";
            }
        })
        .catch(() => {
            errorMessage.value = "There was a problem processing your request.";
        });
}

function handleRegister() {
    register.value = !register.value;
    errorMessage.value = "";
}

function handleRegisteration() {
    store
        .dispatch("register", { email: email.value, password: password.value })
        .then(() => {
            if (store.state.isAuthenticated) {
                handleRegister();
                successMessage.value = "Registration successful. Please login.";
            } else {
                errorMessage.value = "Registration failed. Please try again.";
            }
        })
        .catch(() => {
            errorMessage.value = "There was a problem processing your request.";
        });
}
</script>
