<template>
    <div class="container mx-auto p-4">
        <div class="mb-8">
            <div class="mx-auto px-4 sm:px-6 lg:px-8 my-10">
                <h2 class="text-2xl font-bold mb-4">Your Bookings</h2>
                <div v-if="successMessage" class="flex justify-between items-center p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                    <span>{{ successMessage }}</span>
                    <button @click="clearSuccessMessage" class="text-green-700 hover:text-green-900 dark:hover:text-green-800 focus:outline-none">
                        <span class="fas fa-times"></span>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-if="bookings.length > 0">
                    <div v-for="booking in bookings" :key="booking.locationID" class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" @click="showModal(booking)">
                        <img :src="booking.locationDetails.image || '/img/no-location.webp'" class="w-full h-48 object-cover" />
                        <div class="p-4">
                            <h3 class="text-lg font-semibold">{{ booking.locationDetails.locationName }}</h3>
                            <p class="text-gray-600">{{ booking.locationDetails.address }}</p>
                            <p class="text-gray-500 text-sm">Available from: {{ formatDate(booking.locationDetails.soonestDateAvailable) }}</p>
                            <div class="mt-4">
                                <div class="text-sm text-gray-700">
                                    <span>Booking Start: </span>
                                    <span class="font-medium">{{ formatDate(booking.book_start) }}</span>
                                </div>
                                <div class="text-sm text-gray-700">
                                    <span>Booking End: </span>
                                    <span class="font-medium">{{ formatDate(booking.book_end) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    :booking="selectedBooking"
                    :isOpen="modalOpen"
                    :reserveModal="false"
                    :error-message="errorMessage"
                    @update:isOpen="modalOpen = $event"
                    @update:errorMessage="errorMessage = $event"
                    @cancelBooking="handleCancelBooking"
                    @updateBooking="handleUpdateBooking"
                />
            </div>
        </div>

        <div class="mx-auto px-4 sm:px-6 lg:px-8 my-10">
            <h1 class="text-2xl font-bold">Profile Page</h1>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    :placeholder="$store.state.user.email"
                    v-model="email"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    v-if="$store.state.user"
                    disabled
                />
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    placeholder="********"
                    v-model="password"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div v-if="successUserUpdateMessage" class="text-green-500 border border-green-500 p-2 rounded my-2">
                {{ successUserUpdateMessage }}
            </div>
            <div v-if="errorUserUpdateMessage" class="text-red-500 border border-red-500 p-2 rounded my-2">
                {{ errorUserUpdateMessage }}
            </div>
            <button @click="updateProfile" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Update Profile</button>
        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { parseISO, format } from "date-fns";

import Modal from "./CardModal.vue";

// State management
const store = useStore();
const user = computed(() => store.state.user);

const email = ref("");
const password = ref("");
const bookings = ref([]);
const loading = ref(false);
const error = ref(null);

const selectedBooking = ref(null);
const modalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const successUserUpdateMessage = ref("");
const errorUserUpdateMessage = ref("");

const showModal = (booking) => {
    clearAllMessages();
    selectedBooking.value = booking;
    modalOpen.value = true;
};

const clearSuccessMessage = () => {
    successMessage.value = "";
};

const fetchBookings = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axios.get(`/bookings?email=${encodeURIComponent(user.value.email)}`);
        bookings.value = response.data;
    } catch (err) {
        error.value = "Failed to fetch bookings: " + err.message;
    } finally {
        loading.value = false;
    }
};

const updateProfile = async () => {
    if (!store.state.user.email || !password.value) {
        errorUserUpdateMessage.value = "Email and password are required.";
        return;
    }

    clearAllMessages();
    loading.value = true;
    error.value = null;
    try {
        await axios.patch("/updateProfile", {
            email: store.state.user.email,
            newPassword: password.value,
        });
        successUserUpdateMessage.value = "Profile updated successfully!";
    } catch (err) {
        errorUserUpdateMessage.value = "Failed to update profile: " + err.message;
        console.log("Error updating profile:", err);
    } finally {
        loading.value = false;
    }
};

const handleCancelBooking = async (passedBooking) => {
    loading.value = true;
    error.value = null;
    clearAllMessages();
    try {
        const params = new URLSearchParams({
            id: passedBooking.locationDetails.locationID,
            email: encodeURIComponent(user.value.email),
        }).toString();

        // Make the DELETE request with query parameters
        await axios.delete(`/delbookings?${params}`);
        successMessage.value = "Booking deleted successfully!";
        fetchBookings();
    } catch (err) {
        error.value = "Failed to delete booking: " + err.message;
        errorMessage.value = err.response ? `Failed to delete booking: ${err.response.data}` : "Failed to delete booking due to an unknown error";
    } finally {
        loading.value = false;
    }
};

const handleUpdateBooking = async (passedBooking) => {
    clearAllMessages();
    try {
        await axios.patch("/updateBooking", {
            email: user.value.email,
            locationID: passedBooking.locationID,
            newStart: passedBooking.bookStart,
            newEnd: passedBooking.bookEnd,
        });
        modalOpen.value = false;
        successMessage.value = "Booking updated successfully!";
        fetchBookings();
    } catch (err) {
        console.error("Failed to update booking:", err);
        errorMessage.value = err.response ? `Failed to update booking: ${err.response.data}` : "Failed to update booking due to an unknown error";
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

const clearAllMessages = () => {
    successMessage.value = "";
    successUserUpdateMessage.value = "";
    errorMessage.value = "";
    errorUserUpdateMessage.value = "";
};

onBeforeMount(fetchBookings);
</script>
