import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import Movie from '../models/movie.model.js'
import User from '../models/user.model.js'
import Review from '../models/review.model.js'
import Watchlist from '../models/watchlist.model.js'

const users = [
  { username: 'fatih', email: 'fatih@wncmail.com', password: 'fatih_password', bio: 'Horror, Action and sci-fi enthusiast' },
  { username: 'rauly', email: 'rauly@wncmail.com', password: 'rauly_password', bio: 'Cinema lover. Especially for documentary.' },
  { username: 'ryan', email: 'ryan@wncmail.com', password: 'ryan_password', bio: 'Huge weeb, likes animation, and action.' },
  { username: 'tester', email: 'tester@wncmail.com', password: 'tester_password', bio: 'Documentary and world cinema.' },
]

const movies = [
  { title: 'A Girl Walks Home Alone at Night', year: 2014, director: 'Ana Lily Amirpour', genres: ['Horror', 'Romance', 'Thriller', 'Western'], synopsis: 'In the Iranian ghost-town Bad City, the townspeople are unaware they are being stalked by a lonesome vampire.', runtime: 101, language: 'English' },
  { title: 'American Sniper', year: 2014, director: 'Clint Eastwood', genres: ['Action', 'Drama', 'History', 'War'], synopsis: "Navy S.E.A.L. sniper Chris Kyle's pinpoint accuracy saves countless lives on the battlefield.", runtime: 133, language: 'English' },
  { title: 'Big Hero 6', year: 2014, director: 'Don Hall, Chris Williams', genres: ['Action', 'Adventure', 'Animation', 'Comedy', 'Family', 'Science Fiction'], synopsis: 'A special bond develops between plus-sized inflatable robot Baymax and prodigy Hiro Hamada.', runtime: 102, language: 'English' },
  { title: 'Birdman', year: 2014, director: 'Alejandro G. Iñárritu', genres: ['Comedy', 'Drama'], synopsis: 'A washed-up superhero actor attempts to revive his fading career with a Broadway production.', runtime: 119, language: 'English' },
  { title: 'Citizenfour', year: 2014, director: 'Laura Poitras', genres: ['Documentary', 'Thriller'], synopsis: 'A documentarian and a reporter meet Edward Snowden in Hong Kong to receive classified documents.', runtime: 114, language: 'English' },
  { title: 'Fury', year: 2014, director: 'David Ayer', genres: ['Action', 'Drama', 'War'], synopsis: 'A battle-hardened army sergeant commands a Sherman tank behind enemy lines.', runtime: 134, language: 'English' },
  { title: 'Guardians of the Galaxy', year: 2014, director: 'James Gunn', genres: ['Action', 'Adventure', 'Comedy', 'Science Fiction'], synopsis: 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.', runtime: 121, language: 'English' },
  { title: 'Interstellar', year: 2014, director: 'Christopher Nolan', genres: ['Adventure', 'Drama', 'Science Fiction'], synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", runtime: 169, language: 'English' },
  { title: 'The Grand Budapest Hotel', year: 2014, director: 'Wes Anderson', genres: ['Adventure', 'Comedy', 'Crime', 'Drama'], synopsis: 'A writer encounters the owner of a decaying high-class hotel, who tells him of his early years as a lobby boy.', runtime: 99, language: 'English' },
  { title: 'The Imitation Game', year: 2014, director: 'Morten Tyldum', genres: ['Drama', 'History', 'Thriller', 'War'], synopsis: 'During World War II, the English mathematical genius Alan Turing tries to crack the German Enigma code.', runtime: 114, language: 'English' },
  { title: 'The LEGO Movie', year: 2014, director: 'Phil Lord, Chris Miller', genres: ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy'], synopsis: "An ordinary LEGO construction worker, thought to be the prophecy's 'Special', is recruited to join a quest.", runtime: 100, language: 'English' },
  { title: 'The Look of Silence', year: 2014, director: 'Joshua Oppenheimer', genres: ['Documentary', 'History'], synopsis: 'A family that survives the genocide in Indonesia confronts the men who killed one of their brothers.', runtime: 103, language: 'English' },
  { title: 'The Normal Heart', year: 2014, director: 'Ryan Murphy', genres: ['Drama', 'History', 'TV Movie'], synopsis: 'A gay activist attempts to raise awareness about the onset of the HIV-AIDS crisis in New York City.', runtime: 132, language: 'English' },
  { title: 'Whiplash', year: 2014, director: 'Damien Chazelle', genres: ['Drama', 'Music'], synopsis: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by a ruthless instructor.', runtime: 106, language: 'English' },
  { title: '7 Days in Hell', year: 2015, director: 'Jake Szymanski', genres: ['Comedy', 'TV Movie'], synopsis: 'A fictional look at the longest tennis match in history.', runtime: 43, language: 'English' },
  { title: 'Amy', year: 2015, director: 'Asif Kapadia', genres: ['Documentary', 'Music'], synopsis: 'The story of Amy Winehouse in her own words, featuring unseen archival footage.', runtime: 128, language: 'English' },
  { title: 'Beasts of No Nation', year: 2015, director: 'Cary Joji Fukunaga', genres: ['Drama', 'War'], synopsis: 'A child soldier fights in the civil war of an unnamed African country.', runtime: 137, language: 'English' },
  { title: 'Bessie', year: 2015, director: 'Dee Rees', genres: ['Drama', 'History', 'Music', 'TV Movie'], synopsis: 'The story of legendary blues performer Bessie Smith, who rose to fame during the 1920s and 30s.', runtime: 112, language: 'English' },
  { title: 'Bone Tomahawk', year: 2015, director: 'S. Craig Zahler', genres: ['Adventure', 'Drama', 'Horror', 'Western'], synopsis: 'Four men set out in the Wild West to rescue a group of captives from cannibalistic cave dwellers.', runtime: 132, language: 'English' },
  { title: 'Cinderella', year: 2015, director: 'Kenneth Branagh', genres: ['Adventure', 'Drama', 'Family', 'Fantasy', 'Romance'], synopsis: 'When her father unexpectedly dies, young Ella finds herself at the mercy of her cruel stepmother and stepsisters.', runtime: 105, language: 'English' },
  { title: 'Eye in the Sky', year: 2015, director: 'Gavin Hood', genres: ['Drama', 'Thriller', 'War'], synopsis: 'A military officer in command of an operation to capture terrorists sees her mission escalate.', runtime: 102, language: 'English' },
  { title: 'Inside Out', year: 2015, director: 'Pete Docter', genres: ['Adventure', 'Animation', 'Comedy', 'Drama', 'Family'], synopsis: 'After young Riley is uprooted from her life, her emotions conflict on how best to navigate a new city.', runtime: 95, language: 'English' },
  { title: 'Mad Max: Fury Road', year: 2015, director: 'George Miller', genres: ['Action', 'Adventure', 'Science Fiction', 'Thriller'], synopsis: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland.', runtime: 120, language: 'English' },
  { title: 'Sicario', year: 2015, director: 'Denis Villeneuve', genres: ['Action', 'Crime', 'Drama', 'Mystery', 'Thriller'], synopsis: 'An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs.', runtime: 121, language: 'English' },
  { title: 'Slow West', year: 2015, director: 'John Maclean', genres: ['Action', 'Adventure', 'Western'], synopsis: 'A young Scottish man travels across America in pursuit of the woman he loves.', runtime: 84, language: 'English' },
  { title: 'Straight Outta Compton', year: 2015, director: 'F. Gary Gray', genres: ['Drama', 'History', 'Music'], synopsis: 'The group NWA emerges from the streets of Compton and revolutionizes Hip Hop culture.', runtime: 147, language: 'English' },
  { title: 'The Big Short', year: 2015, director: 'Adam McKay', genres: ['Comedy', 'Drama', 'History'], synopsis: 'In 2006-2007, a group of investors bet against the US mortgage market and discover how corrupt the market is.', runtime: 130, language: 'English' },
  { title: 'The Hateful Eight', year: 2015, director: 'Quentin Tarantino', genres: ['Crime', 'Drama', 'Mystery', 'Thriller', 'Western'], synopsis: 'In the dead of a Wyoming winter, a bounty hunter and his prisoner find shelter in a cabin with nefarious characters.', runtime: 168, language: 'English' },
  { title: 'The Martian', year: 2015, director: 'Ridley Scott', genres: ['Adventure', 'Drama', 'Science Fiction'], synopsis: 'An astronaut becomes stranded on Mars after his team assume him dead and must rely on his ingenuity to signal Earth.', runtime: 144, language: 'English' },
  { title: 'The Revenant', year: 2015, director: 'Alejandro G. Iñárritu', genres: ['Action', 'Adventure', 'Drama', 'History', 'Western'], synopsis: 'A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear.', runtime: 156, language: 'English' },
  { title: '13th', year: 2016, director: 'Ava DuVernay', genres: ['Crime', 'Documentary', 'History'], synopsis: 'An in-depth look at the prison system in the US and how it reveals the nation\'s history of racial inequality.', runtime: 100, language: 'English' },
  { title: 'All the Way', year: 2016, director: 'Jay Roach', genres: ['Drama', 'History', 'TV Movie'], synopsis: 'Lyndon B. Johnson becomes President in the chaotic aftermath of the JFK assassination.', runtime: 132, language: 'English' },
  { title: 'Arrival', year: 2016, director: 'Denis Villeneuve', genres: ['Drama', 'Mystery', 'Science Fiction'], synopsis: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear.', runtime: 116, language: 'English' },
  { title: 'Confirmation', year: 2016, director: 'Rick Famuyiwa', genres: ['Drama', 'History', 'TV Movie'], synopsis: 'Judge Clarence Thomas\' Nomination is called into question by Anita Hill.', runtime: 110, language: 'English' },
  { title: 'Hacksaw Ridge', year: 2016, director: 'Mel Gibson', genres: ['Drama', 'History', 'War'], synopsis: 'WWII American Army Medic Desmond T. Doss refuses to kill and becomes the first conscientious objector to win the Medal of Honor.', runtime: 139, language: 'English' },
  { title: 'Hell or High Water', year: 2016, director: 'David Mackenzie', genres: ['Crime', 'Drama', 'Thriller', 'Western'], synopsis: "A divorced father and his ex-con brother resort to a desperate scheme in order to save their family's farm in West Texas.", runtime: 102, language: 'English' },
  { title: 'In a Valley of Violence', year: 2016, director: 'Ti West', genres: ['Action', 'Thriller', 'Western'], synopsis: 'A mysterious stranger drags a town into a bloody revenge of the past.', runtime: 104, language: 'English' },
  { title: 'Kubo and the Two Strings', year: 2016, director: 'Travis Knight', genres: ['Action', 'Adventure', 'Animation', 'Family', 'Fantasy'], synopsis: 'A young boy named Kubo must locate a magical suit of armor worn by his late father in order to defeat a vengeful spirit.', runtime: 101, language: 'English' },
  { title: 'La La Land', year: 2016, director: 'Damien Chazelle', genres: ['Comedy', 'Drama', 'Music', 'Romance'], synopsis: 'A pianist and an aspiring actress fall in love while attempting to reconcile their aspirations for the future.', runtime: 128, language: 'English' },
  { title: 'Moana', year: 2016, director: 'Ron Clements, John Musker', genres: ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Music'], synopsis: "In Ancient Polynesia, when a terrible curse reaches Moana's island, she answers the Ocean's call.", runtime: 107, language: 'English' },
  { title: 'O.J.: Made in America', year: 2016, director: 'Ezra Edelman', genres: ['Crime', 'Documentary', 'History'], synopsis: 'A chronicle of the rise and fall of O.J. Simpson.', runtime: 467, language: 'English' },
  { title: 'Pete\'s Dragon', year: 2016, director: 'David Lowery', genres: ['Adventure', 'Family', 'Fantasy'], synopsis: 'The adventures of an orphaned boy named Pete and his best friend Elliot, who just so happens to be a dragon.', runtime: 102, language: 'English' },
  { title: 'Silence', year: 2016, director: 'Martin Scorsese', genres: ['Drama', 'History'], synopsis: 'In the 17th century, two Portuguese Jesuit priests travel to Japan to locate their mentor.', runtime: 161, language: 'English' },
  { title: 'Sing', year: 2016, director: 'Garth Jennings', genres: ['Animation', 'Comedy', 'Family', 'Music'], synopsis: 'In a city of humanoid animals, a hustling theater impresario\'s attempt to save his theater with a singing competition.', runtime: 108, language: 'English' },
  { title: 'The BFG', year: 2016, director: 'Steven Spielberg', genres: ['Adventure', 'Family', 'Fantasy'], synopsis: 'An orphan little girl befriends a benevolent giant who takes her to Giant Country.', runtime: 117, language: 'English' },
  { title: 'The Magnificent Seven', year: 2016, director: 'Antoine Fuqua', genres: ['Action', 'Adventure', 'Western'], synopsis: 'Seven gunmen in the old west gradually come together to help a poor village.', runtime: 132, language: 'English' },
  { title: 'The Nice Guys', year: 2016, director: 'Shane Black', genres: ['Action', 'Comedy', 'Crime', 'Mystery', 'Thriller'], synopsis: 'In 1970s Los Angeles, a mismatched pair of private eyes investigate the disappearance of a girl.', runtime: 116, language: 'English' },
  { title: 'Train to Busan', year: 2016, director: 'Yeon Sang-ho', genres: ['Action', 'Horror', 'Thriller'], synopsis: 'While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.', runtime: 118, language: 'English' },
  { title: 'Your Name', year: 2016, director: 'Makoto Shinkai', genres: ['Animation', 'Drama', 'Fantasy', 'Romance'], synopsis: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance keep them apart?', runtime: 106, language: 'English' },
  { title: 'Beauty and the Beast', year: 2017, director: 'Bill Condon', genres: ['Family', 'Fantasy', 'Music', 'Romance'], synopsis: 'A selfish Prince is cursed to become a monster for the rest of his life, unless he learns to fall in love.', runtime: 129, language: 'English' },
  { title: 'Blade Runner 2049', year: 2017, director: 'Denis Villeneuve', genres: ['Drama', 'Science Fiction', 'Thriller'], synopsis: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down Rick Deckard.', runtime: 164, language: 'English' },
  { title: 'Coco', year: 2017, director: 'Lee Unkrich', genres: ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Music'], synopsis: 'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather.', runtime: 105, language: 'English' },
  { title: 'Dunkirk', year: 2017, director: 'Christopher Nolan', genres: ['Action', 'Drama', 'History', 'War'], synopsis: 'Allied soldiers are surrounded by the German Army and evacuated during a fierce battle in WWII.', runtime: 106, language: 'English' },
  { title: 'Get Out', year: 2017, director: 'Jordan Peele', genres: ['Horror', 'Mystery', 'Thriller'], synopsis: 'A young African-American visits his white girlfriend\'s parents, where a dark truth is revealed.', runtime: 104, language: 'English' },
  { title: 'Hostiles', year: 2017, director: 'Scott Cooper', genres: ['Drama', 'History', 'Western'], synopsis: 'In 1892, a legendary Army Captain reluctantly escorts a Cheyenne chief through dangerous territory.', runtime: 134, language: 'English' },
  { title: 'Icarus', year: 2017, director: 'Bryan Fogel', genres: ['Documentary', 'Thriller'], synopsis: 'A chance meeting with a Russian scientist transforms a story about doping in sports.', runtime: 121, language: 'English' },
  { title: 'Logan', year: 2017, director: 'James Mangold', genres: ['Action', 'Drama', 'Science Fiction'], synopsis: 'In a future where mutants are nearly extinct, an elderly Logan must protect a young mutant child.', runtime: 137, language: 'English' },
  { title: 'The 12th Man', year: 2017, director: 'Harald Zwart', genres: ['Drama', 'History', 'War'], synopsis: 'The true story of a saboteur who escaped the Nazis in occupied Norway.', runtime: 135, language: 'English' },
  { title: 'The Immortal Life of Henrietta Lacks', year: 2017, director: 'George C. Wolfe', genres: ['Drama', 'History', 'TV Movie'], synopsis: 'An African-American woman\'s cancer cells are used to create the first immortal human cell line.', runtime: 93, language: 'English' },
  { title: 'The Shape of Water', year: 2017, director: 'Guillermo del Toro', genres: ['Drama', 'Fantasy', 'Romance'], synopsis: 'A lonely janitor forms a unique relationship with an amphibious creature being held in a top-secret research facility.', runtime: 123, language: 'English' },
  { title: 'The Wizard of Lies', year: 2017, director: 'Barry Levinson', genres: ['Crime', 'Drama', 'History', 'TV Movie'], synopsis: 'A look at Bernie Madoff\'s Ponzi scheme, which duped investors out of over $65 billion.', runtime: 133, language: 'English' },
  { title: 'Wind River', year: 2017, director: 'Taylor Sheridan', genres: ['Crime', 'Drama', 'Mystery', 'Thriller'], synopsis: 'A veteran hunter helps an FBI agent investigate the murder of a young woman on a Native American Reservation.', runtime: 107, language: 'English' },
  { title: '12 Strong', year: 2018, director: 'Nicolai Fuglsig', genres: ['Action', 'Drama', 'History', 'War'], synopsis: 'The first Special Forces team deployed to Afghanistan after 9/11.', runtime: 130, language: 'English' },
  { title: 'A Quiet Place', year: 2018, director: 'John Krasinski', genres: ['Drama', 'Horror', 'Science Fiction', 'Thriller'], synopsis: 'In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters.', runtime: 90, language: 'English' },
  { title: 'Avengers: Infinity War', year: 2018, director: 'Anthony Russo', genres: ['Action', 'Adventure', 'Science Fiction'], synopsis: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.', runtime: 149, language: 'English' },
  { title: 'Black Panther', year: 2018, director: 'Ryan Coogler', genres: ['Action', 'Adventure', 'Science Fiction'], synopsis: 'T\'Challa, heir to the hidden kingdom of Wakanda, must lead his people into a new era.', runtime: 134, language: 'English' },
  { title: 'Bohemian Rhapsody', year: 2018, director: 'Bryan Singer', genres: ['Drama', 'History', 'Music'], synopsis: 'The story of the legendary British rock band Queen and lead singer Freddie Mercury.', runtime: 134, language: 'English' },
  { title: 'Fahrenheit 451', year: 2018, director: 'Ramin Bahrani', genres: ['Drama', 'Science Fiction', 'TV Movie'], synopsis: 'In a terrifying care-free future, a fireman whose job is to burn all books questions his actions.', runtime: 100, language: 'English' },
  { title: 'Free Solo', year: 2018, director: 'Elizabeth Chai Vasarhelyi', genres: ['Adventure', 'Documentary'], synopsis: 'Alex Honnold attempts to become the first person to ever free solo climb El Capitan.', runtime: 100, language: 'English' },
  { title: 'Hereditary', year: 2018, director: 'Ari Aster', genres: ['Drama', 'Horror', 'Mystery'], synopsis: 'A grieving family is haunted by disturbing occurrences after the death of their secretive grandmother.', runtime: 127, language: 'English' },
  { title: 'Minding the Gap', year: 2018, director: 'Bing Liu', genres: ['Documentary'], synopsis: 'Three young men bond together to escape their volatile families in their Rust Belt hometown.', runtime: 93, language: 'English' },
  { title: 'Roma', year: 2018, director: 'Alfonso Cuarón', genres: ['Drama'], synopsis: 'A year in the life of a middle-class family\'s maid in Mexico City in the early 1970s.', runtime: 135, language: 'English' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, director: 'Bob Persichetti', genres: ['Action', 'Adventure', 'Animation', 'Comedy', 'Family', 'Science Fiction'], synopsis: 'Teen Miles Morales becomes the Spider-Man of his universe and joins others from various dimensions.', runtime: 117, language: 'English' },
  { title: 'The Ballad of Buster Scruggs', year: 2018, director: 'Ethan Coen, Joel Coen', genres: ['Comedy', 'Drama', 'Western'], synopsis: 'Six tales of life and violence on the Old West frontier.', runtime: 133, language: 'English' },
  { title: 'The Favourite', year: 2018, director: 'Yorgos Lanthimos', genres: ['Comedy', 'Drama', 'History'], synopsis: 'In early 18th-century England, a frail Queen Anne occupies the throne and her close friend Lady Sarah governs for her.', runtime: 119, language: 'English' },
  { title: 'They Shall Not Grow Old', year: 2018, director: 'Peter Jackson', genres: ['Documentary', 'History', 'War'], synopsis: 'A documentary about World War I with never-before-seen footage.', runtime: 99, language: 'English' },
  { title: 'Won\'t You Be My Neighbor?', year: 2018, director: 'Morgan Neville', genres: ['Documentary'], synopsis: 'An exploration of the life, lessons, and legacy of iconic children\'s television host, Fred Rogers.', runtime: 94, language: 'English' },
  { title: 'One Piece Film: Red', year: 2022, director: 'Gorō Taniguchi', genres: ['Animation', 'Action', 'Adventure', 'Fantasy', 'Music'], synopsis: 'Uta, the most beloved singer on the planet, is known for hiding her own identity when performing. Now, for the first time, she will reveal herself to the world. All of Uta\'s fans, including the Straw Hats led by Luffy, await.', runtime: 115, language: 'English' },
  { title: 'One Piece: Stampede', year: 2019, director: 'Takashi Otsuka', genres: ['Animation', 'Action', 'Adventure', 'Fantasy'], synopsis: 'The Straw Hat crew are invited to the world\'s biggest pirate event to join the hunt for Gol D. Roger\'s lost treasure.', runtime: 100, language: 'English' },
  { title: 'One Piece Film: Gold', year: 2016, director: 'Hiroaki Miyamoto', genres: ['Animation', 'Action', 'Adventure', 'Comedy', 'Fantasy'], synopsis: 'Luffy and his pirates can\'t wait to board the glittering Sin City ship known as Gran Tesoro, but they soon find themselves in way over their heads.', runtime: 120, language: 'English' },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB Atlas\n')

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Review.deleteMany({}),
      Watchlist.deleteMany({}),
    ])
    console.log('Cleared existing collections')

    const insertedUsers  = await User.insertMany(users)
    const insertedMovies = await Movie.insertMany(movies)
    console.log(`Inserted ${insertedUsers.length} users`)
    console.log(`Inserted ${insertedMovies.length} movies`)

    const u = (name)  => insertedUsers.find(x => x.username === name)
    const m = (title) => insertedMovies.find(x => x.title === title)

    const reviews = [
      { user: u('fatih')._id, movie: m('Hereditary')._id, rating: 5, content: 'Most terrifying film I have seen.', liked: true},
      { user: u('fatih')._id, movie: m('Get Out')._id, rating: 5, content: 'Peele is a genius.', liked: true},
      { user: u('fatih')._id, movie: m('Mad Max: Fury Road')._id, rating: 4.5, content: 'Pure adrenaline from start to finish.', liked: true},
      { user: u('fatih')._id, movie: m('Interstellar')._id, rating: 4, content: 'Visually stunning but emotionally cold.', liked: true},
      { user: u('rauly')._id, movie: m('Citizenfour')._id, rating: 5, content: 'One of the most important docs ever made.', liked: true},
      { user: u('rauly')._id, movie: m('Amy')._id, rating: 5, content: 'Devastating and beautiful.', liked: true},
      { user: u('rauly')._id, movie: m('Roma')._id, rating: 4.5, content: "Cuaron's masterwork.", liked: true},
      { user: u('rauly')._id, movie: m('Free Solo')._id, rating: 5, content: 'Genuinely nerve-wracking.', liked: true},
      { user: u('ryan')._id, movie: m('Your Name')._id, rating: 5, content: 'Cried three times.', liked: true},
      { user: u('ryan')._id, movie: m('Spider-Man: Into the Spider-Verse')._id, rating: 5, content: 'Best animated film in years.', liked: true},
      { user: u('ryan')._id, movie: m('Coco')._id, rating: 4.5, content: 'Pixar at their peak.', liked: true},
      { user: u('ryan')._id, movie: m('Moana')._id, rating: 4, content: 'Great songs, great heart.', liked: true},
      { user: u('tester')._id, movie: m('The Look of Silence')._id, rating: 5, content: 'Haunting and essential.', liked: true},
      { user: u('tester')._id, movie: m('Arrival')._id, rating: 5, content: 'The best sci-fi in a decade.', liked: true},
      { user: u('tester')._id, movie: m('Whiplash')._id, rating: 5, content: 'Fletcher is one of cinema\'s great villains.', liked: true},
    ]

    await Review.insertMany(reviews)
    console.log(`Inserted ${reviews.length} reviews`)

    const ratedMovieIds = [...new Set(reviews.map(r => r.movie.toString()))]
    for (const movieId of ratedMovieIds) {
      await Movie.recalcRating(movieId)
    }
    console.log('Updated movie average ratings')

    const watchlists = [
      { user: u('fatih')._id, movie: m('Blade Runner 2049')._id, status: 'want_to_watch' },
      { user: u('fatih')._id, movie: m('The Hateful Eight')._id, status: 'watched', watchedAt: new Date('2024-02-10') },
      { user: u('rauly')._id, movie: m('The Look of Silence')._id, status: 'watched', watchedAt: new Date('2024-01-15') },
      { user: u('ryan')._id, movie: m('Your Name')._id, status: 'watched', watchedAt: new Date('2024-03-01') },
      { user: u('ryan')._id, movie: m('Kubo and the Two Strings')._id, status: 'want_to_watch' },
      { user: u('tester')._id, movie: m('Sicario')._id, status: 'want_to_watch' },
    ]

    await Watchlist.insertMany(watchlists)
    console.log(`Inserted ${watchlists.length} watchlist entries`)
    
    const fatih  = u('fatih')
    const rauly  = u('rauly')
    const ryan   = u('ryan')
    const tester = u('tester')

    await User.findByIdAndUpdate(fatih._id, { following: [rauly._id, ryan._id], followers: [rauly._id, ryan._id] })
    await User.findByIdAndUpdate(rauly._id, { following: [fatih._id, tester._id], followers: [fatih._id, tester._id] })
    await User.findByIdAndUpdate(ryan._id, { following: [fatih._id], followers: [fatih._id] })
    await User.findByIdAndUpdate(tester._id, { following: [rauly._id], followers: [rauly._id] })
    console.log('Set up following relationships')
    console.log('\nMongoDB seed complete!')

  } catch (err) {
    console.error('Seed error:', err)
  } finally {
    await mongoose.disconnect()
  }
}

seed()