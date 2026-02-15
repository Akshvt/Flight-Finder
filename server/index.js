import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Booking, Flight } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Serve static files from the public folder (React build output)
app.use(express.static(path.join(__dirname, 'public')));

// mongoose setup
const PORT = process.env.PORT || 6001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flightBookingDB';


// --- Mongoose Connection (Cached for Serverless) ---
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    try {
        const db = await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        cachedDb = db;
        return db;
    } catch (e) {
        console.log(`Error in db connection ${e}`);
        throw e;
    }
}

// Connect to DB on every request (Vercel reuses the warm instance)
app.use(async (req, res, next) => {
    // Only connect for API routes to save time on static files
    if (req.path.startsWith('/api')) {
        await connectToDatabase();
    }
    next();
});

// --- API Routes ---

// Register route
app.post('/api/register', async (req, res) => {
    const { username, email, usertype, password } = req.body;
    let approval = 'approved';
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (usertype === 'flight-operator') {
            approval = 'not-approved'
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username, email, usertype, password: hashedPassword, approval
        });
        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        } else {
            return res.json(user);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// Approve flight operator
app.post('/api/approve-operator', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        user.approval = 'approved';
        await user.save();
        res.json({ message: 'approved!' })
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Reject flight operator
app.post('/api/reject-operator', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        user.approval = 'rejected';
        await user.save();
        res.json({ message: 'rejected!' })
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Fetch user
app.get('/api/fetch-user/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        const user = await User.findById(req.params.id);
        res.json(user);

    } catch (err) {
        console.log(err);
    }
});

// Fetch all users
app.get('/api/fetch-users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);

    } catch (err) {
        res.status(500).json({ message: 'error occurred' });
    }
});

// Add flight
app.post('/api/add-flight', async (req, res) => {
    const { flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats } = req.body;
    try {
        const flight = new Flight({ flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats });
        await flight.save();
        res.json({ message: 'flight added' });

    } catch (err) {
        console.log(err);
    }
});

// Update flight
app.put('/api/update-flight', async (req, res) => {
    const { _id, flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats } = req.body;
    try {
        const flight = await Flight.findById(_id)

        flight.flightName = flightName;
        flight.flightId = flightId;
        flight.origin = origin;
        flight.destination = destination;
        flight.departureTime = departureTime;
        flight.arrivalTime = arrivalTime;
        flight.basePrice = basePrice;
        flight.totalSeats = totalSeats;

        await flight.save();

        res.json({ message: 'flight updated' });

    } catch (err) {
        console.log(err);
    }
});

// Fetch flights
app.get('/api/fetch-flights', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json(flights);

    } catch (err) {
        console.log(err);
    }
});

// Fetch flight
app.get('/api/fetch-flight/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        const flight = await Flight.findById(req.params.id);
        res.json(flight);

    } catch (err) {
        console.log(err);
    }
});

// Fetch all bookings
app.get('/api/fetch-bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);

    } catch (err) {
        console.log(err);
    }
});

// Book ticket
app.post('/api/book-ticket', async (req, res) => {
    const { user, flight, flightName, flightId, departure, destination, email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass } = req.body;
    try {
        const bookings = await Booking.find({ flight: flight, journeyDate: journeyDate, seatClass: seatClass });
        const numBookedSeats = bookings.reduce((acc, booking) => acc + booking.passengers.length, 0);

        let seats = "";
        const seatCode = { 'economy': 'E', 'premium-economy': 'P', 'business': 'B', 'first-class': 'A' };
        let coach = seatCode[seatClass];
        for (let i = numBookedSeats + 1; i < numBookedSeats + passengers.length + 1; i++) {
            if (seats === "") {
                seats = seats.concat(coach, '-', i);
            } else {
                seats = seats.concat(", ", coach, '-', i);
            }
        }
        const booking = new Booking({ user, flight, flightName, flightId, departure, destination, email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass, seats });
        await booking.save();

        res.json({ message: 'Booking successful!!' });
    } catch (err) {
        console.log(err);
    }
});

// Cancel ticket
app.put('/api/cancel-ticket/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        const booking = await Booking.findById(req.params.id);
        booking.bookingStatus = 'cancelled';
        await booking.save();
        res.json({ message: "booking cancelled" });

    } catch (err) {
        console.log(err);
    }
});

// Delete user (Admin only)
app.delete('/api/delete-user/:id', async (req, res) => {
    const { userId } = req.body;
    try {
        const admin = await User.findById(userId);
        if (admin.usertype !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete users.' });
        }

        const user = await User.findById(req.params.id);
        await user.remove();
        res.json({ message: 'User deleted' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete flight (Admin only)
app.delete('/api/delete-flight/:id', async (req, res) => {
    const { userId } = req.body;
    try {
        const admin = await User.findById(userId);
        if (admin.usertype !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete flights.' });
        }

        const flight = await Flight.findById(req.params.id);
        await flight.remove();
        res.json({ message: 'Flight deleted' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Catch-all: serve React app for any non-API route ---
// This must be LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start server (Local Development & Render) ---
// Connect to DB and listen if we are in dev OR on Render
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    connectToDatabase().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running @ ${PORT}`);
        });
    });
}

export default app;

