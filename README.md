# Excel-Based Part Validation Application

## Overview

This project is a step-based validation application built using React, TypeScript, Node.js, and Zustand for state management. The application demonstrates how Excel-based data can be used to drive a controlled validation workflow that includes selection steps and barcode scanning.

The system is designed to guide users through a strict sequence of steps, ensuring that data is loaded and validated in a predictable and repeatable manner.

---

## Features

- Upload and parse Excel (.xlsx / .xls) files at runtime
- Normalize spreadsheet rows into structured application data
- Step-based workflow enforced through application state
- PVI selection derived from uploaded Excel data
- Searchable ULOC selection
- Support for duplicate ULOC values
- Part validation using Bluetooth barcode scanners
- Real-time scan validation with visual feedback
- Per-part completion tracking
- Resettable workflow for repeated validation sessions

---

## Technology Stack

- React
- TypeScript
- Node.js
- Zustand
- Material UI
- XLSX

---

## Application Workflow

1. Upload an Excel file
2. Select a PVI from the extracted values
3. Select a ULOC
4. Validate associated parts by scanning part numbers

Navigation between steps is controlled entirely by application state to prevent skipping or invalid progression.

---

## Bluetooth Scanner Support

Bluetooth barcode scanners are treated as keyboard input devices. When a scan occurs, the scanner types the scanned value into the focused input field and submits it using the Enter key.

The application listens for this behavior and validates the scanned value against the expected part number. No scanner-specific SDK or hardware integration is required.

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
