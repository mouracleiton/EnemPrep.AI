#!/usr/bin/env python3
"""
Script to generate a custom splash screen for the ENEM Prep AI app.
This will create a splash screen with the app logo and text.
"""

import os
from g4f.client import Client
import requests

# Output file
OUTPUT_FILE = "EnemPrepAppExpo/assets/splash.png"

def generate_splash_screen():
    """Generate a custom splash screen."""
    print("Generating custom splash screen...")
    
    # Initialize the client
    client = Client()
    
    # Define the prompt for the splash screen
    prompt = """
    Create a professional splash screen for an educational app called 'ENEM Prep AI'. 
    The app helps students prepare for the Brazilian national high school exam (ENEM).
    Use blue as the primary color with white text.
    Include the text 'ENEM Prep AI' prominently.
    Add a graduation cap or book icon.
    The design should be clean, modern, and suitable for a splash screen.
    Make sure the image has high resolution (at least 2048x2048 pixels) and is centered.
    """
    
    try:
        response = client.images.generate(
            model="flux",
            prompt=prompt,
            response_format="url"
        )
        
        if response and response.data and len(response.data) > 0:
            image_url = response.data[0].url
            print(f"Generated image URL: {image_url}")
            
            # Download the image
            response = requests.get(image_url, stream=True)
            if response.status_code == 200:
                with open(OUTPUT_FILE, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                print(f"✅ Successfully created {OUTPUT_FILE}")
                return True
            else:
                print(f"❌ Failed to download image: {response.status_code}")
                return False
        else:
            print("❌ No image data returned")
            return False
    
    except Exception as e:
        print(f"❌ Error generating splash screen: {str(e)}")
        return False

if __name__ == "__main__":
    if generate_splash_screen():
        print("Splash screen generation complete!")
    else:
        print("Failed to generate splash screen.")
