// dbOperations.js
const { MongoClient } = require('mongodb');

// Function to establish connection to the database
async function connectToDb(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
}

// Function to insert a document into the 'Image_database' collection
async function insertDocument(rootname, fPath, exText) {
    const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
    const client = await connectToDb(uri);
    const db = client.db('markerDatabase');
    const collection = db.collection('Image_database');

    // Create the document based on the parameters
    const document = {
        filerootname: rootname,
        filepath: fPath,
        extractedText: exText
    };

    try {
        // Insert the document into the collection
        const result = await collection.insertOne(document);

        // Create a text index on the 'extractedText' field
        await collection.createIndex({ extractedText: 'text' });

        console.log('Document inserted with _id:', result.insertedId);
    } catch (error) {
        console.error('Error inserting document:', error);
    } finally {
        // Close the connection to the database
        await client.close();
    }
}

// Export the function
module.exports = {
    insertDocument
};
