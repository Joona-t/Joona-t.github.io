# C.C. bookshelf plaques

The simulator renders actual STL meshes for designs that have been constructed. Choose a design and drag to rotate. The yellow/red and orange/yellow choices are color previews of identical geometry; they do not simulate light transmission in translucent filament.

For the red/yellow two-color prototypes, the main plaque is yellow and the second mesh forms a thin red floor at the bottom of the recessed artwork. The floor sits 1 mm below the visible yellow surface. Each plaque is designed with a flat back, and the stand is a separate STL. The stand slot is 4.5 mm wide for a 4 mm plaque; a physical fit test is still needed.

A 240 mm square plaque collided with the two-color purge tower during the initial Bambu A1 slice. The revised designs use a 225 mm square, positioned to make room for a narrower purge tower. Concept 5 sliced successfully with two Bambu PLA Matte profiles, a 0.4 mm nozzle and a 0.2 mm layer height; inspect fine details in the slicer before printing. The model may need further detail edits if features merge. Other designs must each be sliced and reviewed individually; a successful geometry export is not a successful printability check.

For translucent orange filament, select the actual spool's matching profile in Bambu Studio and review the material settings. Opaque color previews do not predict light transmission, mixing, or surface appearance. Do not infer successful slicing from a model's presence in this viewer.

Concept provenance: designs 2 and 5 were recreated from their concept artwork as engraving stencils. The original 1–10 concept sheets are saved in `concepts/`; all engraving stencils are reconstructions from those images, not exact copies. Concepts 11–25 retain their three original concept sheets in `concepts/` and have individually recreated black-and-white engraving sources. Every stencil is a reinterpretation that should be compared visually with its concept, not a direct tracing.

The orange/yellow 3MF variants are visual color assignments using the same geometry. They currently inherit two Bambu PLA Matte profiles as placeholders; this is not a verified profile for an unknown translucent orange spool. Match both filament profiles to the actual spools and reslice before use.

Final automated audit: all 25 yellow/red 3MFs have a 225 × 225 × 4 mm watertight main body, a separate watertight accent mesh, and successful A1 CLI slice results with two PLA Matte filaments and no reported warnings. The layer code contains the red tool change. Estimated printing time is approximately 4.8–6.3 hours and total filament approximately 147–156 g per plaque. These figures depend on the chosen profiles and settings. The 227 mm and 230 mm tests collided with the purge tower, so those experimental sizes are not the recommended files. No physical print or stand fit test has been performed.
