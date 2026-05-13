import { getSession, isNeo4jConnected } from '../../config/neo4j.js'

class GraphModel {
  static async getFollowing(username) {
    if (!isNeo4jConnected()) return []
    const session = getSession()
    if (!session) return []
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
    if (!isNeo4jConnected()) return []
    const session = getSession()
    if (!session) return []
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
    if (!isNeo4jConnected()) return
    const session = getSession()
    if (!session) return
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
    if (!isNeo4jConnected()) return
    const session = getSession()
    if (!session) return
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

  
   // rateContent (both Movies and Series)
  static async rateContent(username, contentTitle, score, contentType) {
    if (!isNeo4jConnected()) return
    const session = getSession()
    if (!session) return
    try {
      await session.run(
        `MATCH (u:User {username: $username}), (m:${contentType} {title: $title})
         MERGE (u)-[r:RATED]->(m)
         SET r.score = $score`,
        { username, title: contentTitle, score }
      )
    } finally {
      await session.close()
    }
  }

  // getRecommendations
  static async getRecommendations(username) {
    if (!isNeo4jConnected()) return []
    const session = getSession()
    if (!session) return []
    try {
      // Using 'Content' as a base label for both Movies and Series
      const result = await session.run(
        `MATCH (me:User {username: $username})-[:RATED]->(m:Content)<-[:RATED]-(similar:User)
         WHERE similar.username <> $username
         MATCH (similar)-[r:RATED]->(rec:Content)
         WHERE NOT (me)-[:RATED]->(rec)
           AND r.score >= 4.0
         RETURN rec.title AS title, 
                labels(rec) AS types,
                COUNT(similar) AS recommendedBy,
                AVG(r.score) AS avgScore
         ORDER BY recommendedBy DESC, avgScore DESC
         LIMIT 10`,
        { username }
      )
      return result.records.map(r => ({
        title: r.get('title'),
        type: r.get('types').filter(l => l !== 'Content')[0], // Returns 'Movie' or 'Series'
        recommendedBy: r.get('recommendedBy').toNumber(),
        avgScore: r.get('avgScore'),
      }))
    } finally {
      await session.close()
    }
  }

   // getSimilarContent
  static async getSimilarContent(title, contentType) {
    if (!isNeo4jConnected()) return []
    const session = getSession()
    if (!session) return []
    try {
      const result = await session.run(
        `MATCH (target:${contentType} {title: $title})-[:TAGGED]->(g:Genre)<-[:TAGGED]-(similar:Content)
         WHERE similar.title <> $title
         RETURN similar.title AS title,
                labels(similar) AS types,
                COLLECT(g.name) AS sharedGenres,
                COUNT(g) AS overlap
         ORDER BY overlap DESC
         LIMIT 8`,
        { title }
      )
      return result.records.map(r => ({
        title: r.get('title'),
        type: r.get('types').filter(l => l !== 'Content')[0],
        sharedGenres: r.get('sharedGenres'),
        overlap: r.get('overlap').toNumber(),
      }))
    } finally {
      await session.close()
    }
  }

  static async getFriendActivity(username) {
    if (!isNeo4jConnected()) return []
    const session = getSession()
    if (!session) return []
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
        movie: r.get('movie'),
        score: r.get('score'),
      }))
    } finally {
      await session.close()
    }
  }
}

export default GraphModel