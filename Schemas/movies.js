import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a sting",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  genre: z.array(
    z.enum(["action", "comedy", "drama", "horror", "romance", "fiction"]),
    {
      required_error: "Movie genre is required",
      invalid_type_error: "Movie genre must be an array of strings",
    }
  ),
});

export function validateMovie(movie) {
  return movieSchema.safeParse(movie);
}

export function validatePartialMovie(object) {
  //partial lo que hara es que si el objeto no tiene todas las propiedades del esquema, no dara error
  return movieSchema.partial().safeParse(object);
}
