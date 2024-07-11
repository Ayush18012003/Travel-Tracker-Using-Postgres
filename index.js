import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let countries = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "auhgpa2003@",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.query("SELECT country_code FROM visited_countries", (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    res.rows.forEach((country) => {
      countries.push(country.country_code);
    });
  }
});

app.get("/", async (req, res) => {
  //Write your code here.
  res.render("index.ejs", { total: countries.length, countries: countries });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const code = await db.query(
      "SELECT country_code FROM countries WHERE country_name LIKE '%' || $1 || '%'",
      [input]
    );
      const data = code.rows[0];
      const country_code = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [country_code]
      );
      countries.push(data.country_code);
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added.",
      });
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "No such Country Exists in the Database",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
