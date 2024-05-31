/**
 * The function establishes a connection to a MongoDB database using Mongoose in a TypeScript
 * environment.
 */
import mongoose from "mongoose";


export default async function connection() {
    try {
        await mongoose.connect("mongodb+srv://Cluster30345:Senioryear3009@cluster30345.6tcvlcr.mongodb.net/")
        console.log('connection true')
    } catch (err) {
        console.log(err)
    }
}
