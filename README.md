# ACR Remote Sensing Framework Demonstration

A self-contained pilot that walks the new ACR *Framework for Remotely Sensed Quantification of
Forest Carbon* (v1.0, March 2026) end to end on a synthetic Oregon Cascades AOI. The Framework sits
on top of an existing host methodology (ACR IFM, ART TREES, and so on) and defines how a remote
sensing predictive model is tested for eligibility using randomly allocated validation plots. No
real project data are used here. Every input is simulated so the procedure itself can be inspected
line by line.

## Layout

```         
.
├── ACR-Methodology-Framework-for-Remotely-Sensed-Quantification-of-Forest-Carbon-20260327.pdf
├── ACR-Summary-and-Response-to-Public-Comments-RS-Framework-20260327.pdf
├── ACR-Script-for-Validation-Plot-Location-Generation.r   # ACR reference script
└── demo/
    ├── acr_validation_demo.qmd          # Narrow demo: just the ACR script logic
    ├── acr_validation_demo.html         # Rendered, self-contained
    ├── acr_full_framework_demo.qmd      # End-to-end pilot (every equation)
    ├── acr_full_framework_demo.html     # Rendered, self-contained
    ├── acr_full_framework_demo.docx     # Word export of the full pilot
    ├── presentation_script.md           # 9–10 min oral walkthrough
    ├── ACR_RS_Framework_Presentation_Script.docx
    ├── ACR_RS_Framework_Review.docx     # Critical review + ISO 14064-5 gap analysis
    ├── build_report.js                  # docx-js builder for the review
    ├── build_presentation.js            # docx-js builder for the script
    ├── aoi.shp / aoi.kmz                # Synthetic ~5,000 ha AOI
    ├── outputs/                         # Validation-demo artefacts
    └── outputs_full/                    # Full-pilot artefacts
```

## What each piece produces

`demo/acr_validation_demo.qmd` is the narrow demonstration. It reproduces the published ACR script
against the synthetic AOI, draws forty-five random validation plot centres using equal-area sampling
in EPSG:6933, and writes CSV, SHP, KML, PNG, and an interactive leaflet HTML into `demo/outputs/`.

`demo/acr_full_framework_demo.qmd` is the end-to-end pilot. It builds the AOI, simulates a
thirty-metre pixel raster of aboveground carbon density, fabricates sixty calibration plots, runs
the validation-point script inline, simulates field measurement at 0.1 ha circular plots, and then
walks every equation the Framework defines: Equation 2 (area-weighted pixel–plot overlap), Equation
3 (RMSE), Equation 4 (UNC_RMSE), Equation 5 (90 % CI), Equation 6 (UNC_CI), and the Section 3.4
twenty-ten eligibility decision. It closes with a Section 2.4 AOI-level roll-up and an interactive
leaflet map embedded in the rendered HTML. Artefacts land in `demo/outputs_full/` (predicted AGC
raster, validation and calibration shapefiles, eligibility CSV, standalone leaflet HTML).

`demo/ACR_RS_Framework_Review.docx` is a critical review of the Framework, comparing coverage
against the Gold Standard SOC methodology and gaps against ISO 14064-5:2026. Strengths, statistical
weaknesses, and verifier- facing omissions are laid out as continuous prose.

`demo/presentation_script.md` and the matching `.docx` are a 9–10 minute oral walkthrough written
for reading aloud: 14 pt, 1.5 line spacing, generous paragraph breaks.

## Reproducing

``` bash
# Render both notebooks
cd demo
quarto render acr_validation_demo.qmd
quarto render acr_full_framework_demo.qmd

# Rebuild the Word deliverables
node build_report.js
node build_presentation.js
```

R dependencies used by the notebooks: `sf`, `terra`, `ggplot2`, `dplyr`, `tibble`, `tidyr`, `readr`,
`leaflet`, `htmlwidgets`, `knitr`. Word export uses the `docx` npm package (`npm install -g docx`).

## Caveats

The pilot is faithful to the letter of the Framework and is not a fair test of a real predictive
model. Observation error is Gaussian and independent. Allometric, DBH, and geolocation error are not
propagated. Sampling is uniform random rather than stratified. The seed used throughout, `20260414`,
is a placeholder. Real projects receive seeds from ACR by request to
[ACRForestry\@winrock.org](mailto:ACRForestry@winrock.org){.email}.
