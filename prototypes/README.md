# Prototypes

## `robotask-prototype.html`

The full interactive RoboTask prototype, published as a Claude Artifact for the
hospital department-head presentation. Single self-contained HTML file — open it
directly in a browser, no build step and no server.

### What it is

A working prototype, not a mockup. One shared in-memory data model (`DATA.items`)
backs every screen: add or update a clinical item anywhere and it appears in the
Patient Canvas, Timeline, Tasks, Table View, Handoff and Manager Dashboard,
because they all read the same entity.

### Screens

| Area | Screens |
| --- | --- |
| Physician | Doctor Home (command center), Patients, Patient Canvas, Timeline, My Tasks, Table View, Clinical Assistant |
| Nurse | Nurse board, Ward Map, Shift Handoff |
| Manager | Manager Dashboard, Workload, Automation Builder |
| External | Family view, Patient view, Consultant view |

Roles switch from the sidebar; each role gets its own navigation.

### Patient Canvas

The core screen. The patient sits at the center of a 4×4 grid whose 12 perimeter
cells hold the fixed clinical categories, with SVG connectors drawn from the hub
to each card (recomputed on layout change via `ResizeObserver`).

The Clinical Toolbox is a searchable side panel of predefined clinical actions.
Dragging an action onto a category highlights the valid target, dims the rest,
turns that category's connector blue, then opens a scheduling popover
(date / time / priority / responsible / dependency / notes). Dropping on the
wrong category auto-routes to the correct one and says so. Every toolbox item
also has a click-to-add button for accessibility.

### The task catalogue and the closed loop

Department tasks are a **closed list**, not free text (`TASK_CATALOG`: 11 groups,
46 tasks). Picking a task from it is what lets the app route the work rather than
just record it — each catalogue entry carries the category it belongs to, who
normally defines it, who normally performs it, and the window it must close in.
Drop an action on the wrong category and the form re-routes it and says so.

A task definition therefore has four fields:

| Field | Meaning |
| --- | --- |
| מגדיר המשימה | who assigned it |
| המשימה | chosen from the catalogue |
| היעד | who performs it |
| הגדרת הזמן לביצוע | the window (`DUE_PRESETS`), resolved to a day + clock time |

**The loop closes in one direction.** The target sees the task in their own list
and in the patient's file. When they mark it done, the definer is notified, the
task moves from open to task history, and it stops appearing beside the
patient's name — history is opt-in, so a closed loop never re-surfaces on its
own. Past its window and still open, the task alerts the person who has to
perform it.

### Visual language

Derived from the approved references in `design/references/`: warm ivory ground
(never pure white), white cards floating slightly lighter, deep navy ink,
clinical blue accent, hairline warm borders, soft shadows, generous radii,
Heebo, RTL throughout. Light is the presentation default; dark and system-auto
are both fully tokenized.

### Notes

- Local demo state only. Nothing persists across reloads and no data leaves the page.
- Patient names, rooms and clinical content are illustrative sample data.
