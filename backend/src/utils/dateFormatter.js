const { formatDistanceToNow } = require('date-fns'); 

exports.formatRelativeDate = (neo4jDate) => {
    const jsDate = new Date(
        neo4jDate.year.low,
        neo4jDate.month.low - 1,
        neo4jDate.day.low
    );
    return formatDistanceToNow(jsDate, { addSuffix: true });
};