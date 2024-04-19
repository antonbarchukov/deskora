<template>
    <header class="sticky top-0 bg-gray-900 text-white py-4">
        <div class="container mx-auto px-4">
            <nav class="flex justify-between items-center">
                <RouterLink to="/home" class="text-xl font-bold">
                    <img src="deskora-logo.png" class="w-32 md:w-64 mx-auto" alt="Deskora" />
                </RouterLink>
                <ul class="relative flex flex-row items-center">
                    <input
                        type="search"
                        id="d-search"
                        class="pl-10 p-2 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search..."
                        required
                    />
                    <i class="fas fa-search absolute left-2 text-gray-400 text-sm"></i>
                    <li class="ml-2">
                        <RouterLink to="/profile">
                            <span class="p-2 hover:text-gray-300"><i class="fa-regular fa-user"></i></span>
                        </RouterLink>
                    </li>
                    <li class="ml-2">
                        <span @click="handleLogout" class="p-2 hover:text-gray-300 cursor-pointer"><i class="fa fa-sign-out"></i></span>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

function handleLogout() {
    store.dispatch("logout");
    router.push("/login");
}
</script>
