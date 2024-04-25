<template>
    <main class="bg-gray-100 py-16">
        <div class="container mx-auto">
            <div v-if="successMessage" class="flex justify-between items-center p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                <span>{{ successMessage }}</span>
                <button @click="clearSuccessMessage" class="text-green-700 hover:text-green-900 dark:hover:text-green-800 focus:outline-none">
                    <span class="fas fa-times"></span>
                </button>
            </div>
            <div class="flex flex-col md:flex-row items-center justify-between pb-4 border-b-2">
                <RouterLink to="/profile" class="w-full md:w-1/2 lg:w-1/3 cursor" v-show="recentlyBooked && recentlyBooked.locationDetails">
                    <h1 class="text-3xl font-bold" v-if="$store.state.user">Recently Booked for {{ $store.state.user.email }}</h1>
                    <div class="w-full my-5">
                        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div class="h-56 flex justify-center items-center">
                                <img :src="recentlyBooked.locationDetails?.image || '/img/no-location.webp'" class="w-full h-full object-cover" />
                            </div>
                            <!-- onclick modal view -->
                            <div class="p-4">
                                <h3 class="text-lg font-semibold">{{ recentlyBooked.locationDetails?.locationName }}</h3>
                                <p class="text-gray-700">{{ recentlyBooked.locationDetails?.address }}</p>
                                <p class="text-gray-700 mb-4">{{ formatDate(recentlyBooked?.book_start) }} to {{ formatDate(recentlyBooked?.book_end) }}</p>
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
                </RouterLink>
                <div :class="{ 'w-full': !recentlyBooked.locationDetails, 'w-full md:w-1/2 lg:w-2/3 px-5': recentlyBooked.locationDetails }">
                    <div class="border p-4 rounded-lg">
                        <div class="flex justify-between mb-4">
                            <button
                                class="py-2 px-4 font-semibold rounded-lg focus:outline-none"
                                :class="{ 'bg-blue-500': selectedType === 'desks', 'text-white': selectedType === 'desks' }"
                                id="desks"
                                @click="selectType('desks')"
                            >
                                Desks
                            </button>
                            <button
                                class="py-2 px-4 font-semibold rounded-lg focus:outline-none"
                                :class="{ 'bg-blue-500': selectedType === 'meetingRooms', 'text-white': selectedType === 'meetingRooms' }"
                                id="meetingRooms"
                                @click="selectType('meetingRooms')"
                            >
                                Meeting Rooms
                            </button>
                            <button
                                class="py-2 px-4 font-semibold rounded-lg focus:outline-none"
                                :class="{ 'bg-blue-500': selectedType === 'privateOffice', 'text-white': selectedType === 'privateOffice' }"
                                id="privateOffice"
                                @click="selectType('privateOffice')"
                            >
                                Private Office
                            </button>
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
                                        <input type="text" class="form-input block w-full rounded-l-md border-r-0 pl-2 border-gray-300 shadow-sm" />
                                        <button class="bg-gray-200 rounded-r-md p-2">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </label>
                            </div>
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Amenities</span>
                                    <select class="form-select block w-full rounded-md border-gray-300 shadow-sm p-2 mt-1">
                                        <option v-for="option in amenitiesOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
                                    </select>
                                </label>
                            </div>
                            <div class="px-2 w-1/2">
                                <label class="block">
                                    <span class="text-sm">Sort By</span>
                                    <select class="form-select block w-full rounded-md border-gray-300 shadow-sm p-2 mt-1">
                                        <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="handleSearch">Search</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- suggestions / search section -->
            <div v-if="searchQuery" class="text-3xl my-4">Suggestions</div>
            <div v-if="!searchQuery" class="text-3xl my-4">Search</div>
            <div class="flex flex-wrap -mx-2">
                <div class="w-full md:w-1/2 lg:w-1/3 px-2 my-2 cursor-pointer" v-for="item in bookData" :key="item" @click="showModal(item)">
                    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div class="h-56 flex justify-center items-center">
                            <img :src="item.image || '/img/no-location.webp'" class="w-full h-full object-cover" />
                        </div>
                        <!-- onclick modal view -->
                        <div class="p-4">
                            <h3 class="text-lg font-semibold">{{ item.locationName }}</h3>
                            <p class="text-gray-700">{{ item.address }}</p>
                            <p class="text-gray-700 mb-4"><i>Available Next:</i> {{ formatDate(item.soonestDateAvailable) }}</p>
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
                <Modal
                    :booking="selectedBooking"
                    :isOpen="modalOpen"
                    :reserveModal="true"
                    :error-message="errorMessage"
                    @update:isOpen="modalOpen = $event"
                    @update:errorMessage="errorMessage = $event"
                    @createBooking="handleCreateBooking"
                />
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeMount } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";

import Modal from "./CardModal.vue";

// State management
const store = useStore();
const user = computed(() => store.state.user);

const bookData = ref([]);
const loading = ref(false);
const error = ref(null);
const recentlyBooked = ref([]); // To store the recently booked data

const selectedBooking = ref(null);
const modalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const amenitiesOptions = ref([
    { id: "wifi", name: "Wi-Fi" },
    { id: "parking", name: "Parking" },
    { id: "coffee", name: "Free Coffee" },
    { id: "conference", name: "Conference Room" },
]);

const sortOptions = ref([
    { id: "priceLowHigh", name: "Price: Low to High" },
    { id: "priceHighLow", name: "Price: High to Low" },
    { id: "ratingHighLow", name: "Rating: High to Low" },
    { id: "ratingLowHigh", name: "Rating: Low to High" },
]);

const selectedType = ref("");

const searchQuery = ref("false");

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

const showModal = (booking) => {
    successMessage.value = "";
    errorMessage.value = "";

    // Function to get today's date in the required format for datetime-local input
    const getTodayFormatted = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

    // Check if the provided date string is valid; if not, use today's date
    const getValidDate = (dateStr) => {
        if (!dateStr || dateStr === "No Bookings Found" || !isValid(parseISO(dateStr))) {
            return getTodayFormatted();
        }
        return format(parseISO(dateStr), "yyyy-MM-dd'T'HH:mm");
    };

    // Use soonestDateAvailable if valid, otherwise fallback to today's date
    const bookStart = getValidDate(booking.soonestDateAvailable);

    // Update selectedBooking with the new or fallback date
    selectedBooking.value = { ...booking, book_start: bookStart };
    modalOpen.value = true;
};

const clearSuccessMessage = () => {
    successMessage.value = "";
};

const handleCreateBooking = async (passedBooking) => {
    loading.value = true;
    error.value = null;
    successMessage.value = "";

    try {
        await axios.post("/createBooking", {
            email: user.value.email,
            locationID: passedBooking.locationID,
            book_start: passedBooking.bookStart,
            book_end: passedBooking.bookEnd,
        });
        modalOpen.value = false;
        successMessage.value = "Booking created successfully!";
        fetchBookData();
        getRecentlyBooked();
    } catch (err) {
        error.value = "Failed to create booking: " + err.message;
        errorMessage.value = err.response ? `Failed to create booking: ${err.response.data}` : "Failed to create booking due to an unknown error";
    } finally {
        loading.value = false;
    }
};

// Function to format date or return the input if it's a non-date string
function formatDate(dateStr) {
    try {
        const date = parseISO(dateStr); // Parses the date string into a Date object
        return format(date, "PPpp"); // 'PPpp' is a date-fns format that represents "Date and Time"
    } catch (error) {
        return dateStr; // Return the original string if parsing fails
    }
}

const selectType = (type) => {
    selectedType.value = type;
};

const handleSearch = () => {
    searchQuery.value = !searchQuery.value;
};

// Component initialization
onBeforeMount(async () => {
    await nextTick();
    await fetchBookData(); // TODO: instead of getting all the bookdata, find a way to get only needed data.
    await getRecentlyBooked();
});
</script>
