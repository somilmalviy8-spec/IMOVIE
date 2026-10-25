/**
 * THE IMOVIES - Demo Showcase Data
 * Explicitly labeled sample data used when the local MongoDB database is offline
 * or during frontend demonstration. All entities strictly mirror backend schemas.
 */

export const DEMO_MOVIES = [
  {
    _id: '660000000000000000000001',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'Way9Dexny3w',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    durationMinutes: 166,
    releaseDate: '2024-03-01T00:00:00.000Z',
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
    _id: '660000000000000000000002',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project, exploring the moral weight and political aftermath of human invention.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'uYPbbksJxIg',
    genre: ['Biography', 'Drama', 'History'],
    durationMinutes: 180,
    releaseDate: '2023-07-21T00:00:00.000Z',
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
    _id: '660000000000000000000003',
    title: 'Interstellar',
    slug: 'interstellar',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'zSWdZVtXT7E',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    durationMinutes: 169,
    releaseDate: '2014-11-07T00:00:00.000Z',
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
    _id: '660000000000000000000004',
    title: 'Spider-Man: Across the Spider-Verse',
    slug: 'spider-man-across-the-spider-verse',
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'cqGjhVJWtEg',
    genre: ['Animation', 'Action', 'Adventure'],
    durationMinutes: 140,
    releaseDate: '2023-06-02T00:00:00.000Z',
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
    _id: '660000000000000000000005',
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'EXeTwQWrcwY',
    genre: ['Action', 'Crime', 'Drama'],
    durationMinutes: 152,
    releaseDate: '2008-07-18T00:00:00.000Z',
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
    _id: '660000000000000000000006',
    title: 'Inception',
    slug: 'inception',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'YoHD9XEInc0',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    durationMinutes: 148,
    releaseDate: '2010-07-16T00:00:00.000Z',
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
    _id: '660000000000000000000007',
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    synopsis: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical Emperors who now lead Rome with an iron fist.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '4rgYUipGJNo',
    genre: ['Action', 'Adventure', 'Drama'],
    durationMinutes: 148,
    releaseDate: '2026-11-20T00:00:00.000Z',
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
    _id: '660000000000000000000008',
    title: 'Mission: Impossible - The Final Reckoning',
    slug: 'mission-impossible-the-final-reckoning',
    synopsis: 'Our lives are the sum of our choices. Ethan Hunt and his IMF team embark on their most dangerous mission yet, tracking down a terrifying weapon that threatens humanity before it falls into the wrong hands.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'NOhDyUmT9z0',
    genre: ['Action', 'Thriller', 'Adventure'],
    durationMinutes: 160,
    releaseDate: '2026-12-15T00:00:00.000Z',
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

export const DEMO_THEATRES = [
  {
    _id: '661000000000000000000001',
    name: 'Starlight Grand Multiplex',
    city: 'Metropolis',
    address: '100 Cinema Blvd, Arts District',
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Seating', 'Gourmet Lounge', 'Wheelchair Access'],
    screens: [
      { screenNumber: 1, name: 'Audi 1 - IMAX Laser', format: 'IMAX 3D' },
      { screenNumber: 2, name: 'Audi 2 - Dolby Atmos', format: 'Dolby Atmos' },
      { screenNumber: 3, name: 'Audi 3 - VIP Royale', format: 'VIP Lounge' },
    ],
  },
  {
    _id: '661000000000000000000002',
    name: 'CineSphere Prime',
    city: 'Metropolis',
    address: '45 Harbor View Center',
    facilities: ['4DX Motion', 'Dolby Atmos', 'Concessions Bar', 'Free Parking'],
    screens: [
      { screenNumber: 1, name: 'Screen A - 4DX Dynamic', format: '4DX' },
      { screenNumber: 2, name: 'Screen B - Dolby Sound', format: 'Dolby Atmos' },
      { screenNumber: 3, name: 'Screen C - Classic 2D', format: 'Standard 2D' },
    ],
  },
  {
    _id: '661000000000000000000003',
    name: 'Galaxy City Cinemas',
    city: 'Gotham Heights',
    address: '880 Skyway Ave, Northgate Mall',
    facilities: ['IMAX 3D', 'Dolby Digital', 'Café & Bistro', 'Arcade Lounge'],
    screens: [
      { screenNumber: 1, name: 'Hall 1 - IMAX Grand', format: 'IMAX 3D' },
      { screenNumber: 2, name: 'Hall 2 - Standard', format: 'Standard 2D' },
    ],
  },
];

// Helper to generate dynamic demo showtimes for a movie on a given date
export const generateDemoShowtimesForMovie = (movieId, dateObj = new Date()) => {
  const showtimes = [];
  const baseSlots = [
    { hour: 10, minute: 30, format: 'Standard 2D', price: 220, screen: 'Hall 2 - Standard' },
    { hour: 13, minute: 45, format: 'Dolby Atmos', price: 320, screen: 'Audi 2 - Dolby Atmos' },
    { hour: 17, minute: 15, format: 'IMAX 3D', price: 450, screen: 'Audi 1 - IMAX Laser' },
    { hour: 20, minute: 30, format: 'VIP Lounge', price: 650, screen: 'Audi 3 - VIP Royale' },
  ];

  DEMO_THEATRES.forEach((theatre, tIdx) => {
    // 2-3 showtimes per theatre
    const slots = [
      baseSlots[(tIdx) % baseSlots.length],
      baseSlots[(tIdx + 1) % baseSlots.length],
    ];

    slots.forEach((slot, sIdx) => {
      const startTime = new Date(dateObj);
      startTime.setHours(slot.hour, slot.minute, 0, 0);
      const endTime = new Date(startTime.getTime() + 150 * 60 * 1000);

      showtimes.push({
        _id: `demo_st_${movieId}_${theatre._id}_${tIdx}_${sIdx}`,
        movie: movieId,
        theatre: theatre,
        screenName: slot.screen,
        screenFormat: slot.format,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        basePrice: slot.price,
        currency: 'INR',
      });
    });
  });

  return showtimes;
};
