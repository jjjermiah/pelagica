package models

// DiscoverItem is the simplified shape returned by GET /api/discover.
type DiscoverItem struct {
	TmdbId     int     `json:"tmdbId"`
	MediaType  string  `json:"mediaType"`
	Title      string  `json:"title"`
	Year       *string `json:"year"`
	PosterPath *string `json:"posterPath"`
	Status     string  `json:"status"`
	// TmdbRating is TMDB's own 0-10 vote_average, sourced from the same
	// Jellyseerr discover-list call the handler already makes (no extra
	// requests). Omitted entirely (rather than sent as 0) when the title
	// has no votes yet.
	TmdbRating *float64 `json:"tmdbRating,omitempty"`
}
