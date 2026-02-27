# Phase 07 Research: Profile Simplification + Modal Editing + Max 5 Photos

**Date:** 2026-02-28  
**Phase:** 07  
**Scope:** Profile page UX simplification, modal editing flows, strict 5-photo maximum

## Objective

Research how to implement Phase 07 with minimal risk and high consistency with existing code patterns.

## Current Implementation Snapshot

## Profile page

- `src/app/(user)/profile/page.tsx` is server-rendered and currently shows:
  - status summary/completion section
  - inline editable biodata (`BiodataForm`)
  - inline photo management (`ProfilePhotoSection`)
- Existing completion logic uses `photoUrls.length >= 5`.

## Biodata editing

- `src/components/BiodataForm.tsx` is a client component with internal `fetch('/api/biodata')` load and `POST /api/biodata` save.
- Designed as a full-page section; can be reused in modal with optional callbacks.

## Photo editing

- `src/app/(user)/profile/ProfilePhotoSection.tsx` loads photos from `/api/biodata` and saves via `PUT /api/upload`.
- Embeds `src/components/PhotoUpload.tsx` (drag-drop sortable uploader).

## Photo constraints and status logic

- `src/components/PhotoUpload.tsx` still communicates 5-9 photo rules and has max slots at 9.
- `src/app/api/upload/route.ts` enforces `photoUrls.length < 5 || > 9` as invalid.
- `src/app/api/biodata/route.ts` status transitions depend on `photoUrls.length >= 5`.
- This means Phase 07 must align client+API+status checks to strict max 5.

## Modal patterns already used in codebase

- NextUI modal components are already in use (e.g., discovery page uses `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`, `useDisclosure`).
- Several admin/supervisor areas also use conditional modal patterns.
- Reusing NextUI modal primitives is low-risk and consistent.

## Key Decisions for Planning

1. Keep `profile/page.tsx` as server data loader and move interaction logic to a new client overview component.
2. Build thumbnail-to-main-photo interaction client-side with local selected index state.
3. Keep first view read-only for biodata (text blocks only), with two explicit actions:
   - `Edit Picture`
   - `Edit Biodata`
4. Reuse existing `BiodataForm` and `ProfilePhotoSection` in modals by adding optional callbacks (e.g., `onSaved`, `onClose`) rather than rewriting forms.
5. Normalize photo constraints to strict 5 in all affected layers:
   - client upload slot handling and helper copy
   - `/api/upload` validation
   - biodata/profile status checks tied to photo completeness

## Recommended Plan Shape

- **Plan 07-01:** Build simplified read-only profile shell with large image + clickable thumbnails.
- **Plan 07-02:** Implement modal edit flows for biodata/photos and refresh overview after save.
- **Plan 07-03:** Enforce strict max-5 photo rule and perform human verification.

Sequential execution is preferred due shared file ownership (`profile/page.tsx`, profile-related components, and shared photo/status rules).

## Risks and Mitigations

- **Risk:** Breaking existing non-modal form behavior.  
  **Mitigation:** Add optional modal callbacks; keep default behavior intact when callbacks absent.

- **Risk:** Inconsistent photo rules across UI and API.  
  **Mitigation:** Centralize all touched checks/messages in Plan 07-03 verification.

- **Risk:** UX regression from overly complex modal behavior.  
  **Mitigation:** Keep modal interactions minimal: open, edit, save, close, refresh.

## Verification Focus

- Thumbnail click swaps the large photo immediately.
- Biodata first view has no editable controls.
- Both edit buttons open correct modal content.
- Save from modal updates read-only view.
- 6th photo is blocked and API rejects >5.
