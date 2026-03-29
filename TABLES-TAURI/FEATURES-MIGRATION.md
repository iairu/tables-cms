# Features Migration: TABLES-OLD → TABLES-TAURI

## Analysis Date: March 26, 2026

## Summary

This document identifies features present in the OLD Electron/Gatsby app that need to be migrated to the new Tauri/Svelte version.

---

## ✅ Features Already Implemented in TABLES-TAURI

### Core CMS Sections
- [x] SettingsSection - Basic settings management
- [x] PagesSection - Page management (basic)
- [x] PageGroupsSection - Page groups management
- [x] BlogSection - Blog articles management
- [x] CatsSection (Pedigree) - Stub implementation only
- [x] PersonalSection - Stub implementation only
- [x] RentalInventorySection - Rental inventory management
- [x] RentalAttendanceSection - Attendance tracking
- [x] RentalCustomersSection - Customer management
- [x] RentalEmployeesSection - Employee management
- [x] RentalReservationsSection - Reservation management
- [x] RentalCalendarSection - Calendar view (basic)
- [x] ExtensionsSection - Extension configuration
- [x] UploadsSection - File uploads
- [x] MoviesSection - Movie tracker

### Core Infrastructure
- [x] CMS Data Store (cmsData.js)
- [x] Loading Store
- [x] Project Manager Store
- [x] Basic routing system
- [x] Theme system
- [x] Collaboration state management

---

## ❌ Missing Features (Need Migration)

### 1. Component System (CRITICAL)
**Location:** `cms-site/src/components/cms/ComponentEditor.js`

**Missing Components:**
- ComponentEditor - Full page/component editing interface
- componentHelpers.js - Component type definitions and field configurations
- IconPickerModal - Icon selection modal
- SlugPicker - Page/blog slug picker
- UserAssetManager - Asset management interface
- AssetGrid - Asset grid display
- ButtonEditor - Button configuration editor
- DescendantsTree - Pedigree descendants visualization

**Impact:** Users cannot edit page components without these

### 2. Pedigree/Cats Section (HIGH PRIORITY)
**Location:** `cms-site/src/components/cms/sections/CatsSection.js` (1430 lines)

**Missing Features:**
- Full cat pedigree management UI
- Family tree visualization (FamilyTree.js)
- Descendants tree visualization (DescendantsTree.js)
- Breed selection dropdown (80+ FIFe breeds)
- EMS color code selection
- Genetic tests tracking
- Sire/Dam relationship management
- Pedigree certificate generation

**Impact:** Pedigree tracking completely non-functional

### 3. Personal Section Extensions (MEDIUM PRIORITY)
**Location:** Various pages in `cms-site/src/pages/cms/personal/`

**Missing Sections:**
- Biometric data management
- Medical records management
- Financial records management
- Legal documents management

**Impact:** Personal extension features unavailable

### 4. Advanced Settings Features (MEDIUM PRIORITY)
**Location:** `cms-site/src/components/cms/sections/SettingsSection.js`

**Missing Features:**
- ACL (Access Control List) management UI
- Advanced collaboration configuration
- Interface selection for server binding
- Connection profile management (favorites, recent connections)
- Language management UI
- Social media configuration
- GDPR consent management

### 5. Blog Section Enhancements (LOW PRIORITY)
**Location:** `cms-site/src/pages/cms/blog/edit.js`

**Missing Features:**
- Blog article edit page with component editor
- Rich text editing for blog content
- Blog article scheduling

### 6. Utility Components (MEDIUM PRIORITY)
**Location:** `cms-site/src/components/cms/`

**Missing Components:**
- FuzzySearchDropdown - Enhanced dropdown with fuzzy search
- FamilyTree - Pedigree family tree visualization
- DescendantsTree - Descendants visualization
- IconPickerModal - Icon selection
- SlugPicker - Internal link picker
- ButtonEditor - Button list editor
- AssetGrid - Asset grid component
- UserAssetManager - User-facing asset manager

### 7. Helper Functions (MEDIUM PRIORITY)
**Location:** `cms-site/src/components/cms/componentHelpers.js`

**Missing:**
- Component type definitions
- Default field configurations for each component type
- Rich text editor renderer
- Image upload renderer
- Button list renderer
- Icon picker renderer
- CSS blend modes configuration

### 8. API Endpoints (LOW PRIORITY - Tauri Commands)
**Location:** `cms-site/src/api/`

**Missing Tauri Commands:**
- build.js - Build trigger API
- delete-upload.js - Upload deletion
- import-uploads.js - Bulk upload import
- purge-uploads.js - Upload cleanup
- upload.js - File upload handler
- uploads.js - Uploads list

**Note:** Some may be partially implemented in src-tauri/src/

### 9. Context/Hooks System (LOW PRIORITY)
**Location:** `cms-site/src/context/` and `cms-site/src/hooks/`

**Missing:**
- LoadingContext (replaced by Svelte store)
- CMSContext (replaced by Svelte store)
- useCMSData hook (replaced by Svelte store)

**Note:** Svelte stores make these obsolete

### 10. Main Site Landing Page (LOW PRIORITY)
**Location:** `main-site/src/pages/index.js`

**Missing:**
- Public-facing landing page
- CMS access portal

---

## Component Migration Priority

### P0 - Critical (Blocks Core Functionality)
1. ComponentEditor.svelte
2. componentHelpers.js → lib/componentHelpers.js
3. AssetManagerModal.svelte (exists but may need enhancement)

### P1 - High Priority (Major Features)
1. CatsSection.svelte (full implementation)
2. FamilyTree.svelte
3. DescendantsTree.svelte
4. FuzzySearchDropdown.svelte
5. IconPickerModal.svelte
6. SlugPicker.svelte

### P2 - Medium Priority (Enhanced UX)
1. SettingsSection enhancements (ACL, languages, social media)
2. PersonalSection extensions (biometric, medical, financial, legal)
3. UserAssetManager.svelte
4. AssetGrid.svelte
5. ButtonEditor.svelte

### P3 - Low Priority (Nice to Have)
1. Blog edit page with component editor
2. Main site landing page
3. Advanced collaboration features

---

## Testing Requirements

### Unit Tests Needed
1. **Stores**
   - cmsData.js - All save/load functions
   - loading.js - Loading state management
   - projectManager.js - Project management

2. **Utilities**
   - helpers.js - Utility functions
   - navigation.js - Navigation utilities
   - componentHelpers.js - Component configurations

3. **Components**
   - All section components
   - All modal components
   - All form components

4. **Integration Tests**
   - Page creation and editing flow
   - Blog article management flow
   - Rental reservation flow
   - Pedigree tracking flow

### Test Framework Setup
- Install Vitest (Svelte-friendly)
- Configure @testing-library/svelte
- Setup test utilities and mocks
- Configure coverage reporting

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. Setup testing infrastructure
2. Write tests for existing features
3. Migrate componentHelpers.js
4. Migrate ComponentEditor.svelte
5. Migrate utility components (IconPickerModal, SlugPicker, FuzzySearchDropdown)

### Phase 2: Core Features (Week 3-4)
1. Full CatsSection implementation with pedigree tracking
2. FamilyTree and DescendantsTree components
3. Enhanced SettingsSection (ACL, languages)
4. PersonalSection extensions

### Phase 3: Polish (Week 5-6)
1. Blog edit page
2. Asset management enhancements
3. Main site landing page
4. Comprehensive test coverage
5. Documentation

---

## File Structure Recommendations

```
TABLES-TAURI/
├── src/
│   ├── components/
│   │   ├── cms/
│   │   │   ├── sections/        # All section components
│   │   │   ├── editors/         # ComponentEditor, ButtonEditor
│   │   │   ├── modals/          # IconPickerModal, AssetManagerModal
│   │   │   ├── pickers/         # SlugPicker, FuzzySearchDropdown
│   │   │   ├── trees/           # FamilyTree, DescendantsTree
│   │   │   ├── grids/           # AssetGrid
│   │   │   └── wrappers/        # LockedInputWrapper
│   │   └── ...
│   ├── lib/
│   │   ├── componentHelpers.js  # Component type definitions
│   │   └── ...
│   ├── stores/
│   │   └── ...
│   ├── utils/
│   │   └── ...
│   └── tests/                   # Test files
│       ├── components/
│       ├── stores/
│       ├── utils/
│       └── integration/
```

---

## Notes

1. **Svelte vs React:** The OLD app uses React, migration requires converting to Svelte
2. **State Management:** React context/hooks → Svelte stores
3. **Styling:** CSS files → Svelte `<style>` blocks
4. **TypeScript:** Consider migrating to TypeScript for better type safety
5. **Tauri Integration:** Leverage Tauri APIs for file system, dialogs, etc.

---

## Next Steps

1. ✅ Review and approve this migration plan
2. ⏳ Setup testing infrastructure (Vitest + Testing Library)
3. ⏳ Create component migration templates
4. ⏳ Begin P0 migrations
5. ⏳ Write tests alongside migrations
