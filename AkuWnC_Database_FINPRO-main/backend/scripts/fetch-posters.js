// run: node scripts/fetch-posters.js YOUR_TMDB_API_KEY
// get a free key at https://www.themoviedb.org/settings/api

const API_KEY = process.argv[2]
if (!API_KEY) {
  console.log('Usage: node scripts/fetch-posters.js YOUR_TMDB_API_KEY')
  console.log('Get a free key at: https://www.themoviedb.org/settings/api')
  process.exit(1)
}

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
  { title: "Pete's Dragon", year: 2016 },
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
  { title: "Won't You Be My Neighbor?", year: 2018 },
  { title: 'One Piece Film: Red', year: 2022 },
  { title: 'One Piece: Stampede', year: 2019 },
  { title: 'One Piece Film: Gold', year: 2016 },
]

async function fetchPoster(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&year=${year}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.results && data.results.length > 0) {
    const movie = data.results[0]
    if (movie.poster_path) {
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    }
  }
  // retry without year filter
  const url2 = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`
  const res2 = await fetch(url2)
  const data2 = await res2.json()
  if (data2.results && data2.results.length > 0) {
    const movie = data2.results[0]
    if (movie.poster_path) {
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    }
  }
  return null
}

async function main() {
  const fs = await import('fs')
  const path = await import('path')
  
  console.log('Fetching poster URLs from TMDB...\n')
  const results = {}
  
  for (const movie of movies) {
    const url = await fetchPoster(movie.title, movie.year)
    if (url) {
      results[movie.title] = url
      console.log(`✓ ${movie.title}`)
    } else {
      console.log(`✗ ${movie.title} - no poster found`)
    }
    await new Promise(r => setTimeout(r, 250))
  }

  // build the file content
  let content = 'export const moviePosters: Record<string, string> = {\n'
  for (const [title, url] of Object.entries(results)) {
    content += `  "${title}": "${url}",\n`
  }
  content += '};\n'

  // write directly to the frontend file
  const targetPath = path.resolve(import.meta.dirname, '../../frontend/app/lib/moviePosters.ts')
  fs.writeFileSync(targetPath, content, 'utf8')
  console.log(`\n Done! Wrote ${Object.keys(results).length} posters to:\n  ${targetPath}`)
}

main().catch(console.error)
