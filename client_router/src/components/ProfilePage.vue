<template>
    <div class="container mx-auto p-4">
        <div class="mb-8">
            <h2 class="text-lg font-bold">Your Bookings</h2>
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" v-if="bookings.length > 0">
                    <div v-for="booking in bookings" :key="booking.locationID" class="bg-white rounded-lg shadow-md overflow-hidden" @click="showModal(booking)">
                        <img :src="booking.locationDetails.image || '/img/no-location.webp'" class="w-full h-48 object-cover" />
                        <div class="p-4">
                            <h3 class="text-lg font-semibold">{{ booking.locationDetails.locationName }}</h3>
                            <p class="text-gray-600">{{ booking.locationDetails.address }}</p>
                            <p class="text-gray-500 text-sm">Available from: {{ booking.locationDetails.soonestDateAvailable }}</p>
                            <!-- TODO: change soonestDateAvailable on endpoint on bookings or update to bookings. -->
                            <div class="mt-4">
                                <div class="text-sm text-gray-700">
                                    <span>Booking Start: </span>
                                    <span class="font-medium">{{ booking.book_start }}</span>
                                    <!-- TODO: format the date text to look more normal -->
                                </div>
                                <div class="text-sm text-gray-700">
                                    <span>Booking End: </span>
                                    <span class="font-medium">{{ booking.book_end }}</span>
                                    <!-- TODO: format the date text to look more normal -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal :booking="selectedBooking" :isOpen="modalOpen" @update:isOpen="modalOpen = $event" @cancelBooking="handleCancelBooking" @updateBooking="handleUpdateBooking" />
                </div>
            </div>
        </div>

        <div class="mb-8">
            <h1 class="text-xl font-bold">Profile Page</h1>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    :placeholder="$store.state.user.email"
                    v-model="email"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            <button @click="updateProfile" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Update Profile</button>
        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";

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

const showModal = (booking) => {
    selectedBooking.value = booking;
    modalOpen.value = true;
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

const updateProfile = () => {
    // TODO: need to implement the update profile functionality
    console.log("Update profile with:", email.value, password.value);
};

const handleCancelBooking = async (passedBooking) => {
    loading.value = true;
    error.value = null;
    try {
        const params = new URLSearchParams({
            id: passedBooking.locationDetails.locationID,
            email: encodeURIComponent(user.value.email),
        }).toString();

        // Make the DELETE request with query parameters
        await axios.delete(`/delbookings?${params}`);
        alert("Booking deleted successfully!");
        fetchBookings();
    } catch (err) {
        error.value = "Failed to delete booking: " + err.message;
        alert("Failed to delete booking: " + err.message);
    } finally {
        loading.value = false;
    }
};

const handleUpdateBooking = async (passedBooking) => {
    // TODO: need to make sure bookings get updated past the current date and to check if the booking is available.
    console.log(passedBooking);
    try {
        await axios.patch("/updateBooking", {
            email: user.value.email,
            locationID: passedBooking.id,
            newStart: passedBooking.newStart,
            newEnd: passedBooking.newEnd,
        });
        alert("Booking updated successfully!");
        fetchBookings();
    } catch (error) {
        console.error("Failed to update booking:", error);
        alert("Failed to update booking: " + error.message);
    }
};

onBeforeMount(fetchBookings);
</script>
