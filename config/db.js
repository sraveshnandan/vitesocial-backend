const mongoose = require("mongoose");

const conParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(process.env.MONGO_URI, conParams)
.then((con) => console.log(`Connected to the database : ${con.connection.host}`))
.catch(err => console.log(err))