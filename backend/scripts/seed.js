const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');

// Helper to generate realistic tiered auditorium seats (92 seats total: Standard, Premium, VIP)
const generateAuditoriumSeats = (basePrice = 250) => {
  const seats = [];
  const standardPrice = Number(basePrice);
  const premiumPrice = Math.round(basePrice * 1.35);
  const vipPrice = Math.round(basePrice * 1.8);

  // Rows A-B: Standard Tier (seats 1-12) -> 24 seats
  ['A', 'B'].forEach((row) => {
    for (let num = 1; num <= 12; num++) {
      seats.push({
        row,
        number: num,
        tier: 'standard',
        price: standardPrice,
        status: 'available',
      });
    }
  });

  // Rows C-F: Premium Tier (seats 1-12) -> 48 seats
  ['C', 'D', 'E', 'F'].forEach((row) => {
    for (let num = 1; num <= 12; num++) {
      seats.push({
        row,
        number: num,
        tier: 'premium',
        price: premiumPrice,
        status: 'available',
      });
    }
  });

  // Rows G-H: VIP Recliner Tier (seats 1-10) -> 20 seats
  ['G', 'H'].forEach((row) => {
    for (let num = 1; num <= 10; num++) {
      seats.push({
        row,
        number: num,
        tier: 'vip',
        price: vipPrice,
        status: 'available',
      });
    }
  });

  return {
    seats,
    tierPricing: {
      standard: standardPrice,
      premium: premiumPrice,
      vip: vipPrice,
    },
  };
};

// 8 Realistic Demo Movies matching the exact Movie schema
const demoMovies = [
  {
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'Way9Dexny3w',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    durationMinutes: 166,
    releaseDate: new Date('2024-03-01'),
    language: 'English',
    ageRating: 'PG-13',
    ratingScore: 8.9,
    votesCount: 3820,
    isNowShowing: true,
    featured: true,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
  },
  {
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project, exploring the moral weight and political aftermath of human invention.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'uYPbbksJxIg',
    genre: ['Biography', 'Drama', 'History'],
    durationMinutes: 180,
    releaseDate: new Date('2023-07-21'),
    language: 'English',
    ageRating: 'R',
    ratingScore: 8.9,
    votesCount: 4910,
    isNowShowing: true,
    featured: true,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
  },
  {
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'zSWdZVtXT7E',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    durationMinutes: 169,
    releaseDate: new Date('2014-11-07'),
    language: 'English',
    ageRating: 'PG-13',
    ratingScore: 8.7,
    votesCount: 5200,
    isNowShowing: true,
    featured: true,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    slug: 'spider-man-across-the-spider-verse',
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'cqGjhVJWtEg',
    genre: ['Animation', 'Action', 'Adventure'],
    durationMinutes: 140,
    releaseDate: new Date('2023-06-02'),
    language: 'English',
    ageRating: 'PG',
    ratingScore: 8.8,
    votesCount: 3100,
    isNowShowing: true,
    featured: false,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
  },
  {
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'EXeTwQWrcwY',
    genre: ['Action', 'Crime', 'Drama'],
    durationMinutes: 152,
    releaseDate: new Date('2008-07-18'),
    language: 'English',
    ageRating: 'PG-13',
    ratingScore: 9.0,
    votesCount: 6500,
    isNowShowing: true,
    featured: false,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
  },
  {
    title: 'Inception',
    slug: 'inception',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'YoHD9XEInc0',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    durationMinutes: 148,
    releaseDate: new Date('2010-07-16'),
    language: 'English',
    ageRating: 'PG-13',
    ratingScore: 8.8,
    votesCount: 5400,
    isNowShowing: true,
    featured: false,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Ken Watanabe'],
  },
  {
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    synopsis: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical Emperors who now lead Rome with an iron fist.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '4rgYUipGJNo',
    genre: ['Action', 'Adventure', 'Drama'],
    durationMinutes: 148,
    releaseDate: new Date('2026-11-20'),
    language: 'English',
    ageRating: 'R',
    ratingScore: 8.4,
    votesCount: 820,
    isNowShowing: false,
    featured: true,
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
  },
  {
    title: 'Mission: Impossible - The Final Reckoning',
    slug: 'mission-impossible-the-final-reckoning',
    synopsis: 'Our lives are the sum of our choices. Ethan Hunt and his IMF team embark on their most dangerous mission yet, tracking down a terrifying weapon that threatens humanity before it falls into the wrong hands.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'NOhDyUmT9z0',
    genre: ['Action', 'Thriller', 'Adventure'],
    durationMinutes: 160,
    releaseDate: new Date('2026-12-15'),
    language: 'English',
    ageRating: 'PG-13',
    ratingScore: 8.6,
    votesCount: 650,
    isNowShowing: false,
    featured: false,
    director: 'Christopher McQuarrie',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Vanessa Kirby'],
  },
];

// 3 Realistic Multiplex Theatres matching the Theatre schema (8 screens total)
const demoTheatres = [
  {
    name: 'Starlight Grand Multiplex',
    city: 'Metropolis',
    address: '100 Cinema Blvd, Arts District',
    screens: [
      { screenNumber: 1, name: 'Audi 1 - IMAX Laser', format: 'IMAX 3D' },
      { screenNumber: 2, name: 'Audi 2 - Dolby Atmos', format: 'Dolby Atmos' },
      { screenNumber: 3, name: 'Audi 3 - VIP Royale', format: 'VIP Lounge' },
    ],
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Seating', 'Gourmet Lounge', 'Wheelchair Access'],
  },
  {
    name: 'CineSphere Prime',
    city: 'Metropolis',
    address: '45 Harbor View Center',
    screens: [
      { screenNumber: 1, name: 'Screen A - 4DX Dynamic', format: '4DX' },
      { screenNumber: 2, name: 'Screen B - Dolby Sound', format: 'Dolby Atmos' },
      { screenNumber: 3, name: 'Screen C - Classic 2D', format: 'Standard 2D' },
    ],
    facilities: ['4DX Motion', 'Dolby Atmos', 'Concessions Bar', 'Free Parking'],
  },
  {
    name: 'Galaxy City Cinemas',
    city: 'Gotham Heights',
    address: '880 Skyway Ave, Northgate Mall',
    screens: [
      { screenNumber: 1, name: 'Hall 1 - IMAX Grand', format: 'IMAX 3D' },
      { screenNumber: 2, name: 'Hall 2 - Standard', format: 'Standard 2D' },
    ],
    facilities: ['IMAX 3D', 'Dolby Digital', 'Café & Bistro', 'Arcade Lounge'],
  },
];

// Standard Indian Rupee (INR) showtime pricing templates across dayparts
const timeSlots = [
  { hour: 10, minute: 30, format: 'Standard 2D', price: 220 }, // Morning Show: ₹220 Base
  { hour: 14, minute: 15, format: 'Dolby Atmos', price: 320 }, // Matinee: ₹320 Base
  { hour: 18, minute: 0, format: 'IMAX 3D', price: 450 },     // Evening Prime: ₹450 Base
  { hour: 21, minute: 30, format: 'VIP Lounge', price: 650 },  // Late Night Luxury: ₹650 Base
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || mongoUri.includes('your_mongodb_connection_string_here')) {
      console.error('\n❌ ERROR: MONGODB_URI is not set or still contains the placeholder in backend/.env');
      console.error('👉 Please paste your MongoDB Atlas connection string into: backend/.env\n');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    // Hostname only logged - NO credentials or passwords exposed
    const sanitizedHost = mongoose.connection.host || 'MongoDB cluster';
    console.log(`✅ Connected successfully to MongoDB host: ${sanitizedHost}`);

    // 1. Idempotently Seed/Update Movies
    console.log('\n🎬 Syncing movie catalog (idempotent upsert by slug)...');
    const seededMovies = [];
    for (const movieData of demoMovies) {
      const doc = await Movie.findOneAndUpdate(
        { slug: movieData.slug },
        { $set: movieData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededMovies.push(doc);
    }
    console.log(`   Synced ${seededMovies.length} movies (6 Now Showing, 2 Coming Soon).`);

    // 2. Idempotently Seed/Update Theatres
    console.log('\n🏛️ Syncing multiplex theatres (idempotent upsert by name & city)...');
    const seededTheatres = [];
    for (const theatreData of demoTheatres) {
      const doc = await Theatre.findOneAndUpdate(
        { name: theatreData.name, city: theatreData.city },
        { $set: theatreData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededTheatres.push(doc);
    }
    console.log(`   Synced ${seededTheatres.length} theatres with 8 total screens.`);

    // 3. Idempotently Seed Showtimes for Now-Showing Movies across 4 consecutive days
    console.log('\n⏰ Scheduling showtimes across dates, screens, and theatres...');
    const nowShowingMovies = seededMovies.filter((m) => m.isNowShowing);
    let createdShowtimesCount = 0;
    let existingShowtimesCount = 0;

    // Normalizing base calendar day (Day 0) to avoid sub-day jitter on reruns
    const now = new Date();
    const baseCalendarDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const targetDate = new Date(baseCalendarDate);
      targetDate.setDate(baseCalendarDate.getDate() + dayOffset);

      for (let mIdx = 0; mIdx < nowShowingMovies.length; mIdx++) {
        const movie = nowShowingMovies[mIdx];

        for (let tIdx = 0; tIdx < seededTheatres.length; tIdx++) {
          const theatre = seededTheatres[tIdx];

          // 2 deterministic slots per theatre per day per movie
          const slot1 = timeSlots[(tIdx + dayOffset + mIdx) % timeSlots.length];
          const slot2 = timeSlots[(tIdx + dayOffset + mIdx + 2) % timeSlots.length];

          for (let sIdx = 0; sIdx < [slot1, slot2].length; sIdx++) {
            const slot = [slot1, slot2][sIdx];

            const startTime = new Date(targetDate);
            startTime.setHours(slot.hour, slot.minute, 0, 0);

            const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60 * 1000);

            // Deterministic screen matching
            const matchedScreen =
              theatre.screens.find((s) => s.format === slot.format) ||
              theatre.screens[(mIdx + sIdx) % theatre.screens.length];

            const screenName = matchedScreen ? matchedScreen.name : 'Audi 1';
            const screenFormat = matchedScreen ? matchedScreen.format : slot.format;

            // Check if this specific showtime already exists
            const existingShowtime = await Showtime.findOne({
              movie: movie._id,
              theatre: theatre._id,
              screenName,
              startTime,
            });

            if (!existingShowtime) {
              const { seats, tierPricing } = generateAuditoriumSeats(slot.price);

              await Showtime.create({
                movie: movie._id,
                theatre: theatre._id,
                screenName,
                screenFormat,
                startTime,
                endTime,
                basePrice: slot.price,
                tierPricing,
                currency: 'INR',
                seats,
              });
              createdShowtimesCount++;
            } else {
              existingShowtimesCount++;
            }
          }
        }
      }
    }

    console.log(`   Showtime schedule processed: ${createdShowtimesCount} newly created, ${existingShowtimesCount} existing preserved.`);

    console.log('\n===============================================================');
    console.log('✨ SEEDING COMPLETE FOR "THE IMOVIES"');
    console.log('---------------------------------------------------------------');
    console.log(`🎬 Movies synced: ${seededMovies.length} (6 Now Showing, 2 Coming Soon)`);
    console.log(`🏛️ Theatres synced: ${seededTheatres.length} (8 screens total)`);
    console.log(`⏰ Showtimes processed: ${createdShowtimesCount} created (${existingShowtimesCount} existing skipped)`);
    console.log(`💺 Seats per showtime: 92 seats (Standard, Premium, VIP)`);
    console.log(`💰 Currency: Indian Rupees (INR) across all tiers (₹220 – ₹1,170)`);
    console.log('🔒 Security: 0 user accounts created (no default passwords)');
    console.log('👉 To create an admin: register via UI, then run: npm run make-admin <email>');
    console.log('===============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message || 'Unknown error');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedData();
