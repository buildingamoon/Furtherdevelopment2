const mongoose = require('mongoose');

const searchContent = async (req, res) => {
  const keyword = req.query.keyword.toLowerCase();
  const includeCollections = ['discussions', 'messages', 'posts', 'products'];

  try {
    let collections = await mongoose.connection.db.listCollections().toArray();
    collections = collections.map(col => col.name).filter(col => includeCollections.includes(col));

    const searchPromises = collections.map(collection => {
      return mongoose.connection.db.collection(collection)
        .find({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } }
          ]
        })
        .toArray();
    });

    const results = (await Promise.all(searchPromises)).flat();
    res.json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { searchContent };
