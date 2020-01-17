const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
  async update (req, res) {
    const { github_username } = req.params;

    const checkDev = await Dev.findOne({ github_username });

    if(!checkDev) {
      return res.status(400).json({ error: 'This Dev is not in our System '});
    }

    if(Object.keys(req.body).length === 0) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
  
      const { name = login, avatar_url, bio } = apiResponse.data;

      await checkDev.updateOne({ name, avatar_url, bio });

      return res.json({message: 'User has been updated!'});
    }

    const { name, avatar_url, bio, techs } = req.body;

    await checkDev.updateOne({ name, avatar_url, bio, techs });

    return res.json({message: 'User has been updated!'});
  },

  async delete (req, res) {
    const { github_username } = req.params;

    const checkDev = await Dev.findOne({ github_username });

    if (!checkDev) {
      return res.status(400).json({ error: 'This Dev is not in our System '});
    }

    await Dev.deleteOne(checkDev);

    return res.json({ message: 'The user has been deleted! '});
  },

  async index (req, res) {
    const devs = await Dev.find();

    return res.json(devs)
  },
  
  async store (req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    const checkDev = await Dev.findOne({ github_username });

    if (checkDev) {
      return res.status(400).json({ error: 'Dev already exists' });
    }

    const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
  
    const { name = login, avatar_url, bio } = apiResponse.data;
  
    const techsArray = parseStringAsArray(techs);
  
    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  
    const dev = await Dev.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    });
  
    return res.json(dev);
  }
};