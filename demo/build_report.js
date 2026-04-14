const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  ExternalHyperlink, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber
} = require("docx");

const FONT = "Arial";
const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

// ---- helpers ----
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 160, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
    ...opts.para
  });

const ps = (runs, opts = {}) =>
  new Paragraph({
    spacing: { after: 160, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: runs,
    ...opts.para
  });

const tr = (text) => new TextRun({ text, font: FONT, size: 22 });
const bold = (text) => new TextRun({ text, font: FONT, size: 22, bold: true });
const italic = (text) => new TextRun({ text, font: FONT, size: 22, italics: true });
const mono = (text) => new TextRun({ text, font: "Consolas", size: 20 });
const link = (text, url) =>
  new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text, font: FONT, size: 22, color: "0563C1", underline: {} })]
  });

const h1 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: FONT, size: 30, bold: true })] });
const h2 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 26, bold: true })] });
const h3 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 100 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true })] });

// Cell helper
const cell = (textOrRuns, opts = {}) => {
  const children = Array.isArray(textOrRuns)
    ? [new Paragraph({ children: textOrRuns, spacing: { after: 60 } })]
    : [new Paragraph({
        children: [new TextRun({ text: textOrRuns, font: FONT, size: 20, bold: !!opts.bold })],
        spacing: { after: 60 }
      })];
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.w, type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children
  });
};

// ---- Comparison table: Gold Standard SOC vs ACR RS Framework ----
const gsTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3200, 3080, 3080],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("Topic", { w: 3200, bold: true, shade: "E7E6E6" }),
        cell("Gold Standard SOC Methodology", { w: 3080, bold: true, shade: "E7E6E6" }),
        cell("ACR RS Framework", { w: 3080, bold: true, shade: "E7E6E6" })
      ]
    }),
    ...[
      ["Baseline scenario construction", "Section 6, detailed", "Deferred to underlying methodology"],
      ["Additionality test", "Section 14", "Absent"],
      ["Leakage accounting", "Section 11, Eq. 19", "Absent"],
      ["Non-permanence buffer", "Section 13", "Absent"],
      ["Double-counting rules", "Section 12", "Absent"],
      ["Other emissions (fuel, fertilizer, N2O)", "Section 10", "Absent"],
      ["Monitoring cadence and reports", "Section 16", "Partially (Section 4)"],
      ["Data archival requirements", "Section 16.1", "Absent"],
      ["Equipment calibration and traceability", "Section 16.1", "Absent"],
      ["SDG co-benefits", "Section 15", "Absent"]
    ].map(row =>
      new TableRow({ children: [
        cell(row[0], { w: 3200 }),
        cell(row[1], { w: 3080 }),
        cell(row[2], { w: 3080 })
      ]})
    )
  ]
});

// ---- Build content ----
const content = [
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Review of the ACR Framework for Remotely Sensed Quantification of Forest Carbon",
      font: FONT, size: 36, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Comparison against Gold Standard SOC and ISO 14064-5:2026",
      font: FONT, size: 26, italics: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 320 },
    children: [new TextRun({ text: "14 April 2026", font: FONT, size: 22, color: "595959" })]
  }),

  h1("Scope"),
  ps([
    tr("This review takes the ACR "),
    italic("Framework for Remotely Sensed Quantification of Forest Carbon"),
    tr(" (v1.0, March 2026), runs it end to end through the accompanying R script on a synthetic Oregon Cascades AOI, and measures what it asks for against two external reference points: the Gold Standard "),
    italic("Soil Organic Carbon Framework Methodology"),
    tr(" (v1.0, January 2020), and ISO 14064-5:2026, the new remote verification and validation guidance published by ISO in early 2026. One preliminary note on sources. The file supplied as "),
    mono("GOFC-GOLD_2020-SOC-Guidelines.pdf"),
    tr(" is not the GOFC-GOLD Sourcebook on forest monitoring. It is the Gold Standard SOC methodology. A useful comparator for project-level accounting completeness, but a different document. The ISO 14064-5 summary below is synthesised from the ISO catalogue entry, the ANSI Blog overview, and the BSI reseller listing. The full standard was not retrievable directly.")
  ]),

  h1("Strengths"),

  h2("Auditability by construction"),
  p("The seed is externally issued by ACR. The sampling is deterministic. The 20 percent and 10 percent accuracy thresholds are numeric pass-fail gates rather than narrative judgements. A verifier can reproduce a proponent's entire point set from three inputs: AOI, seed, N. This property is absent from most voluntary forest carbon methodologies, which leave sample design to the proponent and are accordingly gameable."),

  h2("Equal-area sampling by default"),
  p("Transforming the AOI to EPSG:6933 before calling st_sample removes a latitude bias that naive WGS-84 random sampling silently introduces. Most proponents would not know to do this. Embedding it in the published script prevents an entire class of methodological error before it starts."),

  h2("Separation of calibration and validation"),
  p("Section 3.2 forbids re-use of validation plots as calibration plots within the same reporting period. This closes the largest single leak in remotely sensed biomass workflows: the temptation to tune a model until it agrees with its own hold-out set."),

  h2("Correct pixel-plot overlap weighting"),
  p("Equation 2 uses area-weighted averaging of the pixels intersecting each validation plot polygon. This is the right pairing. Projects that fall back on centroid sampling, asking which pixel the plot centre sits in, routinely understate variance and overstate agreement."),

  h1("Weaknesses internal to the Framework"),

  h3("1. Simple random ignores project heterogeneity"),
  p("Section 3.1 mandates uniform random sampling across the AOI. For a tract that spans mature closed-canopy forest, recent harvest, riparian corridors, and young regeneration, uniform sampling wastes plots on the dominant stratum and under-samples the high-value rare strata. FIA, national forest inventories, and the CEOS AGB protocol all use stratified random designs. The Framework would be materially stronger if it permitted stratification against a pre-classified land-cover map with Neyman allocation."),

  h3("2. The agreement test conflates two different quantities"),
  p("UNC_RMSE in Equation 4 is a pixel-level accuracy metric: how well does the model predict at each plot. UNC_CI in Equation 6 is the uncertainty of the AOI mean: how precise is the total stock estimate. Both are useful. They test different hypotheses. A model can pass one and fail the other depending purely on N, because CI at 90 percent is RMSE divided by the square root of N, times 1.645. Doubling N from 45 to 90 shrinks UNC_CI by roughly thirty percent without changing the model. Section 3.4 allows a proponent who narrowly fails to keep installing plots. There is no cap. That is a soft loophole."),

  h3("3. Independence assumed, not tested"),
  p("Equation 5 is the standard-normal confidence interval for independent samples. Forest carbon fields carry strong spatial autocorrelation out to hundreds of metres. Validation plots drawn at random inside a five thousand hectare AOI will have correlated residuals. The effective sample size is smaller than N, so the true interval is wider than Equation 5 reports. The Framework requires no test of residual autocorrelation, no variogram, no effective-N correction."),

  h3("4. Observation error is not propagated"),
  p("C_AG,VP,i is treated as a point value. In practice each plot-level carbon stock carries allometric equation error of fifteen to twenty-five percent, DBH measurement error, plot geolocation error, and wood-density uncertainty. None of this flows into Equation 3. The RMSE therefore underreports total uncertainty and the 20-10 thresholds are applied to a cleaner quantity than reality supports."),

  h3("5. Plot size versus pixel size"),
  p("The script is silent on plot radius. Typical field plots are 0.04 to 0.10 hectares. A 0.1 hectare circular plot covers only one or two Landsat or Sentinel pixels at 30 metre resolution. At LiDAR resolutions the ratio is worse. Variance between plot mean and pixel mean becomes dominated by co-registration error rather than model skill. The Framework should require plot radius to exceed a prescribed multiple of pixel resolution and cap allowable geolocation RMS."),

  h3("6. No geolocation tolerance"),
  p("Section 3.2 says plot centres must be relocatable by the verifier but specifies no GNSS accuracy. A five-metre GNSS error in a 17.84-metre-radius plot corresponds to roughly a twenty-five percent area mismatch with the pixel overlay."),

  h3("7. RNG determinism is brittle across R versions"),
  p("set.seed is deterministic across st_sample calls on identical inputs, but the underlying R random number generator has changed historically, most notably in R 3.6 when sample was corrected for non-uniformity. The Framework pins no R version, no RNGkind, no Normal.kind. A proponent on R 3.5 and a verifier on R 4.4 can in principle disagree on the point set for a given seed."),

  h3("8. Stock, not stock change"),
  p("The Framework quantifies stock. Most crediting is on stock change between reporting periods. Section 4 defers this to remeasurement without defining the statistical test for delta carbon, which is exactly where autocorrelation and paired-plot design matter most."),

  h1("What the Framework does not cover"),
  p("The ACR document is explicitly a framework: a module layered on top of an underlying methodology such as ACR IFM, ACR Afforestation and Reforestation, or ART TREES. The methodology carries baseline, additionality, leakage, and buffer. The Framework supplies the remote sensing swap-in. This works only if the reader knows it. Nothing on page one states the dependency with the prominence it warrants. A proponent reading the document in isolation could plausibly conclude that the Framework produces credits. It does not. The comparison below illustrates the coverage gap against the Gold Standard SOC methodology, which does carry end-to-end project accounting."),

  gsTable,
  p(" "),

  h1("Gaps relative to ISO 14064-5:2026"),
  p("ISO 14064-5:2026 is guidance to the verifier, not the proponent. It specifies the conditions under which remote evidence gathering is acceptable during third-party validation and verification of GHG statements, either alone or in combination with site visits. The ACR Framework says nothing about verifier conduct. That leaves a clean gap between the two documents which the Framework would need to acknowledge before it can be called fully defensible in an ISO-aligned audit."),

  h3("Evidence-gathering plan"),
  p("ISO 14064-5 requires the verifier to document why remote techniques are sufficient for the project's risk profile. The Framework would benefit from a parallel proponent-facing document identifying which parts of the validation chain are verifiable remotely, the imagery, the raster processing, the sampling script, and which still require site presence, the allometric measurement, the plot monumentation, the boundary walk."),

  h3("Authenticity and integrity of geospatial evidence"),
  p("ISO 14064-5 treats provenance of digital evidence as a first-class concern. Cryptographic hashes of source imagery. Timestamps. Chain of custody from satellite provider through model output. The Framework requires none of this. A verifier working to ISO cannot accept a GeoTIFF whose provenance is untraceable. At minimum the Framework should require source imagery scene identifiers and DOIs, SHA-256 hashes of input rasters committed at project registration, a pinned model artefact, and a re-execution record proving that the same raster reproduces."),

  h3("Risk-based triggers for site visits"),
  p("ISO 14064-5 is explicit that remote techniques apply only where the risk assessment supports them. Disputed boundaries, prior non-conformities, high materiality, high inherent risk, or ambiguous land use force on-site presence. The ACR Framework allows the entire validation chain to run on a desktop. High-value projects will not meet the ISO expectation on this alone, and therefore may not meet CORSIA, EU CRCF, or Article 6.4 eligibility even once registered with ACR."),

  h3("Competence of the remote operator"),
  p("ISO 14064-5 carries forward ISO 14065's competence requirements. Remote sensing, GIS, and statistics competencies must be demonstrable. The Framework is silent on who is qualified to install validation plots, run the script, or interpret the RMSE. The Project Proponent is the only actor named."),

  h3("Materiality threshold"),
  p("ISO 14064-3 and -5 expect a quantitative materiality threshold, typically five percent of the statement, against which residual discrepancy is judged consequential. The Framework has accuracy thresholds of 20 and 10 percent but no materiality threshold. These are not the same thing. A three percent bias that survives the agreement test is still a credit-altering bias."),

  h3("Uncertainty as a credit discount"),
  p("ISO 14064-5 pairs with ISO 14064-2, which expects uncertainty to flow into a conservative credit calculation, the discount-for-uncertainty principle codified in the Gold Standard methodology at Equations 10 and 11. The ACR Framework stops at eligible or not eligible. A project that scrapes past UNC_RMSE of 19.9 percent issues at face value. A project at 20.1 percent fails entirely. The cliff is regulatorily convenient but statistically ugly."),

  h1("Limits of the pilot demonstration"),
  p("The pilot notebook is faithful to the letter of the Framework and makes the same simplifying assumptions the Framework does. C_obs is treated as error-free. Residuals are drawn Gaussian and independent, even though the underlying simulated field is spatially autocorrelated, which is the realistic case. Sampling is uniform random. A stratified design against the low-frequency structure of the raster would tighten RMSE at the same N and better reflect best practice. The pilot passes Section 3.4 with generous observation noise. Tightening that parameter produces a failing run, which is a worthwhile follow-up: it shows how close to the cliff a real project typically operates."),

  h1("Closing observation"),
  p("ACR has done something the rest of the voluntary forest-carbon space has not: published a deterministic, numerically specified, externally seeded script for one well-defined piece of the pipeline. That is a genuine advance for integrity. But the Framework covers a narrow slice of what a crediting document must do, by design, and does not anticipate ISO 14064-5:2026 verifier expectations around evidence provenance, risk-based triggers, competence, and materiality. Projects operating under the Framework should expect any ISO-aligned verifier to impose requirements above and beyond its text, especially around raster chain of custody and the conditions under which a site visit is non-negotiable. The Framework would benefit from a forward-referencing section mapping its outputs onto ISO 14064-3 Section 6.1.4 and ISO 14064-5 evidence categories."),

  h1("Sources"),
  ps([link("ISO 14064-5:2026. Greenhouse gases, Part 5: Guidance on activities and techniques used remotely in conducting verification and validation of GHG statements.", "https://www.iso.org/standard/87716.html")]),
  ps([link("BS ISO 14064-5:2026 (BSI reseller listing).", "https://www.en-standard.eu/bs-iso-14064-5-2026-greenhouse-gases-guidance-on-activities-and-techniques-used-remotely-in-conducting-verification-and-validation-of-greenhouse-gas-statements/")]),
  ps([link("ANSI Blog. ISO 14064-5, Verification and validation of GHG statements.", "https://blog.ansi.org/ansi/iso-14064-5-verification-validation-ghg-statements/")]),
  ps([link("ISO 14064-3:2019. Parent specification supplemented by 14064-5.", "https://www.iso.org/standard/66455.html")]),
  ps([link("ACR Framework for Remotely Sensed Quantification of Forest Carbon, v1.0, March 2026.", "https://acrcarbon.org/program_resources/framework-for-remotely-sensed-quantification-of-forest-carbon/")]),
  ps([tr("Gold Standard. Soil Organic Carbon Framework Methodology, v1.0, January 2020.")])
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: "1F4E79" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: "2E75B6" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: FONT, size: 18, color: "7F7F7F" }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "7F7F7F" })
          ]
        })]
      })
    },
    children: content
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("ACR_RS_Framework_Review.docx", buf);
  console.log("wrote ACR_RS_Framework_Review.docx,", buf.length, "bytes");
});
