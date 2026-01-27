# Excel-Based Part Validation Application

## Overview

This application is a step-based validation tool built using React, TypeScript, Node.js, and Zustand for state management. The purpose of the application is to support a manufacturing-style validation workflow where a user uploads an Excel file, selects a PVI, selects a ULOC, and then validates parts by scanning them using a Bluetooth barcode scanner.

The application is designed for controlled environments such as shop floors, kiosks, or tablets where users must follow a strict sequence of steps and accuracy is critical.

---

## Features

- Upload and parse Excel (.xlsx / .xls) files
- Automatically extract and normalize Excel row data
- Step-based workflow enforced through application state
- PVI selection from Excel-derived values
- Searchable ULOC selection
- Supports duplicate ULOC values
- Validation process using Bluetooth barcode scanners
- Real-time scan validation and visual feedback
- Per-part completion tracking
- Resettable workflow for repeated use

---

## Technology Stack

- React
- TypeScript
- Node.js
- Zustand (global state management)
- Material UI (UI components)
- XLSX (Excel file parsing)

---

## Application Workflow

1. Upload an Excel file
2. Select a PVI from the extracted values
3. Select a ULOC (searchable)
4. Validate parts by scanning part numbers

Navigation between steps is controlled by application state rather than URLs to prevent skipping steps.

---

## Bluetooth Scanner Support

Bluetooth scanners are treated as keyboard input devices. When a scan occurs, the scanner types the scanned value into the focused input field and submits it using the Enter key. The application listens for this behavior and validates the scanned value against the expected part number.

No scanner SDK or additional hardware integration is required.

---

## Project Structure

src/
App.tsx
index.tsx
store/
validationStore.ts
utils/
excelReader.ts
pages/
validation/
Step1DataSource.tsx
Step2PVI.tsx
Step3ULOC.tsx
Step4Validation.tsx


---

# Technical Design Document
## Excel-Based Part Validation Application

---

## 1. Purpose

The purpose of this application is to provide a reliable, repeatable validation workflow for manufacturing or inspection environments. The system ensures that users validate the correct parts for a given PVI and ULOC using data sourced from an Excel file.

---

## 2. Design Goals

- Enforce a strict step-based workflow
- Prevent invalid navigation or skipped steps
- Support duplicate ULOC values
- Integrate seamlessly with Bluetooth barcode scanners
- Provide clear validation feedback
- Maintain clean separation of concerns
- Ensure scalability and maintainability

---

## 3. High-Level Architecture

The application is a client-side React application that relies on:

- Excel files as the data source
- Zustand for centralized state management
- Step-driven UI rendering
- Stateless UI components that consume global state

There is no dependency on URL routing. Navigation is entirely controlled by application state.

---

## 4. Data Flow

1. User uploads an Excel file
2. Excel file is parsed into structured row objects
3. Parsed data is stored globally
4. User selects a PVI
5. User selects a ULOC
6. All rows matching the selected ULOC are collected
7. Each matching row is validated independently via scanning

---

## 5. Excel Parsing Strategy

Excel files are parsed using the XLSX library. Raw sheet data is converted into typed objects (`PartRow`) where each object represents one row in the Excel file.

Specific Excel columns are mapped to explicit fields such as:
- PVI
- ULOC
- Item
- Part Number
- Part Description
- Supplier Name
- DUNS

Parsing occurs once at upload time to avoid repeated processing.

---

## 6. State Management

Zustand is used to manage global state. The store includes:

- Navigation state (current step)
- User selections (PVI, ULOC)
- Available dropdown lists
- Parsed Excel rows
- Selected parts for validation

Actions enforce proper workflow behavior by resetting dependent state when upstream selections change.

---

## 7. Step-Based UI Rendering

The main application component renders one step component at a time based on the current step value stored in Zustand. This approach ensures:

- Users cannot skip steps
- The workflow remains predictable
- The application behaves consistently in kiosk environments

---

## 8. ULOC Handling

ULOC values are not assumed to be unique. When a ULOC is selected, all Excel rows with that exact ULOC value are collected using a filter operation. This ensures that all relevant parts are validated.

---

## 9. Validation and Scanning Logic

Each part associated with the selected ULOC is displayed in its own validation section. Each section contains an input field designed to work with Bluetooth barcode scanners.

When a scan occurs:
- The scanned value is captured
- The Enter key triggers validation
- The scanned value is compared to the expected part number
- A successful match marks the part as completed
- A mismatch displays an error and requires rescan

Completed parts are locked to prevent duplicate validation.

---

## 10. Error Handling and Feedback

- Invalid scans display error messages
- Completed parts are visually highlighted
- Missing or invalid data prevents navigation
- Users are guided through the workflow with disabled actions when necessary

---

## 11. Reset and Reusability

The application supports a full reset of state to allow repeated validation sessions. This is essential for real-world manufacturing usage where the application may be reused continuously.

---

## 12. Scalability and Extensibility

The architecture supports future enhancements such as:
- Operator authentication
- Scan timestamps
- Audit logging
- Backend synchronization
- Validation reporting
- Rule-based validation logic

---

## 13. Summary

This design provides a robust, maintainable, and production-ready validation workflow. It mirrors real-world manufacturing validation systems and prioritizes accuracy, usability, and data integrity.

---
