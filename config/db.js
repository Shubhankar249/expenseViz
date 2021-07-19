const mongoose = require('mongoose');
const uri = "mongodb+srv://testUser:testPass@cluster0.njsgk.mongodb.net/test?retryWrites=true&w=majority";
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log('Connected ' + connect.connection.host);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
module.exports=connectDB;
