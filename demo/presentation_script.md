# Oral presentation script

*ACR Framework for Remotely Sensed Quantification of Forest Carbon: an end-to-end pilot demonstration.*

Target speaking time: nine to ten minutes at a comfortable pace, roughly 1,150 words.

---

Good morning. What I want to walk you through is the new ACR Framework for Remotely Sensed Quantification of Forest Carbon, published last month, and a working pilot that puts every equation through its paces on a synthetic forest tract. Nothing we are looking at today uses real project data. The AOI is fabricated. The pixels are simulated. The field measurements are drawn from a Gaussian. What is real is the procedure. Every line of code on screen is what ACR says a proponent must do, run on inputs we can inspect end to end.

I will start with the methodology, because the pilot only makes sense once you see the pipeline it implements.

The Framework is a four-stage pipeline. Stage one is the Predictive Model. The proponent trains a model linking remote sensing covariates, typically Landsat or Sentinel, sometimes LiDAR or radar, to field-measured carbon at Calibration Plots. The model is then applied to every pixel across the Area of Interest and produces a wall to wall raster of predicted carbon density. Section 2.4 rolls that raster up to an AOI-level mean. That mean is the crediting quantity, once the model is approved.

Stage two is validation plot location generation. This is where ACR has done something genuinely new. Rather than letting each proponent choose their own design, the Framework mandates that you run a single published R script. You supply the AOI as a shapefile or a KMZ. You request a seed from ACR. You set N to at least forty-five points. The script reprojects the AOI to an equal-area coordinate system and draws N uniform random points inside the polygon. Seed plus AOI plus N uniquely determine the point set. The verifier can reproduce it exactly. That is the entire anti-cherry-picking mechanism, and it is the reason the script exists.

Stage three is field installation. Crews walk to each coordinate and install a circular or square plot. They measure only the carbon pools the predictive model claims to estimate. Minimum thirty plots installed, with the surplus up to forty-five existing as skip replacements for points that fall on a Calibration Plot or a prior Validation Plot.

Stage four is the eligibility test. Each plot is paired with the pixels that overlap it. Equation two gives an area-weighted average predicted carbon density per plot. Equation three is the RMSE between predicted and observed across all forty-five plots. Equation four expresses RMSE as a percentage of mean observed carbon. That is the first threshold. Equation five is the ninety percent confidence interval, RMSE divided by root N, times 1.645. Equation six expresses the CI as a percentage. That is the second threshold. The model is eligible only when the RMSE percentage is under twenty and the CI percentage is ten or less. Both conditions, not one. If the test fails, the proponent can install more plots in the same sequence, or stop, request a fresh seed, and restart Section three.

Four stages. Six equations. Two numeric thresholds. One deterministic script.

Now let me show you the pilot.

You are looking at a Quarto document that renders to a single self-contained HTML file. Everything is reproducible from one seed.

Section one builds the AOI. We place the centroid in the Oregon Cascades and perturb a circle with sinusoidal and random noise to give a non-convex boundary. The result is a five thousand hectare tract that looks plausibly like a real project.

Section two simulates the Predictive Model. We do not fit a regression. We simulate its output. A thirty metre raster with spatial autocorrelation baked in, so neighbouring pixels are not independent draws. Mean around three hundred and fifty tonnes of CO2 equivalent per hectare. A realistic order of magnitude for a Pacific Northwest stand. We drop sixty decorative Calibration Plots on the map to keep the narrative complete, but they play no statistical role in what follows. The Framework forbids reuse of validation plots as calibration plots within a reporting period.

Section three runs the ACR script logic. Forty-five points, equal-area sampling, seeded. A few lines of code. Exactly what ACR publishes.

Then we simulate the field measurement. Each validation plot is a tenth-of-a-hectare circular plot, consistent with FIA subplot practice. For every plot we compute the area-weighted average predicted carbon from the raster underneath. That is Equation two. Then we generate an observed value by adding a small positive bias and Gaussian noise to the prediction. The bias stands in for a model that slightly under-predicts mature stands, which is a common real-world failure mode.

Section three point three is the eligibility arithmetic. RMSE. RMSE as a percentage. Ninety percent CI. CI as a percentage. The decision, side by side with the thresholds. As currently parameterised, the model passes. Both conditions are met. Tighten the simulated noise and rerun, and it fails, which would put you in the remeasurement and reseed pathway.

Section four produces the AOI-level mean carbon density the project would actually credit against. We embed an interactive leaflet map directly into the rendered HTML so the reviewer can toggle the raster, the AOI outline, the calibration plots, and the validation plots without leaving the document.

Two honest caveats, and then I am done.

The first is about the pilot. It is faithful to the letter of the Framework. It is not a fair test of a real predictive model, because our observation process is Gaussian and independent. A real field measurement carries allometric uncertainty, DBH measurement error, and plot geolocation error. None of that flows into Equation three as the Framework is currently written. The pilot shows the math works. It does not show the math is tight.

The second is about the Framework itself. It covers a narrow, well-defined slice: model eligibility and the AOI roll-up. It does not cover baseline, additionality, leakage, buffer, or issuance. Those sit in the host methodology, ACR IFM or ART TREES or whatever else the proponent is using. And it does not yet speak to the new ISO 14064-5 remote verification standard published in February, which is going to ask verifiers for raster chain of custody, for materiality thresholds, and for risk-based triggers that force a site visit. Projects registered under this Framework will still need to satisfy that separately.

But within its scope, the Framework has done something the rest of the voluntary forest carbon space has not. It has turned the first sampling step of a remote sensing audit into a deterministic, reproducible, numerically specified procedure. The script you saw today is the centrepiece of that, and the pilot shows that the downstream equations behave exactly as the Framework requires.

Happy to take questions.
