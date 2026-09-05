# LA BOR — NEXT CLAUDE CODE PACKAGE

Upload / keep these in the repository under `docs/`:

## New gameplay-first docs
1. `LABOR_PLAYABILITY_MOBILE_REBUILD.md`
2. `LABOR_REAL_MAP_TILED_GUIDE.md`
3. `LABOR_AVATAR_PROFILE_SYSTEM.md`
4. `LABOR_MISSIONS_MINIGAMES_SYSTEM.md`

## Existing source-of-truth docs
5. `LABOR_ART_DIRECTION_ASSETS.md`
6. `LABOR_DIGITAL_EXPERIENCE_HANDOFF_V2.md`
7. `LABOR_GAMEPLAY_V1_HANDOFF.md`

## Prompt
8. `CLAUDE_CODE_PLAYABILITY_REBUILD_PROMPT.md`

Then give Claude Code only this short instruction:

```text
Read docs/CLAUDE_CODE_PLAYABILITY_REBUILD_PROMPT.md and every source document it references. Inspect the current repository before making changes. The priority is mobile playability and real-map geometry, not visual polish. Work phase-by-phase, run and test after each structural change, and do not continue to decorative work until the mobile playtest gate passes.
```
