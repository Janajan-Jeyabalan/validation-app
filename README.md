📊 Data Validation App

A full-stack data validation application built with React, TypeScript, and Node.js.
The app allows users to upload an Excel file, enter a PVI number and ULOC number, and retrieve validated data from the file.

🚀 Overview

This application streamlines Excel-based data validation by guiding users through a simple, step-by-step workflow:

Upload an Excel file

Enter a PVI number

Enter a ULOC number

Instantly receive matching and validated data

The goal is to provide a fast, reliable, and user-friendly validation experience.

🧭 User Flow

Upload Excel File
User uploads a .xlsx or .xls file containing structured data.

Enter PVI Number
Used to identify the primary validation record.

Enter ULOC Number
Further filters the dataset for precise results.

View Results
The application displays validated data that matches the provided inputs.

🖥️ Tech Stack
Frontend

React

TypeScript

Axios

CSS / Styled Components

Backend

Node.js

Express

TypeScript

Excel parsing with xlsx

REST API architecture

✨ Features

Excel file upload and parsing

Step-by-step validation flow

PVI and ULOC input validation

Strong typing with TypeScript

Clean and scalable backend structure

User-friendly error handling

📁 Project Structure
root
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.tsx
│   └── package.json
│
├── server
│   ├── src
│   │   ├── controllers
│   │   ├── routes
│   │   ├── services
│   │   └── index.ts
│   └── package.json
│
└── README.md

🛠️ Installation & Setup
1. Clone the Repository
git clone https://github.com/your-username/validation-app.git
cd validation-app

2. Install Dependencies
Frontend
cd client
npm install

Backend
cd server
npm install

3. Run the Application
Start Backend
cd server
npm run dev

Start Frontend
cd client
npm start

🌐 Application URLs

Frontend: http://localhost:3000

Backend: http://localhost:5000

📄 Excel File Requirements

Supported formats: .xlsx, .xls

Must include columns for:

PVI Number

ULOC Number

Data should be in a structured tabular format

🧪 Validation Logic

Verifies required columns exist in the Excel file

Matches user-entered PVI and ULOC values

Returns only validated records

Handles missing or invalid data gracefully

🔒 Error Handling

The application handles:

Invalid file formats

Missing required columns

No matching PVI or ULOC records

Server or parsing errors

Clear, user-friendly messages are shown for each case.

📈 Future Enhancements

Authentication and authorization

Export validated data as Excel or CSV

Advanced filtering and search

Drag-and-drop file upload

Configurable validation rules

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a new feature branch

Commit your changes

Open a pull request

📜 License

This project is licensed under the MIT License.
