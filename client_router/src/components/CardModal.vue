<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <!-- UPDATE MODAL -->
        <div v-if="!reserveModal" class="bg-white p-4 rounded-lg max-w-lg w-full mx-4">
            <h2 class="text-lg font-bold mb-2">{{ booking.locationDetails.locationName }}</h2>
            <p>{{ booking.locationDetails.address }}</p>
            <!-- Form to update booking times -->
            <form @submit.prevent="updateBooking">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-gray-700">Start:</label>
                    <input
                        type="datetime-local"
                        v-model="newBookStart"
                        class="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-gray-700">End:</label>
                    <input
                        type="datetime-local"
                        v-model="newBookEnd"
                        class="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div v-if="errorMessage" class="text-red-500 border border-red-500 p-2 rounded my-2">
                    {{ errorMessage }}
                </div>
                <div class="mt-4 text-right">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Booking</button>
                </div>
            </form>
            <button @click="cancelBooking" class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-2 rounded">Cancel Booking</button>
            <button @click="close" class="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>

        <!-- CREATE MODAL -->
        <div v-if="reserveModal" class="bg-white p-4 rounded-lg max-w-lg w-full mx-4">
            <h2 class="text-lg font-bold mb-2">{{ booking.locationName }}</h2>
            <p>{{ booking.address }}</p>
            <!-- Form to update booking times -->
            <form @submit.prevent="createBooking">
                <div class="mt-2">
                    <label class="block text-sm font-medium text-gray-700">Start:</label>
                    <input
                        type="datetime-local"
                        v-model="newBookStart"
                        class="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div class="mt-2">
                    <label class="block text-sm font-medium text-gray-700">End:</label>
                    <input
                        type="datetime-local"
                        v-model="newBookEnd"
                        class="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div v-if="errorMessage" class="text-red-500 border border-red-500 p-2 rounded my-2">
                    {{ errorMessage }}
                </div>
                <div class="mt-4 text-right">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Booking</button>
                </div>
            </form>
            <button @click="close" class="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { watch } from "vue";

const props = defineProps({
    booking: Object,
    isOpen: Boolean,
    reserveModal: Boolean,
    errorMessage: String,
});

const emit = defineEmits(["update:isOpen", "update:errorMessage", "updateBooking", "cancelBooking", "createBooking"]);

const newBookStart = ref("");
const newBookEnd = ref("");

watch(
    () => props.booking,
    (newBooking) => {
        if (newBooking && props.isOpen) {
            newBookStart.value = newBooking.book_start;
            newBookEnd.value = newBooking.book_end;
        }
    },
    { immediate: true }
);

const close = () => {
    emit("update:isOpen", false);
    emit("update:errorMessage", "");
};

const updateBooking = () => {
    emit("updateBooking", { locationID: props.booking.locationID, bookStart: newBookStart.value, bookEnd: newBookEnd.value });
};

const createBooking = () => {
    emit("createBooking", { locationID: props.booking.locationID, bookStart: newBookStart.value, bookEnd: newBookEnd.value });
};

const cancelBooking = () => {
    emit("cancelBooking", props.booking);
    close();
};
</script>
