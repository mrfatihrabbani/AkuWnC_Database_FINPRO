import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
dotenv.config()

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
)

const users = [
  { username: 'fatih', bio: 'Horror, Action and sci-fi enthusiast' },
  { username: 'rauly', bio: 'Cinema lover. Especially for documentary.' },
  { username: 'ryan', bio: 'Huge weeb, likes animation, and action.' },
  { username: 'tester', bio: 'Documentary and world cinema.' },
]

const movies = [
  { title: 'A Girl Walks Home Alone at Night', year: 2014 },
  { title: 'American Sniper', year: 2014 },
  { title: 'Big Hero 6', year: 2014 },
  { title: 'Birdman', year: 2014 },
  { title: 'Citizenfour', year: 2014 },
  { title: 'Fury', year: 2014 },
  { title: 'Guardians of the Galaxy', year: 2014 },
  { title: 'Interstellar', year: 2014 },
  { title: 'The Grand Budapest Hotel', year: 2014 },
  { title: 'The Imitation Game', year: 2014 },
  { title: 'The LEGO Movie', year: 2014 },
  { title: 'The Look of Silence', year: 2014 },
  { title: 'The Normal Heart', year: 2014 },
  { title: 'Whiplash', year: 2014 },
  { title: '7 Days in Hell', year: 2015 },
  { title: 'Amy', year: 2015 },
  { title: 'Beasts of No Nation', year: 2015 },
  { title: 'Bessie', year: 2015 },
  { title: 'Bone Tomahawk', year: 2015 },
  { title: 'Cinderella', year: 2015 },
  { title: 'Eye in the Sky', year: 2015 },
  { title: 'Inside Out', year: 2015 },
  { title: 'Mad Max: Fury Road', year: 2015 },
  { title: 'Sicario', year: 2015 },
  { title: 'Slow West', year: 2015 },
  { title: 'Straight Outta Compton', year: 2015 },
  { title: 'The Big Short', year: 2015 },
  { title: 'The Hateful Eight', year: 2015 },
  { title: 'The Martian', year: 2015 },
  { title: 'The Revenant', year: 2015 },
  { title: '13th', year: 2016 },
  { title: 'All the Way', year: 2016 },
  { title: 'Arrival', year: 2016 },
  { title: 'Confirmation', year: 2016 },
  { title: 'Hacksaw Ridge', year: 2016 },
  { title: 'Hell or High Water', year: 2016 },
  { title: 'In a Valley of Violence', year: 2016 },
  { title: 'Kubo and the Two Strings', year: 2016 },
  { title: 'La La Land', year: 2016 },
  { title: 'Moana', year: 2016 },
  { title: 'O.J.: Made in America', year: 2016 },
  { title: 'Pete\'s Dragon', year: 2016 },
  { title: 'Silence', year: 2016 },
  { title: 'Sing', year: 2016 },
  { title: 'The BFG', year: 2016 },
  { title: 'The Magnificent Seven', year: 2016 },
  { title: 'The Nice Guys', year: 2016 },
  { title: 'Train to Busan', year: 2016 },
  { title: 'Your Name', year: 2016 },
  { title: 'Beauty and the Beast', year: 2017 },
  { title: 'Blade Runner 2049', year: 2017 },
  { title: 'Coco', year: 2017 },
  { title: 'Dunkirk', year: 2017 },
  { title: 'Get Out', year: 2017 },
  { title: 'Hostiles', year: 2017 },
  { title: 'Icarus', year: 2017 },
  { title: 'Logan', year: 2017 },
  { title: 'The 12th Man', year: 2017 },
  { title: 'The Immortal Life of Henrietta Lacks', year: 2017 },
  { title: 'The Shape of Water', year: 2017 },
  { title: 'The Wizard of Lies', year: 2017 },
  { title: 'Wind River', year: 2017 },
  { title: '12 Strong', year: 2018 },
  { title: 'A Quiet Place', year: 2018 },
  { title: 'Avengers: Infinity War', year: 2018 },
  { title: 'Black Panther', year: 2018 },
  { title: 'Bohemian Rhapsody', year: 2018 },
  { title: 'Fahrenheit 451', year: 2018 },
  { title: 'Free Solo', year: 2018 },
  { title: 'Hereditary', year: 2018 },
  { title: 'Minding the Gap', year: 2018 },
  { title: 'Roma', year: 2018 },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018 },
  { title: 'The Ballad of Buster Scruggs', year: 2018 },
  { title: 'The Favourite', year: 2018 },
  { title: 'They Shall Not Grow Old', year: 2018 },
  { title: 'Won\'t You Be My Neighbor?', year: 2018 },
  { title: 'One Piece Film: Red', year: 2022 },
  { title: 'One Piece: Stampede', year: 2019},
  { title: 'One Piece Film: Gold', year: 2016},
]

const series = [
  { title: 'Attack on Titan', year: 2013 },
  { title: 'Breaking Bad', year: 2008 },
  { title: 'The Last of Us', year: 2023 },
  { title: 'Game of Thrones', year: 2011 },
  { title: 'The Witcher', year: 2019 },
  { title: 'Arcane', year: 2021 },
]

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
]

const seriesGenres = {
  'Attack on Titan': ['Action', 'Animation', 'Drama', 'Fantasy', 'Horror'],
  'Breaking Bad': ['Crime', 'Drama', 'Thriller'],
  'The Last of Us': ['Action', 'Adventure', 'Drama', 'Horror'],
  'Game of Thrones': ['Action', 'Adventure', 'Drama', 'Fantasy'],
  'The Witcher': ['Action', 'Adventure', 'Drama', 'Fantasy'],
  'Arcane': ['Action', 'Adventure', 'Animation', 'Drama', 'Fantasy', 'Science Fiction'],
}

const movieGenres = {
  'A Girl Walks Home Alone at Night': ['Horror', 'Romance', 'Thriller', 'Western'],
  'American Sniper': ['Action', 'Drama', 'History', 'War'],
  'Big Hero 6': ['Action', 'Adventure', 'Animation', 'Comedy', 'Family', 'Science Fiction'],
  'Birdman': ['Comedy', 'Drama'],
  'Citizenfour': ['Documentary', 'Thriller'],
  'Fury': ['Action', 'Drama', 'War'],
  'Guardians of the Galaxy': ['Action', 'Adventure', 'Comedy', 'Science Fiction'],
  'Interstellar': ['Adventure', 'Drama', 'Science Fiction'],
  'The Grand Budapest Hotel': ['Adventure', 'Comedy', 'Crime', 'Drama'],
  'The Imitation Game': ['Drama', 'History', 'Thriller', 'War'],
  'The LEGO Movie': ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy'],
  'The Look of Silence': ['Documentary', 'History'],
  'The Normal Heart': ['Drama', 'History', 'TV Movie'],
  'Whiplash': ['Drama', 'Music'],
  '7 Days in Hell': ['Comedy', 'TV Movie'],
  'Amy': ['Documentary', 'Music'],
  'Beasts of No Nation': ['Drama', 'War'],
  'Bessie': ['Drama', 'History', 'Music', 'TV Movie'],
  'Bone Tomahawk': ['Adventure', 'Drama', 'Horror', 'Western'],
  'Cinderella': ['Adventure', 'Drama', 'Family', 'Fantasy', 'Romance'],
  'Eye in the Sky': ['Drama', 'Thriller', 'War'],
  'Inside Out': ['Adventure', 'Animation', 'Comedy', 'Drama', 'Family'],
  'Mad Max: Fury Road': ['Action', 'Adventure', 'Science Fiction', 'Thriller'],
  'Sicario': ['Action', 'Crime', 'Drama', 'Mystery', 'Thriller'],
  'Slow West': ['Action', 'Adventure', 'Western'],
  'Straight Outta Compton': ['Drama', 'History', 'Music'],
  'The Big Short': ['Comedy', 'Drama', 'History'],
  'The Hateful Eight': ['Crime', 'Drama', 'Mystery', 'Thriller', 'Western'],
  'The Martian': ['Adventure', 'Drama', 'Science Fiction'],
  'The Revenant': ['Action', 'Adventure', 'Drama', 'History', 'Western'],
  '13th': ['Crime', 'Documentary', 'History'],
  'All the Way': ['Drama', 'History', 'TV Movie'],
  'Arrival': ['Drama', 'Mystery', 'Science Fiction'],
  'Confirmation': ['Drama', 'History', 'TV Movie'],
  'Hacksaw Ridge': ['Drama', 'History', 'War'],
  'Hell or High Water': ['Crime', 'Drama', 'Thriller', 'Western'],
  'In a Valley of Violence': ['Action', 'Thriller', 'Western'],
  'Kubo and the Two Strings': ['Action', 'Adventure', 'Animation', 'Family', 'Fantasy'],
  'La La Land': ['Comedy', 'Drama', 'Music', 'Romance'],
  'Moana': ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Music'],
  'O.J.: Made in America': ['Crime', 'Documentary', 'History'],
  "Pete's Dragon": ['Adventure', 'Family', 'Fantasy'],
  'Silence': ['Drama', 'History'],
  'Sing': ['Animation', 'Comedy', 'Family', 'Music'],
  'The BFG': ['Adventure', 'Family', 'Fantasy'],
  'The Magnificent Seven': ['Action', 'Adventure', 'Western'],
  'The Nice Guys': ['Action', 'Comedy', 'Crime', 'Mystery', 'Thriller'],
  'Train to Busan': ['Action', 'Horror', 'Thriller'],
  'Your Name': ['Animation', 'Drama', 'Fantasy', 'Romance'],
  'Beauty and the Beast': ['Family', 'Fantasy', 'Music', 'Romance'],
  'Blade Runner 2049': ['Drama', 'Science Fiction', 'Thriller'],
  'Coco': ['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Music'],
  'Dunkirk': ['Action', 'Drama', 'History', 'War'],
  'Get Out': ['Horror', 'Mystery', 'Thriller'],
  'Hostiles': ['Drama', 'History', 'Western'],
  'Icarus': ['Documentary', 'Thriller'],
  'Logan': ['Action', 'Drama', 'Science Fiction'],
  'The 12th Man': ['Drama', 'History', 'War'],
  'The Immortal Life of Henrietta Lacks': ['Drama', 'History', 'TV Movie'],
  'The Shape of Water': ['Drama', 'Fantasy', 'Romance'],
  'The Wizard of Lies': ['Crime', 'Drama', 'History', 'TV Movie'],
  'Wind River': ['Crime', 'Drama', 'Mystery', 'Thriller'],
  '12 Strong': ['Action', 'Drama', 'History', 'War'],
  'A Quiet Place': ['Drama', 'Horror', 'Science Fiction', 'Thriller'],
  'Avengers: Infinity War': ['Action', 'Adventure', 'Science Fiction'],
  'Black Panther': ['Action', 'Adventure', 'Science Fiction'],
  'Bohemian Rhapsody': ['Drama', 'History', 'Music'],
  'Fahrenheit 451': ['Drama', 'Science Fiction', 'TV Movie'],
  'Free Solo': ['Adventure', 'Documentary'],
  'Hereditary': ['Drama', 'Horror', 'Mystery'],
  'Minding the Gap': ['Documentary'],
  'Roma': ['Drama'],
  'Spider-Man: Into the Spider-Verse': ['Action', 'Adventure', 'Animation', 'Comedy', 'Family', 'Science Fiction'],
  'The Ballad of Buster Scruggs': ['Comedy', 'Drama', 'Western'],
  'The Favourite': ['Comedy', 'Drama', 'History'],
  'They Shall Not Grow Old': ['Documentary', 'History', 'War'],
  "Won't You Be My Neighbor?": ['Documentary'],
  'One Piece Film: Red': ['Animation', 'Action', 'Adventure', 'Fantasy', 'Music'],
  'One Piece: Stampede': ['Animation', 'Action', 'Adventure', 'Fantasy'],
  'One Piece Film: Gold': ['Animation', 'Action', 'Adventure', 'Comedy', 'Fantasy'],
}

const ratings = [
  ['fatih', 'Hereditary', 5],
  ['fatih', 'Get Out', 5],
  ['fatih', 'Mad Max: Fury Road', 4.5],
  ['fatih', 'Interstellar', 4],
  ['rauly', 'Citizenfour', 5],
  ['rauly', 'Amy', 5],
  ['rauly', 'Roma', 4.5],
  ['rauly', 'Free Solo', 5],
  ['ryan', 'Your Name', 5],
  ['ryan', 'Spider-Man: Into the Spider-Verse', 5],
  ['ryan', 'Coco', 4.5],
  ['ryan', 'Moana', 4],
  ['tester', 'The Look of Silence', 5],
  ['tester', 'Arrival', 5],
  ['tester', 'Whiplash', 5],
]

const seriesRatings = [
  ['fatih', 'Attack on Titan', 5],
  ['ryan', 'Attack on Titan', 5],
  ['rauly', 'Breaking Bad', 5],
   ['fatih', 'Game of Thrones', 4.5],
  ['ryan', 'The Witcher', 4],
  ['tester', 'Arcane', 5],
]

const follows = [
  ['fatih', 'rauly'],
  ['fatih', 'ryan'],
  ['rauly', 'fatih'],
  ['rauly', 'tester'],
  ['ryan', 'fatih'],
  ['tester', 'rauly'],
]

async function seed() {
  const session = driver.session()
  try {
    console.log('Connecting to Neo4j...')
    await driver.verifyConnectivity()
    console.log('Connected!\n')

    await session.run('MATCH (n) DETACH DELETE n')
    console.log('Cleared existing graph')

    for (const user of users) {
      await session.run(
        `CREATE (:User {username: $username, bio: $bio})`,
        { username: user.username, bio: user.bio }
      )
    }
    console.log(`Created ${users.length} User nodes`)

    for (const movie of movies) {
      await session.run(
        `CREATE (:Movie {title: $title, year: $year})`,
        { title: movie.title, year: movie.year }
      )
    }
    console.log(`Created ${movies.length} Movie nodes`)

    for (const serie of series) {
      await session.run(
        `CREATE (:Series {title: $title, year: $year})`,
        { title: serie.title, year: serie.year }
      )
    }
    console.log(`Created ${series.length} Series nodes`)

    for (const genre of genres) {
      await session.run(
        `CREATE (:Genre {name: $name})`,
        { name: genre }
      )
    }
    console.log(`Created ${genres.length} Genre nodes`)

    for (const [from, to] of follows) {
      await session.run(
        `MATCH (a:User {username: $from}), (b:User {username: $to})
         CREATE (a)-[:FOLLOWS]->(b)`,
        { from, to }
      )
    }
    console.log(`Created ${follows.length} FOLLOWS relationships`)

    for (const [user, movie, score] of ratings) {
      await session.run(
        `MATCH (u:User {username: $user}), (m:Movie {title: $movie})
         CREATE (u)-[:RATED {score: $score}]->(m)`,
        { user, movie, score }
      )
    }
    console.log(`Created ${ratings.length} RATED relationships (Movies)`)

    for (const [user, title, score] of seriesRatings) {
      await session.run(
        `MATCH (u:User {username: $user}), (s:Series {title: $title})
         CREATE (u)-[:RATED {score: $score}]->(s)`,
        { user, title, score }
      )
    }
    console.log(`Created ${seriesRatings.length} RATED relationships (Series)`)

    let taggedCount = 0
    for (const [movieTitle, genreList] of Object.entries(movieGenres)) {
      for (const genreName of genreList) {
        await session.run(
          `MATCH (m:Movie {title: $movieTitle}), (g:Genre {name: $genreName})
           CREATE (m)-[:TAGGED]->(g)`,
          { movieTitle, genreName }
        )
        taggedCount++
      }
    }
    console.log(`Created ${taggedCount} TAGGED relationships`)

    let seriesTaggedCount = 0
    for (const [seriesTitle, genreList] of Object.entries(seriesGenres)) {
      for (const genreName of genreList) {
        await session.run(
          `MATCH (s:Series {title: $seriesTitle}), (g:Genre {name: $genreName})
           CREATE (s)-[:TAGGED]->(g)`,
          { seriesTitle, genreName }
        )
        seriesTaggedCount++
      }
    }
    console.log(`Created ${seriesTaggedCount} TAGGED relationships for Series`)

    console.log('\n Neo4j seed complete!')
    console.log(` Total: ${users.length} users, ${movies.length} movies, ${series.length} series, ${genres.length} genres`)
    console.log(` Relationships: FOLLOWS (${follows.length}), RATED Movies (${ratings.length}), RATED Series (${seriesRatings.length}), TAGGED Movies (${taggedCount}), TAGGED Series (${seriesTaggedCount})`)
  } catch (err) {
    console.error('Seed error:', err)
  } finally {
    await session.close()
    await driver.close()
  }
}

seed()