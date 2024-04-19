const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());

app.use(bodyParser.json());

const USERS_FILE = "./users.json";
const LOCATIONS_FILE = "./locations.json";
const BOOKINGS_FILE = "./bookings.json";

// Endpoint to get locations
app.get("/locations", (req, res) => {
    console.log("[GET /locations]");
    fs.readFile(LOCATIONS_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Unable to read locations data");
        }
        res.json(JSON.parse(data));
    });
});

app.post("/register", cors(), (req, res) => {
    console.log("[POST /register]");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("email and password are required");
    }

    // Чтение и обновление файла пользователей
    fs.readFile(USERS_FILE, (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).send("Error reading users data");
        }

        const users = data.length ? JSON.parse(data) : [];
        if (users.find((user) => user.email === email)) {
            return res.status(409).send("User already exists");
        }

        users.push({ email, password });
        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error saving user");
            }
            res.status(201).send("User registered");
        });
    });
});

// Login route
app.post("/login", cors(), (req, res) => {
    console.log("[POST /login]");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }

    fs.readFile(USERS_FILE, (err, data) => {
        if (err) {
            return res.status(500).send("Server error in reading user data");
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.email === email && u.password === password); // Ensure password handling is secure in production
        if (user) {
            res.status(200).json({
                message: "Login successful",
                user: { email: user.email },
                status: true,
            });
        } else {
            res.status(401).send("Invalid email or password");
        }
    });
});

function updateSoonestDateAvailable() {
    // Read the locations file first to initialize the soonest dates
    fs.readFile(LOCATIONS_FILE, "utf8", (err, locationData) => {
        if (err) {
            console.error("Error reading locations file:", err);
            return;
        }

        const locations = JSON.parse(locationData);
        // Initialize a map with all locations having "No Bookings Found" initially
        const locationDates = locations.reduce((acc, location) => {
            acc[location.locationID] = "No Bookings Found";
            return acc;
        }, {});

        // Read the bookings file to find the earliest date for each location that has bookings
        fs.readFile(BOOKINGS_FILE, "utf8", (err, bookingData) => {
            if (err) {
                console.error("Error reading bookings file:", err);
                return;
            }

            const bookings = JSON.parse(bookingData);
            bookings.forEach((booking) => {
                const { locationID, book_start, book_end } = booking;
                const bookingDate = new Date(book_start).toISOString();
                // Only update if there's no booking set or found a sooner booking date
                if (locationDates[locationID] === "No Bookings Found" || locationDates[locationID] > bookingDate) {
                    locationDates[locationID] = new Date(book_end).toISOString();
                }
            });

            // Apply the computed dates to the locations array
            locations.forEach((location) => {
                location.soonestDateAvailable = locationDates[location.locationID];
            });

            // Write the updated locations back to the locations file
            fs.writeFile(LOCATIONS_FILE, JSON.stringify(locations, null, 2), (err) => {
                if (err) {
                    console.error("Error writing to locations file:", err);
                } else {
                    console.log("Updated locations with soonest available dates successfully.");
                }
            });
        });
    });
}

// Booking route
app.post("/createbooking", (req, res) => {
    console.log("[POST /createbooking]");
    console.log(req.body);
    const { email, locationID, book_start, book_end } = req.body;

    if (!email || !locationID || !book_start || !book_end) {
        console.log(email, locationID, book_start, book_end);
        return res.status(400).send("Email, location ID, book start, and book end times are required");
    }

    // Convert book_start and book_end to Date objects for easier comparison
    const newStart = new Date(book_start);
    const newEnd = new Date(book_end);
    const currentDate = new Date();

    // Check if the booking start date is in the past
    if (newStart < currentDate) {
        return res.status(400).send("Booking start time must be in the future.");
    }

    if (newStart >= newEnd) {
        return res.status(400).send("The start time must be before the end time");
    }

    fs.readFile(USERS_FILE, "utf8", (err, usersData) => {
        if (err) {
            return res.status(500).send("Error reading users data");
        }

        const users = JSON.parse(usersData);
        const userExists = users.some((user) => user.email === email);

        if (!userExists) {
            return res.status(404).send("User does not exist");
        }

        fs.readFile(BOOKINGS_FILE, "utf8", (err, bookingsData) => {
            if (err) {
                return res.status(500).send("Error reading bookings data");
            }

            const bookings = bookingsData.length ? JSON.parse(bookingsData) : [];
            const overlappingBooking = bookings.find((booking) => booking.locationID === locationID && new Date(booking.book_start) < newEnd && new Date(booking.book_end) > newStart);

            if (overlappingBooking) {
                return res.status(400).send("This booking overlaps with another existing booking.");
            }

            bookings.push({ email, locationID, book_start, book_end });
            fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (err) => {
                if (err) {
                    return res.status(500).send("Error saving booking");
                }
                updateSoonestDateAvailable();
                res.status(201).send("Booking created successfully");
            });
        });
    });
});

// return bookings for a specific email
app.get("/bookings", (req, res) => {
    console.log("[GET /bookings]");
    const email = req.query.email;
    if (!email) {
        return res.status(400).send("Email parameter is required");
    }

    fs.readFile(USERS_FILE, "utf8", (err, usersData) => {
        if (err) {
            console.error("Error reading users file:", err);
            return res.status(500).send("Unable to read users data");
        }

        const users = JSON.parse(usersData);
        const userExists = users.some((user) => user.email === email);
        if (!userExists) {
            return res.status(404).send("User does not exist");
        }

        fs.readFile(BOOKINGS_FILE, "utf8", (err, bookingsData) => {
            if (err) {
                console.error("Error reading bookings file:", err);
                return res.status(500).send("Unable to read bookings data");
            }

            const bookings = JSON.parse(bookingsData);
            const userBookings = bookings.filter((booking) => booking.email === email);

            if (userBookings.length === 0) {
                // Send an empty object or array with a specific message
                return res.json({ message: "No bookings found for this user", bookings: [] });
            }

            fs.readFile(LOCATIONS_FILE, "utf8", (err, locationsData) => {
                if (err) {
                    console.error("Error reading locations file:", err);
                    return res.status(500).send("Unable to read locations data");
                }

                const locations = JSON.parse(locationsData);
                const bookingsWithLocationDetails = userBookings.map((booking) => {
                    const locationDetails = locations.find((location) => location.locationID === booking.locationID);
                    return {
                        ...booking,
                        locationDetails: locationDetails || "Location details not found",
                    };
                });

                res.json(bookingsWithLocationDetails);
            });
        });
    });
});

// return latest only booking for a specific email
app.get("/mostrecentbooking", (req, res) => {
    console.log("[GET /mostrecentbooking]");
    const email = req.query.email;
    if (!email) {
        return res.status(400).send("Email parameter is required");
    }

    fs.readFile(USERS_FILE, "utf8", (err, usersData) => {
        if (err) {
            console.error("Error reading users file:", err);
            return res.status(500).send("Unable to read users data");
        }

        const users = JSON.parse(usersData);
        const userExists = users.some((user) => user.email === email);
        if (!userExists) {
            return res.status(404).send("User does not exist");
        }

        fs.readFile(BOOKINGS_FILE, "utf8", (err, bookingsData) => {
            if (err) {
                console.error("Error reading bookings file:", err);
                return res.status(500).send("Unable to read bookings data");
            }

            const bookings = JSON.parse(bookingsData);
            const userBookings = bookings.filter((booking) => booking.email === email);

            if (userBookings.length === 0) {
                // Respond with an empty object or specific message
                return res.json({ message: "No recent bookings for this user", booking: {} });
            }

            const mostRecentBooking = userBookings.sort((a, b) => new Date(b.book_start) - new Date(a.book_start))[0];

            fs.readFile(LOCATIONS_FILE, "utf8", (err, locationsData) => {
                if (err) {
                    console.error("Error reading locations file:", err);
                    return res.status(500).send("Unable to read locations data");
                }

                const locations = JSON.parse(locationsData);
                const locationDetails = locations.find((location) => location.locationID == mostRecentBooking.locationID);

                if (!locationDetails) {
                    console.error("No location found for location ID:", mostRecentBooking.locationID);
                    return res.status(404).send("Location details not found");
                }

                const bookingWithLocation = { ...mostRecentBooking, locationDetails };
                res.json(bookingWithLocation);
            });
        });
    });
});

// Endpoint to delete a booking by booking ID and user email
app.delete("/delbookings", (req, res) => {
    console.log("[DELETE /delbookings]");
    const { email, id } = req.query; // Get email and id from request body
    if (!email || !id) {
        return res.status(400).send("Both email and booking ID are required");
    }

    fs.readFile(BOOKINGS_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading bookings file:", err);
            return res.status(500).send("Unable to read bookings data");
        }

        let bookings;
        try {
            bookings = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing bookings data:", parseError);
            return res.status(500).send("Error processing bookings data");
        }

        const bookingIndex = bookings.findIndex((booking) => booking.locationID === parseInt(id) && booking.email === email);
        if (bookingIndex === -1) {
            return res.status(404).send("No matching booking found");
        }

        // Remove the found booking from the array
        bookings.splice(bookingIndex, 1);

        // Save the updated bookings back to the file
        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to bookings file:", writeErr);
                return res.status(500).send("Failed to delete booking");
            }
            updateSoonestDateAvailable();
            res.send("Booking deleted successfully");
        });
    });
});

app.patch("/updateBooking", (req, res) => {
    console.log("[PATCH /updateBooking]");
    const { email, locationID, newStart, newEnd } = req.body;

    if (!email || !locationID || !newStart || !newEnd) {
        return res.status(400).send("All fields (email, locationID, newStart, newEnd) are required");
    }

    const start = new Date(newStart);
    const end = new Date(newEnd);

    // Validate that newStart is before newEnd
    if (start >= end) {
        return res.status(400).send("The start time must be before the end time");
    }

    fs.readFile(BOOKINGS_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading bookings file:", err);
            return res.status(500).send("Unable to read bookings data");
        }

        let bookings;
        try {
            bookings = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing bookings data:", parseError);
            return res.status(500).send("Error processing bookings data");
        }

        const bookingIndex = bookings.findIndex((booking) => booking.email === email && booking.locationID === parseInt(locationID));
        if (bookingIndex === -1) {
            return res.status(404).send("No matching booking found");
        }

        // Update the found booking with new times
        bookings[bookingIndex].book_start = newStart;
        bookings[bookingIndex].book_end = newEnd;

        // Save the updated bookings back to the file
        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to bookings file:", writeErr);
                return res.status(500).send("Failed to update booking");
            }
            updateSoonestDateAvailable(); // Ensure this function also validates dates
            res.send("Booking updated successfully");
        });
    });
});

app.patch("/updateProfile", (req, res) => {
    console.log("[PATCH /updateProfile]");
    const { email, newPassword } = req.body;

    // Validate the input
    if (!email || !newPassword) {
        return res.status(400).send("Email and new password are required.");
    }

    try {
        // Read the existing users data
        let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
        const userIndex = users.findIndex((user) => user.email === email);

        if (userIndex === -1) {
            return res.status(404).send("User not found.");
        }

        // Update the password
        users[userIndex].password = newPassword;

        // Write the updated user data back to the JSON file
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        res.send("Password updated successfully.");
    } catch (err) {
        console.error("Failed to update password:", err);
        res.status(500).send("Internal Server Error.");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
