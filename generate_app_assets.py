#!/usr/bin/env python3
"""
Script to generate app assets (icons, splash screens, logos) for EnemPrepAI
using the g4f.client library.
"""

import os
import requests
from g4f.client import Client

# Create output directory if it doesn't exist
OUTPUT_DIR = "EnemPrepAppExpo/assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize the client
client = Client()

# Define the assets to generate
assets = [
    {
        "name": "icon.png",
        "prompt": "A minimalist app icon for an educational app focused on ENEM exam preparation. Use blue and white colors, with a simple book or graduation cap symbol. Clean, modern design suitable for an app icon.",
        "size": 1024  # Square icon
    },
    {
        "name": "adaptive-icon.png",
        "prompt": "A minimalist adaptive icon for an educational app focused on ENEM exam preparation. Use blue and white colors, with a simple book or graduation cap symbol. Clean, modern design with ample padding for adaptive icon format.",
        "size": 1024  # Square adaptive icon
    },
    {
        "name": "splash.png",
        "prompt": "A splash screen for an educational app called 'ENEM Prep AI'. Use blue and white colors with a simple, elegant design. Include the text 'ENEM Prep AI' prominently. Clean, modern design.",
        "size": 2048  # Larger for splash screen
    },
    {
        "name": "favicon.png",
        "prompt": "A minimalist favicon for an educational app focused on ENEM exam preparation. Use blue and white colors, with a simple book or graduation cap symbol. Very simple design that works at small sizes.",
        "size": 64  # Small for favicon
    },
    {
        "name": "logo.png",
        "prompt": "A logo for an educational app called 'ENEM Prep AI'. Use blue and white colors with a simple, elegant design. Include the text 'ENEM Prep AI'. Clean, modern design suitable for app header.",
        "size": 512  # Medium for logo
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

print("Asset generation complete!")
