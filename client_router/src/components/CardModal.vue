<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div class="bg-white p-4 rounded-lg max-w-lg w-full mx-4">
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
                <div class="mt-4 text-right">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Booking</button>
                </div>
            </form>
            <button @click="cancelBooking" class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-2 rounded">Cancel Booking</button>
            <button @click="close" class="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
    booking: Object,
    isOpen: Boolean,
});

const emit = defineEmits(["update:isOpen", "updateBooking", "cancelBooking"]);

// Reactive properties for form inputs, initialized later
const newBookStart = ref("");
const newBookEnd = ref("");

// Watch the booking prop to update input fields when the booking or modal open state changes
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
};

const updateBooking = () => {
    emit("updateBooking", { id: props.booking.locationID, newStart: newBookStart.value, newEnd: newBookEnd.value });
    close(); // Optionally close the modal after update
};

const cancelBooking = () => {
    emit("cancelBooking", props.booking);
    close(); // Optionally close the modal after cancellation
};
</script>
