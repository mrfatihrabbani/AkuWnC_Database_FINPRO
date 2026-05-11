const bcrypt = require('bcrypt');

// Hash password before saving to Neo4j
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare password during login
exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};