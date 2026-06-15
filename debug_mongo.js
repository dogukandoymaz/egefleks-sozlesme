import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://dogukandoymaz_db_user:pfuqL8ZC3ZZyGzLo@cluster0.qkiwglt.mongodb.net/egefleks?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- Collection ${col.name} has ${count} documents.`);
      if (col.name === 'contracts') {
        const samples = await db.collection(col.name).find({}).limit(2).toArray();
        console.log("Sample contracts:", JSON.stringify(samples, null, 2));
      }
    }
  } catch (err) {
    console.error("Mongo Debug Error:", err);
  } finally {
    await client.close();
  }
}

run();
