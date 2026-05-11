import { getSession } from '../config/neo4j.js'

class GraphModel {
  static async getFollowing(username) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(u:User)
         RETURN u.username AS username`,
        { username }
      )
      return result.records.map(r => r.get('username'))
    } finally {
      await session.close()
    }
  }

  static async getFollowers(username) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (u:User)-[:FOLLOWS]->(:User {username: $username})
         RETURN u.username AS username`,
        { username }
      )
      return result.records.map(r => r.get('username'))
    } finally {
      await session.close()
    }
  }

  static async follow(fromUsername, toUsername) {
    const session = getSession()
    try {
      await session.run(
        `MATCH (a:User {username: $from}), (b:User {username: $to})
         MERGE (a)-[:FOLLOWS]->(b)`,
        { from: fromUsername, to: toUsername }
      )
    } finally {
      await session.close()
    }
  }

  static async unfollow(fromUsername, toUsername) {
    const session = getSession()
    try {
      await session.run(
        `MATCH (:User {username: $from})-[r:FOLLOWS]->(:User {username: $to})
         DELETE r`,
        { from: fromUsername, to: toUsername }
      )
    } finally {
      await session.close()
    }
  }

  static async rateMovie(username, movieTitle, score) {
    const session = getSession()
    try {
      await session.run(
        `MATCH (u:User {username: $username}), (m:Movie {title: $title})
         MERGE (u)-[r:RATED]->(m)
         SET r.score = $score`,
        { username, title: movieTitle, score }
      )
    } finally {
      await session.close()
    }
  }

  static async getRecommendations(username) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (me:User {username: $username})-[:RATED]->(m:Movie)<-[:RATED]-(similar:User)
         WHERE similar.username <> $username
         MATCH (similar)-[r:RATED]->(rec:Movie)
         WHERE NOT (me)-[:RATED]->(rec)
           AND NOT (me)-[:WANTS_TO_WATCH]->(rec)
           AND r.score >= 4.0
         RETURN rec.title AS title,
                COUNT(similar) AS recommendedBy,
                AVG(r.score)   AS avgScore
         ORDER BY recommendedBy DESC, avgScore DESC
         LIMIT 10`,
        { username }
      )
      return result.records.map(r => ({
        title:         r.get('title'),
        recommendedBy: r.get('recommendedBy').toNumber(),
        avgScore:      r.get('avgScore'),
      }))
    } finally {
      await session.close()
    }
  }

  static async getSimilarMovies(movieTitle) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (:Movie {title: $title})-[:TAGGED]->(g:Genre)<-[:TAGGED]-(similar:Movie)
         WHERE similar.title <> $title
         RETURN similar.title AS title,
                COLLECT(g.name) AS sharedGenres,
                COUNT(g) AS overlap
         ORDER BY overlap DESC
         LIMIT 8`,
        { title: movieTitle }
      )
      return result.records.map(r => ({
        title:        r.get('title'),
        sharedGenres: r.get('sharedGenres'),
        overlap:      r.get('overlap').toNumber(),
      }))
    } finally {
      await session.close()
    }
  }

  static async getFriendActivity(username) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (:User {username: $username})-[:FOLLOWS]->(friend:User)-[r:RATED]->(m:Movie)
         RETURN friend.username AS ratedBy, m.title AS movie, r.score AS score
         ORDER BY r.score DESC
         LIMIT 20`,
        { username }
      )
      return result.records.map(r => ({
        ratedBy: r.get('ratedBy'),
        movie:   r.get('movie'),
        score:   r.get('score'),
      }))
    } finally {
      await session.close()
    }
  }

  static async getConnectionPath(fromUsername, toUsername) {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH p = shortestPath(
           (a:User {username: $from})-[:FOLLOWS*]-(b:User {username: $to})
         )
         RETURN [node IN nodes(p) | node.username] AS path`,
        { from: fromUsername, to: toUsername }
      )
      if (result.records.length === 0) return null
      return result.records[0].get('path')
    } finally {
      await session.close()
    }
  }
}

export default GraphModel