package models

// DiscoverItem is the simplified shape returned by GET /api/discover.
type DiscoverItem struct {
	TmdbId     int     `json:"tmdbId"`
	MediaType  string  `json:"mediaType"`
	Title      string  `json:"title"`
	Year       *string `json:"year"`
	PosterPath *string `json:"posterPath"`
	Status     string  `json:"status"`
}
