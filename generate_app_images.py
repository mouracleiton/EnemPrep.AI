#!/usr/bin/env python3
"""
Script to generate additional images for EnemPrepAI app's images directory
using the g4f.client library.
"""

import os
import requests
from g4f.client import Client

# Create output directory if it doesn't exist
OUTPUT_DIR = "EnemPrepAppExpo/assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize the client
client = Client()

# Define the assets to generate
assets = [
    {
        "name": "enem-logo.png",
        "prompt": "A simple, clean logo for ENEM (Exame Nacional do Ensino Médio), the Brazilian national high school exam. Use official colors (blue and yellow) in a minimalist style.",
        "size": 512
    },
    {
        "name": "enem-logo@2x.png",
        "prompt": "A simple, clean logo for ENEM (Exame Nacional do Ensino Médio), the Brazilian national high school exam. Use official colors (blue and yellow) in a minimalist style. High resolution version.",
        "size": 1024
    },
    {
        "name": "enem-logo@3x.png",
        "prompt": "A simple, clean logo for ENEM (Exame Nacional do Ensino Médio), the Brazilian national high school exam. Use official colors (blue and yellow) in a minimalist style. Very high resolution version.",
        "size": 1536
    },
    {
        "name": "study-icon.png",
        "prompt": "A minimalist icon representing studying or learning. Simple, flat design with blue color scheme. Suitable for an educational app.",
        "size": 256
    },
    {
        "name": "question-icon.png",
        "prompt": "A minimalist icon representing a question or quiz. Simple, flat design with blue color scheme. Suitable for an educational app.",
        "size": 256
    },
    {
        "name": "lesson-icon.png",
        "prompt": "A minimalist icon representing a lesson or teaching. Simple, flat design with blue color scheme. Suitable for an educational app.",
        "size": 256
    },
    {
        "name": "background.png",
        "prompt": "A subtle, light blue gradient background suitable for an educational app. Very minimal, not distracting, good for text overlay.",
        "size": 1024
    },
    {
        "name": "header-background.png",
        "prompt": "A blue gradient header background for an educational app. Horizontal format, subtle pattern, suitable for app header.",
        "size": [1024, 256]  # Width, height
    },
    {
        "name": "achievement-badge.png",
        "prompt": "A achievement or completion badge icon with a star or trophy design. Blue and gold colors, suitable for an educational app.",
        "size": 512
    },
    {
        "name": "app-logo-text.png",
        "prompt": "The text 'ENEM Prep AI' in a modern, clean font. Blue color, transparent background, suitable for app header.",
        "size": 512
    }
]

def download_image(url, filename):
    """Download an image from a URL and save it to a file."""
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"Successfully downloaded {filename}")
        return True
    else:
        print(f"Failed to download {filename}: {response.status_code}")
        return False

# Generate each asset
for asset in assets:
    print(f"Generating {asset['name']}...")
    
    try:
        response = client.images.generate(
            model="flux",  # Using the flux model as specified
            prompt=asset['prompt'],
            response_format="url"
        )
        
        if response and response.data and len(response.data) > 0:
            image_url = response.data[0].url
            print(f"Generated image URL for {asset['name']}: {image_url}")
            
            # Download the image
            output_path = os.path.join(OUTPUT_DIR, asset['name'])
            if download_image(image_url, output_path):
                print(f"✅ Successfully created {asset['name']}")
            else:
                print(f"❌ Failed to download {asset['name']}")
        else:
            print(f"❌ No image data returned for {asset['name']}")
    
    except Exception as e:
        print(f"❌ Error generating {asset['name']}: {str(e)}")

print("Image generation complete!")
