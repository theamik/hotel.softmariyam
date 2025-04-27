const express = require("express");
const { dbConnect } = require("./utils/db");
const app = express();
const cors = require("cors");
const path = require("path");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();
const server = http.createServer(app);

exports.handler = async (event, context) => {
  const url = "https://retailmasterv2.onrender.com";

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({
          statusCode: 200,
          body: "Server pinged successfully",
        });
      } else {
        reject(
          new Error(`Server ping failed with status code: ${res.statusCode}`)
        );
      }
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

// app.use(
//   cors({
//     origin: ["https://hotel-softmariyam.vercel.app"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello Soft Mariyam");
});
// app.use('/api/v1/home', require('./routes/home/homeRoutes'))
app.use("/api/v1", require("./routes/authRoutes"));
// app.use("/api/v1", require("./routes/dashboard/companyRoutes"));
app.use("/api/v1", require("./routes/dashboard/ownerRoutes"));
// app.use("/api/v1", require("./routes/dashboard/staffRoutes"));
app.use("/api/v1", require("./routes/dashboard/roomRoutes"));
app.use("/api/v1", require("./routes/dashboard/foodRoutes"));
app.use("/api/v1", require("./routes/dashboard/partyRoutes"));
// app.use("/api/v1", require("./routes/dashboard/transactionRoutes"));
// app.use('/api/v1', require('./routes/dashboard/sellerRoutes'))
// app.use("/api/v1", require("./routes/dashboard/dashboardIndexRoutes"));
// app.use('/api/v1', require('./routes/home/customerAuthRoutes'))
// app.use('/api/v1', require('./routes/home/cardRoutes'))
app.use("/api/v1", require("./routes/order/orderRoutes"));
// app.use('/api/v1', require('./routes/chatRoutes'))
// app.use('/api/v1', require('./routes/paymentRoutes'))

// if (process.env.NODE_ENV === "production") {
//   const dirPath = path.resolve();
//   app.use(express.static("dashboard/"));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(dirPath, "dashboard/index.html"));
//   });
// }

const port = process.env.PORT;
dbConnect();
server.listen(port, () => console.log(`Server is running  on port ${port}!`));
