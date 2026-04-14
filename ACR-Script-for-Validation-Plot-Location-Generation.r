# ------------------------------------------------------------
# - ACR Script for Validation Plot Location Generation -
# ------------------------------------------------------------
# Randomly generate N points anywhere inside a SINGLE polygon feature
# Input: SHP or KMZ (KMZ must contain a polygon KML)
# Output: point shapefile + CSV + PNG map (+ optional HTML map)
# Goal: Utilize randomly distributed points as Validation Plot Centers for ACR's Framework for Remotely Sensed Quantification of Forest Carbon
# ------------------------------------------------------------

# ---- Packages ----
pkgs <- c("sf", "ggplot2", "dplyr", "readr", "leaflet", "htmlwidgets")
to_install <- pkgs[!pkgs %in% rownames(installed.packages())]
if (length(to_install) > 0) install.packages(to_install, dependencies = TRUE)

library(sf)
library(ggplot2)
library(dplyr)
library(readr)
library(leaflet)
library(htmlwidgets)

#Set working directory to desired location 
setwd("") # <-- specify directory where to run this script from

# ---- USER SETTINGS ----
input_path <- "path/to/your/polygon_file.kmz"  # <-- set to .kmz or .shp
n_points   <- 45 # <-- This number may be altered depending on the desired validation plots (45 is the minimum)
output_dir <- "outputs"

# If input is lon/lat (EPSG:4326), sample in equal-area for better uniformity
use_equal_area_sampling <- TRUE

# Reproducibility (Seed number to be assigned by ACR. Contact ACRForestry@winrock.org for assignment)
set.seed() # <-- Insert ACR assigned seed number here

# ---- Create output directory ----
if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)

# ------------------------------------------------------------
# Helper: read polygon from SHP or KMZ
# ------------------------------------------------------------
read_polygon <- function(path) {
  ext <- tolower(tools::file_ext(path))
  
  if (ext == "shp") {
    return(st_read(path, quiet = TRUE))
  }
  
  if (ext == "kmz") {
    tmpdir <- tempfile("kmz_unzip_")
    dir.create(tmpdir)
    unzip(path, exdir = tmpdir)
    
    kml_files <- list.files(tmpdir, pattern = "\\.kml$", full.names = TRUE, recursive = TRUE)
    if (length(kml_files) == 0) stop("No .kml found inside the KMZ.")
    
    # Read first KML found
    return(st_read(kml_files[1], quiet = TRUE))
  }
  
  stop("Unsupported file type. Provide a .shp or .kmz polygon input.")
}

# ------------------------------------------------------------
# 1) Read and isolate polygon geometry
# ------------------------------------------------------------
poly_raw <- read_polygon(input_path) %>%
  st_make_valid()

# Keep polygon geometry only
poly <- poly_raw %>%
  filter(st_geometry_type(geometry) %in% c("POLYGON", "MULTIPOLYGON"))

if (nrow(poly) == 0) stop("No POLYGON/MULTIPOLYGON geometry found in the input.")

# Single-feature expectation: if multiple features exist, union them (still one polygon area)
if (nrow(poly) > 1) {
  message("Input contains multiple polygon features; unioning into a single sampling geometry.")
  poly <- st_union(poly) |> st_as_sf()
  names(poly)[names(poly) == "x"] <- "geometry"
}

# ------------------------------------------------------------
# 2) Choose sampling CRS (equal-area if lon/lat)
# ------------------------------------------------------------
poly_sampling <- poly
is_lonlat <- st_is_longlat(poly_sampling)

if (use_equal_area_sampling && is_lonlat) {
  # Global equal-area CRS
  poly_sampling <- st_transform(poly_sampling, 6933)
}

# ------------------------------------------------------------
# 3) Randomly sample points inside polygon
# ------------------------------------------------------------
pts_geom <- st_sample(poly_sampling, size = n_points, type = "random", exact = TRUE)

# Convert to sf + add ID
pts_sf <- st_as_sf(pts_geom) %>%
  mutate(PointID = sprintf("P%02d", dplyr::row_number()))

# Transform points back to polygon CRS for consistent export
pts_out <- st_transform(pts_sf, st_crs(poly))

# ------------------------------------------------------------
# 4) Create output table (CSV): PointID + Lon/Lat + native X/Y
# ------------------------------------------------------------
# Native CRS coords
xy_native <- st_coordinates(pts_out)

# Lon/Lat coords (for easy use)
pts_ll <- st_transform(pts_out, 4326)
xy_ll  <- st_coordinates(pts_ll)

pts_table <- tibble(
  PointID = pts_out$PointID,
  Lon     = xy_ll[, 1],
  Lat     = xy_ll[, 2],
  X       = xy_native[, 1],
  Y       = xy_native[, 2]
)

csv_path <- file.path(output_dir, "random_points_45.csv")
write_csv(pts_table, csv_path)

# ------------------------------------------------------------
# 5) Export spatial files
# ------------------------------------------------------------
shp_path <- file.path(output_dir, "random_points_45.shp")
st_write(pts_out, shp_path, delete_layer = TRUE, quiet = TRUE)

kml_path <- file.path(output_dir, "random_points_45.kml")
st_write(st_transform(pts_out, 4326), kml_path, delete_dsn = TRUE, quiet = TRUE)

# ------------------------------------------------------------
# 6) Static map (PNG)
# ------------------------------------------------------------
png_path <- file.path(output_dir, "random_points_45_map.png")

p <- ggplot() +
  geom_sf(data = poly, fill = "grey90", color = "grey30", linewidth = 0.6) +
  geom_sf(data = pts_out, color = "red3", size = 2) +
  geom_sf_text(data = pts_out, aes(label = PointID), size = 3, nudge_y = 0) +
  labs(
    title = paste0("Random Points (n=", n_points, ") Inside Polygon"),
    subtitle = basename(input_path),
    caption = "Generated in R (sf::st_sample)"
  ) +
  theme_minimal()

ggsave(png_path, p, width = 8, height = 6, dpi = 300)

#Plot the AOI and Validation Plots
p

# ------------------------------------------------------------
# 7) Optional interactive map (HTML)
# ------------------------------------------------------------
html_path <- file.path(output_dir, "random_points_45_map.html")

leaf <- leaflet() %>%
  addProviderTiles(providers$CartoDB.Positron) %>%
  addPolygons(
    data = st_transform(poly, 4326),
    fillColor = "#cccccc", fillOpacity = 0.3,
    color = "#444444", weight = 2
  ) %>%
  addCircleMarkers(
    data = st_transform(pts_out, 4326),
    radius = 5, color = "red",
    label = ~PointID
  )

saveWidget(leaf, file = html_path, selfcontained = TRUE)

# ------------------------------------------------------------
# Done
# ------------------------------------------------------------
message("✅ Done! Outputs saved to: ", normalizePath(output_dir))
message(" - CSV:  ", csv_path)
message(" - SHP:  ", shp_path)
message(" - KML:  ", kml_path)
message(" - PNG:  ", png_path)
message(" - HTML: ", html_path)
