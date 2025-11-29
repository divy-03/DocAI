# DocAI - AI-Powered Document Authoring Platform

DocAI is a modern, full-stack web application designed to streamline the document creation process using the power of generative AI. It provides a collaborative environment for users to generate, refine, and export documents in various formats.

## Features

- **AI-Powered Content Generation:** Leverage Google's Generative AI to create initial document drafts and generate content for specific sections.
- **Project-Based Organization:** Structure your work into projects, each with its own set of documents and settings.
- **Rich Text Editor:** A fully-featured editor to modify and format your document sections.
- **Iterative Refinement:** Refine and improve generated content with AI-powered suggestions and tools.
- **User Authentication:** Secure user registration and login system.
- **Export Document:** Export your final documents and download as .docx

## Tech Stack

### Frontend

- **Framework:** React.js (with Vite)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router
- **API Communication:** Axios

### Backend

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **AI:** Google Generative AI
- **Authentication:** JWT with passlib
- **ORM:** SQLAlchemy

## Getting Started

### Prerequisites

- Python 3.8+ and Pip
- Node.js and npm
- A running PostgreSQL instance

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/divy-03/DocAI
    cd DocAI
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory and add the necessary variables (e.g., database URL, Gemini API key, JWT secret). See `config.py` for required variables.

    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    SECRET_KEY="YOUR_SECRET_KEY"
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    CLIENT_URL="http://localhost:5173"
    ```


6.  **Run the application:**
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    # From the root directory
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Usage

1.  Register for a new account or log in.
2.  From the dashboard, create a new project.
3.  Inside the project view, you can start generating document sections using the AI tools.
4.  Use the refinement panel to improve and edit the generated content.
5.  Once your document is complete, use the export feature to download it in your desired format.
