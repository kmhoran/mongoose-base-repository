import mongoose from 'mongoose';

export default async (dbUrl: string, dbName: string) => {
    const connect = async () => {
        try{
            await mongoose.connect(`${dbUrl}/${dbName}`, {
                useNewUrlParser: true, 
                useUnifiedTopology: true,
                useFindAndModify: false
            });
            console.log(`Successfully connected to ${dbName}`);
        } catch(err){
            console.error(`Error connecting to database`, err);
            return process.exit(1);
        }
        

    };
    await connect();
    mongoose.connection.on('disconnected', connect);
}