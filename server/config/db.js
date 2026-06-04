
require('dotenv').config()
const mongoose = require('mongoose')

const MongodbUrl = process.env.MONGODB_URL

const dataConnection = async () => {
    try {
        const connection = await mongoose.connect(MongodbUrl)
        if(connection){
            console.log('DB connected successfully!');
        } else {
            console.log('Failed to connect to DB...');
        }
    } catch (error) {
        console.log('DB connection error:', error);
    }
}

module.exports = dataConnection
