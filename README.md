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

