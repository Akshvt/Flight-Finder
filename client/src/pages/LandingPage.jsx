import React, { useContext, useEffect, useState } from 'react';
import '../styles/LandingPage.css';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContext';
import API_BASE_URL from '../config/api';

const LandingPage = () => {
  const [error, setError] = useState('');
  const [checkBox, setCheckBox] = useState(false);

  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState();
  const [returnDate, setReturnDate] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userType') === 'admin') {
      navigate('/admin');
    } else if (localStorage.getItem('userType') === 'flight-operator') {
      navigate('/flight-admin');
    }
  }, []);

  const [Flights, setFlights] = useState([]);

  const fetchFlights = async () => {
    if (checkBox) {
      if (departure && destination && departureDate && returnDate) {
        const now = new Date();
        const depDate = new Date(departureDate);
        const retDate = new Date(returnDate);

        if (depDate > now && retDate > depDate) {
          setError('');
          const response = await axios.get(`${API_BASE_URL}/fetch-flights`);
          setFlights(response.data);
        } else {
          setError('Invalid dates selected.');
        }
      } else {
        setError('Please fill in all fields.');
      }
    } else {
      if (departure && destination && departureDate) {
        const now = new Date();
        const depDate = new Date(departureDate);

        if (depDate >= now) {
          setError('');
          const response = await axios.get(`${API_BASE_URL}/fetch-flights`);
          setFlights(response.data);
        } else {
          setError('Journey date must be today or later.');
        }
      } else {
        setError('Please fill in all fields.');
      }
    }
  };

  const { setTicketBookingDate } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');

  const handleTicketBooking = (id, origin, destination) => {
    if (userId) {
      if (origin === departure) {
        setTicketBookingDate(departureDate);
      } else if (destination === departure) {
        setTicketBookingDate(returnDate);
      }
      navigate(`/book-flight/${id}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="landingPage">
      <div className="landingHero">
        <div className="landingHero-title">
          <h1 className="banner-h1">Discover the Sky with Flight Finder</h1>
          <p className="banner-p">
            Your journey begins here. Explore flights, compare options, and book with ease — all in one place.
          </p>
        </div>

        <div className="Flight-search-container input-container mb-4">
          <button
            className={`return-journey-btn ${checkBox ? 'active' : ''}`}
            type="button"
            onClick={() => setCheckBox(!checkBox)}
          >
            {checkBox ? '✓ Return Journey' : 'Return Journey'}
          </button>

          <div className="Flight-search-container-body">
            <div className="form-floating">
              <select
                className="form-select form-select-sm mb-3"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              >
                <option value="" disabled>Select</option>
                <option value="Chennai">Chennai</option>
                <option value="Banglore">Banglore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Indore">Indore</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Trivendrum">Trivendrum</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Kolkata">Kolkata</option>
                <option value="varanasi">Varanasi</option>
                <option value="Jaipur">Jaipur</option>
              </select>
              <label>Departure City</label>
            </div>

            <div className="form-floating">
              <select
                className="form-select form-select-sm mb-3"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="" disabled>Select</option>
                <option value="Chennai">Chennai</option>
                <option value="Banglore">Banglore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Indore">Indore</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Trivendrum">Trivendrum</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Kolkata">Kolkata</option>
                <option value="varanasi">Varanasi</option>
                <option value="Jaipur">Jaipur</option>
              </select>
              <label>Destination City</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="date"
                className="form-control"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
              <label>Journey Date</label>
            </div>

            {checkBox && (
              <div className="form-floating mb-3">
                <input
                  type="date"
                  className="form-control"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
                <label>Return Date</label>
              </div>
            )}

            <div>
              <button className="btn btn-primary" onClick={fetchFlights}>Search</button>
            </div>
          </div>

          <p className="text-danger">{error}</p>
        </div>

        {Flights.length > 0 && (
          <div className="availableFlightsContainer">
            <h1>Available Flights</h1>
            <div className="Flights">
              {Flights
                .filter((Flight) =>
                  checkBox
                    ? (Flight.origin === departure && Flight.destination === destination) ||
                    (Flight.origin === destination && Flight.destination === departure)
                    : Flight.origin === departure && Flight.destination === destination
                )
                .map((Flight) => (
                  <div className="Flight" key={Flight._id}>
                    <div>
                      <p><b>{Flight.flightName}</b></p>
                      <p><b>Flight Number:</b> {Flight.flightId}</p>
                    </div>
                    <div>
                      <p><b>Start:</b> {Flight.origin}</p>
                      <p><b>Departure Time:</b> {Flight.departureTime}</p>
                    </div>
                    <div>
                      <p><b>Destination:</b> {Flight.destination}</p>
                      <p><b>Arrival Time:</b> {Flight.arrivalTime}</p>
                    </div>
                    <div>
                      <p><b>Starting Price:</b> ₹{Flight.basePrice}</p>
                      <p><b>Seats Available:</b> {Flight.totalSeats}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleTicketBooking(Flight._id, Flight.origin, Flight.destination)}>
                      Book Now
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <section id="about" className="section-about p-4">
        <div className="container">
          <h2 className="section-title">About Flight Finder</h2>
          <p className="section-description">
            &nbsp;&nbsp;&nbsp;&nbsp; At <strong>Flight Finder</strong>, we bring convenience to the skies. Whether you're planning a quick business trip or a relaxing getaway, our platform is designed to make flight booking fast, easy, and reliable.
          </p>
          <p className="section-description">
            &nbsp;&nbsp;&nbsp;&nbsp; Our intuitive system allows you to search, compare, and book flights from top carriers in just a few clicks. With flexible date options and real-time seat availability, you're always in control of your journey.
          </p>
          <p className="section-description">
            &nbsp;&nbsp;&nbsp;&nbsp; Flight Finder ensures that every user gets the best travel options tailored to their needs. Experience a new standard in flight booking — transparent pricing, secure booking, and a seamless user experience.
          </p>
          <span><h5>2023 Flight Finder - &copy; All rights reserved</h5></span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
