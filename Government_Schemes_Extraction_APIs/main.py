from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# FastAPI instance
app = FastAPI()

# ✅ Pydantic model for input validation
class Scheme(BaseModel):
    scheme_name: str
    description: str
    ministry: str | None = None
    benefits: list[str] | None = None

# Root route
@app.get("/")
def read_root():
    return {"message": "🚀 CampusFounders Schemes API is running!"}

# ✅ Get all schemes
@app.get("/schemes")
def get_schemes():
    schemes = list(collection.find({}, {"_id": 0}))
    return {"schemes": schemes}

# ✅ Get one scheme by name
@app.get("/schemes/{scheme_name}")
def get_scheme(scheme_name: str):
    scheme = collection.find_one({"scheme_name": scheme_name}, {"_id": 0})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

# ✅ Add a new scheme - SIMPLE AND WORKING VERSION
@app.post("/schemes")
def add_scheme(scheme: Scheme):
    # Check if scheme already exists
    existing_scheme = collection.find_one({"scheme_name": scheme.scheme_name})
    if existing_scheme:
        raise HTTPException(status_code=400, detail="Scheme with this name already exists")
    
    # Convert to dict and insert
    scheme_data = {
        "scheme_name": scheme.scheme_name,
        "description": scheme.description,
        "ministry": scheme.ministry,
        "benefits": scheme.benefits
    }
    
    # Insert without returning the MongoDB result object
    collection.insert_one(scheme_data)
    
    # Return simple success response
    return {
        "message": "Scheme added successfully",
        "scheme_name": scheme.scheme_name
    }

# ✅ Update a scheme
@app.put("/schemes/{scheme_name}")
def update_scheme(scheme_name: str, scheme: Scheme):
    # Create update data manually to avoid any Pydantic issues
    update_data = {
        "scheme_name": scheme.scheme_name,
        "description": scheme.description,
        "ministry": scheme.ministry,
        "benefits": scheme.benefits
    }
    
    result = collection.update_one(
        {"scheme_name": scheme_name}, 
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"message": "Scheme updated successfully"}

# ✅ Delete a scheme
@app.delete("/schemes/{scheme_name}")
def delete_scheme(scheme_name: str):
    result = collection.delete_one({"scheme_name": scheme_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"message": "Scheme deleted successfully"}