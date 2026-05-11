const { formatDistanceToNow } = require('date-fns'); // npm install date-fns

exports.formatRelativeDate = (neo4jDate) => {
    // Convert Neo4j date object to JS Date
    const jsDate = new Date(
        neo4jDate.year.low,
        neo4jDate.month.low - 1,
        neo4jDate.day.low
    );
    return formatDistanceToNow(jsDate, { addSuffix: true });
};