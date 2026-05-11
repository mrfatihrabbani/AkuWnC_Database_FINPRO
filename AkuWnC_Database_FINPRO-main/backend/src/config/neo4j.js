import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
dotenv.config()

let driver = null
let isConnected = false

try {
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  )
} catch (err) {
  console.error('Neo4j driver creation error:', err.message)
}

export const getSession = () => {
  if (!driver || !isConnected) {
    return null
  }
  return driver.session()
}

export const isNeo4jConnected = () => isConnected

export const connectNeo4j = async () => {
  if (!driver) {
    console.warn('Neo4j driver not available - skipping connection')
    return
  }

  try {
    await driver.verifyConnectivity()
    isConnected = true
    console.log('Neo4j Aura connected')
  } catch (err) {
    isConnected = false
    console.error('Neo4j connection error:', err.message)
    console.warn('App will continue without Neo4j features')
    // dont exit, app can still run without neo4j
  }
}

export default driver