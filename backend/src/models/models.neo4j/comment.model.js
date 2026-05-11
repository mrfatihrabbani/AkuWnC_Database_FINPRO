import mongoose from 'mongoose'

const driver = require('../config/neo4j.js');

class Comment {
  constructor(text, profileId, reviewId, ratingValue = null) {
    this.text = text;
    this.profileId = profileId;
    this.reviewId = reviewId;
    this.ratingValue = ratingValue;
  }

  async save() {
    const session = driver.session();
    try {
      const query = `
        MATCH (p:Profile {id: $profileId})
        MATCH (r:Review {id: $reviewId})
        CREATE (c:Comment {
          id: randomUUID(), 
          text: $text, 
          timestamp: datetime()
        })
        MERGE (p)-[:POSTED_COMMENT]->(c)
        MERGE (c)-[:ON_REVIEW]->(r)
        ${this.ratingValue ? 'MERGE (c)-[:HAS_RATING]->(:Rating {value: $ratingValue})' : ''}
        RETURN c
      `;
      
      const result = await session.run(query, {
        profileId: this.profileId,
        reviewId: this.reviewId,
        text: this.text,
        ratingValue: this.ratingValue
      });
      return result.records[0].get('c').properties;
    } finally {
      await session.close();
    }
  }

  static async findByReview(reviewId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (r:Review {id: $reviewId})<-[:ON_REVIEW]-(c:Comment)
         MATCH (p:Profile)-[:POSTED_COMMENT]->(c)
         RETURN c, p.username AS author`,
        { reviewId }
      );
      return result.records.map(record => ({
        comment: record.get('c').properties,
        author: record.get('author')
      }));
    } finally {
      await session.close();
    }
  }
}

module.exports = Comment;