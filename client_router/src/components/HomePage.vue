<template>
    <main class="bg-gray-100 py-16">
        <div class="container mx-auto">
            <div class="flex flex-col md:flex-row items-center justify-between pb-4 border-b-2">
                <div class="w-full md:w-1/2 lg:w-1/3" v-show="recentlyBooked && recentlyBooked.locationDetails">
                    <h1 class="text-xl md:text-2xl font-bold" v-if="$store.state.user">Recently Booked for {{ $store.state.user.email }}</h1>
                    <div class="w-full my-5">
                        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div class="h-56 flex justify-center items-center">
                                <img :src="recentlyBooked.locationDetails?.image || '/img/no-location.webp'" class="w-full h-full object-cover" />
                            </div>
                            <!-- onclick modal view -->
                            <div class="p-4">
                                <h3 class="text-lg font-semibold">{{ recentlyBooked.locationDetails?.locationName }}</h3>
                                <p class="text-gray-700">{{ recentlyBooked.locationDetails?.address }}</p>
                                <p class="text-gray-700 mb-4">{{ recentlyBooked?.book_start }} to {{ recentlyBooked?.book_end }}</p>
                                <div class="flex items-center">
                                    <span class="bg-gray-200 p-2 rounded-full leading-none text-center">
                                        <i class="far fa-heart"></i>
                                    </span>
                                    <div class="ml-auto">
                                        <div class="text-gray-600 text-sm flex items-center">
                                            <i class="fas fa-star text-yellow-500"></i>
                                            <span class="ml-1">5.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="{ 'w-full': !recentlyBooked.locationDetails, 'w-full md:w-1/2 lg:w-2/3 px-5': recentlyBooked.locationDetails }">
                    <div class="border p-4 rounded-lg">
                        <div class="flex justify-between mb-4">
                            <button class="py-2 px-4 font-semibold rounded-lg focus:outline-none bg-blue-500 text-white" id="desks">Desks</button>
                            <button class="py-2 px-4 font-semibold rounded-lg focus:outline-none" id="meetingRooms">Meeting Rooms</button>
                            <button class="py-2 px-4 font-semibold rounded-lg focus:outline-none" id="privateOffice">Private Office</button>
                        </div>
                        <div class="flex flex-wrap -mx-2 mb-4">
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Date</span>
                                    <div class="flex mt-1">
                                        <input type="date" class="form-input block w-full rounded-l-md border-r-0 border-gray-300 shadow-sm p-2" />
                                    </div>
                                </label>
                            </div>
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Location</span>
                                    <div class="flex mt-1">
                                        <input type="text" class="form-input block w-full rounded-l-md border-r-0 border-gray-300 shadow-sm" />
                                        <button class="bg-gray-200 rounded-r-md p-2">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </label>
                            </div>
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Amenities</span>
                                    <select class="form-select block w-full rounded-md border-gray-300 shadow-sm p-2 mt-1"></select>
                                </label>
                            </div>
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Sort By</span>
                                    <select class="form-select block w-full rounded-md border-gray-300 shadow-sm p-2 mt-1"></select>
                                </label>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Search</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- suggestions / search section -->
            <div class="text-4xl my-4">Suggestions / Search</div>
            <div class="flex flex-wrap -mx-2">
                <div class="w-full md:w-1/2 lg:w-1/3 px-2 my-2" v-for="item in bookData" :key="item">
                    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div class="h-56 flex justify-center items-center">
                            <img :src="item.image || '/img/no-location.webp'" class="w-full h-full object-cover" />
                        </div>
                        <!-- onclick modal view -->
                        <div class="p-4">
                            <h3 class="text-lg font-semibold">{{ item.locationName }}</h3>
                            <p class="text-gray-700">{{ item.address }}</p>
                            <p class="text-gray-700 mb-4">{{ item.soonestDateAvailable }}</p>
                            <div class="flex items-center">
                                <span class="bg-gray-200 p-2 rounded-full leading-none text-center">
                                    <i class="far fa-heart"></i>
                                </span>
                                <div class="ml-auto">
                                    <div class="text-gray-600 text-sm flex items-center">
                                        <i class="fas fa-star text-yellow-500"></i>
                                        <span class="ml-1">5.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeMount } from "vue";
import { useStore } from "vuex";
import axios from "axios";

// State management
const store = useStore();
const user = computed(() => store.state.user);

const bookData = ref([]);
const loading = ref(false);
const error = ref(null);
const recentlyBooked = ref([]); // To store the recently booked data

// Base URL for axios
axios.defaults.baseURL = "http://localhost:3000";

// Function to fetch location data
const fetchBookData = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axios.get("/locations");
        bookData.value = response.data;
    } catch (err) {
        error.value = "Failed to load locations: " + (err.response?.data || err.message);
        console.error("Error loading location data:", err);
    } finally {
        loading.value = false;
    }
};

// Function to fetch recently booked data
const getRecentlyBooked = async () => {
    if (!user.value || !user.value.email) {
        console.error("User email is required for fetching bookings");
        error.value = "User email is required for fetching bookings";
        return;
    }

    error.value = null;
    try {
        const response = await axios.get(`/mostrecentbooking?email=${encodeURIComponent(user.value.email)}`);
        recentlyBooked.value = response.data;
    } catch (err) {
        error.value = "Failed to load recent bookings: " + (err.response?.data || err.message);
        console.error("Error loading recent bookings:", err);
    }
};

// Component initialization
onBeforeMount(async () => {
    await nextTick();
    await fetchBookData(); // TODO: instead of getting all the bookdata, find a way to get only needed data.
    await getRecentlyBooked();
});
</script>
