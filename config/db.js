const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        // await connect.connection.db.dropDatabase();
        console.log('Connected ' + connect.connection.host);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
module.exports=connectDB;
