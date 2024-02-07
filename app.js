import express from "express";

import crypto from "node:crypto";

import movies from "./movies.json" assert { type: "json" };

import cors from "cors";

import { validateMovie, validatePartialMovie } from "./Schemas/movies.js";

const app = express();
const port = process.env.PORT ?? 1234;

// sacar el X-Powered-By: Express
app.disable("x-powered-by");
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      const ACCEPTED_ORIGINS = ["http://localhost:3000", "https://example.com"];

      if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
  })
);

//todos los recursos que sean MOVIRES se identifica con /movies
app.get("/movies", (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }

  res.json(movies);
});

//recuperar peliculas por id
app.get("/movies/:id", (req, res) => {
  //path-to-regexp
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id == id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: "movie not found" });
});

app.post("/movies", (req, res) => {
  const resultado = validateMovie(req.body);

  if (resultado.error) {
    return res.status(400).json({ error: JSON.parse(resultado.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...resultado.data,
  };
  //esto no seria REST, porque estamos guardando el estado en la aplicacion en memoria

  movies.push(newMovie);
  return res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id == id);
  if (movieIndex === -1)
    return res.status(404).json({ message: "movie not found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };
  movies[movieIndex] = updateMovie;
  return res.json(updateMovie);
});

app.listen(port, () => {
  console.log(`Servidor de Express escuchando en el puerto ${port}`);
});
