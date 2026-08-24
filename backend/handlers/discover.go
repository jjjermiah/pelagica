package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

const (
	defaultDiscoverRegion  = "US"
	discoverRequestTimeout = 10 * time.Second
	discoverResultsLimit   = 20
)

// jellyseerrConfig reads the Jellyseerr base URL and API key from the
// environment. Both must be set for Jellyseerr-backed discover endpoints to
// be considered configured.
func jellyseerrConfig() (baseURL string, apiKey string, ok bool) {
	baseURL = strings.TrimRight(strings.TrimSpace(os.Getenv("JELLYSEERR_URL")), "/")
	apiKey = strings.TrimSpace(os.Getenv("JELLYSEERR_API_KEY"))
	return baseURL, apiKey, baseURL != "" && apiKey != ""
}

func jellyseerrNotConfiguredResponse(c fiber.Ctx) error {
	return c.Status(fiber.StatusServiceUnavailable).JSON(models.APIError{Error: "jellyseerr not configured"})
}

type jellyseerrDiscoverMediaInfo struct {
	Status int `json:"status"`
}

type jellyseerrDiscoverResult struct {
	ID           int                          `json:"id"`
	MediaType    string                       `json:"mediaType"`
	Title        string                       `json:"title"`
	Name         string                       `json:"name"`
	ReleaseDate  string                       `json:"releaseDate"`
	FirstAirDate string                       `json:"firstAirDate"`
	PosterPath   string                       `json:"posterPath"`
	MediaInfo    *jellyseerrDiscoverMediaInfo `json:"mediaInfo"`
}

type jellyseerrDiscoverResponse struct {
	Page         int                        `json:"page"`
	TotalPages   int                        `json:"totalPages"`
	TotalResults int                        `json:"totalResults"`
	Results      []jellyseerrDiscoverResult `json:"results"`
}

// discoverStatus maps the Jellyseerr media status enum to the simplified
// status string returned to the frontend.
func discoverStatus(mediaInfo *jellyseerrDiscoverMediaInfo) string {
	if mediaInfo == nil {
		return "none"
	}

	switch mediaInfo.Status {
	case 2:
		return "pending"
	case 3:
		return "processing"
	case 4:
		return "partial"
	case 5:
		return "available"
	default:
		return "none"
	}
}

// discoverYear extracts a 4-digit year from a Jellyseerr date string
// (e.g. "2024-05-01"), returning nil if unavailable.
func discoverYear(date string) *string {
	date = strings.TrimSpace(date)
	if len(date) < 4 {
		return nil
	}

	year := date[:4]
	for _, r := range year {
		if r < '0' || r > '9' {
			return nil
		}
	}

	return &year
}

func toDiscoverItem(result jellyseerrDiscoverResult, fallbackMediaType string) models.DiscoverItem {
	mediaType := result.MediaType
	if mediaType == "" {
		mediaType = fallbackMediaType
	}

	title := result.Title
	if title == "" {
		title = result.Name
	}

	date := result.ReleaseDate
	if date == "" {
		date = result.FirstAirDate
	}

	var posterPath *string
	if result.PosterPath != "" {
		posterPath = &result.PosterPath
	}

	return models.DiscoverItem{
		TmdbId:     result.ID,
		MediaType:  mediaType,
		Title:      title,
		Year:       discoverYear(date),
		PosterPath: posterPath,
		Status:     discoverStatus(result.MediaInfo),
	}
}

// GetDiscover proxies GET /api/discover to Jellyseerr's discover endpoints,
// returning a simplified, capped list of results for the "top picks" widget.
func GetDiscover(c fiber.Ctx) error {
	mediaType := strings.TrimSpace(c.Query("type"))
	if mediaType != "movie" && mediaType != "tv" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "type must be 'movie' or 'tv'"})
	}

	provider := strings.TrimSpace(c.Query("provider"))
	if provider == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "provider is required"})
	}

	region := strings.TrimSpace(c.Query("region"))
	if region == "" {
		region = defaultDiscoverRegion
	}

	baseURL, apiKey, ok := jellyseerrConfig()
	if !ok {
		return jellyseerrNotConfiguredResponse(c)
	}

	discoverPath := "/api/v1/discover/movies"
	if mediaType == "tv" {
		discoverPath = "/api/v1/discover/tv"
	}

	endpoint, err := url.Parse(baseURL + discoverPath)
	if err != nil {
		slog.Error("Failed to build Jellyseerr discover URL", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Jellyseerr request"})
	}

	q := endpoint.Query()
	q.Set("watchProviders", provider)
	q.Set("watchRegion", region)
	q.Set("sortBy", "popularity.desc")
	endpoint.RawQuery = q.Encode()

	req, err := http.NewRequest(http.MethodGet, endpoint.String(), nil)
	if err != nil {
		slog.Error("Failed to build Jellyseerr discover request", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Jellyseerr request"})
	}
	req.Header.Set("X-Api-Key", apiKey)

	resp, err := (&http.Client{Timeout: discoverRequestTimeout}).Do(req)
	if err != nil {
		slog.Error("Jellyseerr discover request failed", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to reach Jellyseerr"})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error("Failed to read Jellyseerr discover response", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to read Jellyseerr response"})
	}

	if resp.StatusCode != http.StatusOK {
		slog.Error("Unexpected status from Jellyseerr discover", "status", resp.StatusCode, "body", string(body))
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to fetch discover results from Jellyseerr"})
	}

	var payload jellyseerrDiscoverResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		slog.Error("Failed to parse Jellyseerr discover response", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to parse Jellyseerr response"})
	}

	results := payload.Results
	if len(results) > discoverResultsLimit {
		results = results[:discoverResultsLimit]
	}

	items := make([]models.DiscoverItem, 0, len(results))
	for _, result := range results {
		items = append(items, toDiscoverItem(result, mediaType))
	}

	return c.Status(fiber.StatusOK).JSON(items)
}

type discoverRequestBody struct {
	TmdbId    int    `json:"tmdbId"`
	MediaType string `json:"mediaType"`
}

// PostDiscoverRequest proxies POST /api/discover/request to Jellyseerr's
// request-creation endpoint using the app-level API key.
func PostDiscoverRequest(c fiber.Ctx) error {
	var reqBody discoverRequestBody
	if err := c.Bind().Body(&reqBody); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid request body"})
	}

	if reqBody.MediaType != "movie" && reqBody.MediaType != "tv" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "mediaType must be 'movie' or 'tv'"})
	}
	if reqBody.TmdbId <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "tmdbId is required"})
	}

	baseURL, apiKey, ok := jellyseerrConfig()
	if !ok {
		return jellyseerrNotConfiguredResponse(c)
	}

	payload := map[string]any{
		"mediaType": reqBody.MediaType,
		"mediaId":   reqBody.TmdbId,
	}
	if reqBody.MediaType == "tv" {
		payload["seasons"] = "all"
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		slog.Error("Failed to build Jellyseerr request payload", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Jellyseerr request"})
	}

	req, err := http.NewRequest(http.MethodPost, baseURL+"/api/v1/request", bytes.NewReader(payloadBytes))
	if err != nil {
		slog.Error("Failed to build Jellyseerr request", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to build Jellyseerr request"})
	}
	req.Header.Set("X-Api-Key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := (&http.Client{Timeout: discoverRequestTimeout}).Do(req)
	if err != nil {
		slog.Error("Jellyseerr request creation failed", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to reach Jellyseerr"})
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error("Failed to read Jellyseerr request-creation response", "error", err)
		return c.Status(fiber.StatusBadGateway).JSON(models.APIError{Error: "Failed to read Jellyseerr response"})
	}

	if resp.StatusCode != http.StatusCreated {
		slog.Error("Jellyseerr rejected request creation", "status", resp.StatusCode, "body", string(respBody))
		return c.Status(resp.StatusCode).Type("json").Send(respBody)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"ok": true})
}
