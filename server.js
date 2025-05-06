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

app.use(
  cors({
    origin: ["https://hotel-softmariyam.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// app.use(
//   cors({
//     origin: ["http://localhost:5173"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );
app.use(express.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hello Soft Mariyam");
});
// app.use('/api/v1/home', require('./routes/home/homeRoutes'))
app.use("/api/v1", require("./routes/authRoutes"));
app.use("/api/v1", require("./routes/dashboard/companyRoutes"));
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
console.log("Serving static from:", path.join(__dirname, "uploads"));
