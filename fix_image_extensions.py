#!/usr/bin/env python3
"""
Script to fix image file extensions by converting uppercase extensions to lowercase.
"""

import os
import sys

def fix_extensions(directory):
    """
    Find all image files with uppercase extensions and rename them to lowercase.
    """
    if not os.path.exists(directory):
        print(f"Error: Directory {directory} does not exist.")
        return False
    
    count = 0
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            # Check if the file has an uppercase extension
            name, ext = os.path.splitext(filename)
            if ext.lower() in ['.png', '.jpg', '.jpeg', '.gif'] and ext != ext.lower():
                new_filename = name + ext.lower()
                new_filepath = os.path.join(directory, new_filename)
                
                # Rename the file
                try:
                    os.rename(filepath, new_filepath)
                    print(f"Renamed: {filename} -> {new_filename}")
                    count += 1
                except Exception as e:
                    print(f"Error renaming {filename}: {str(e)}")
    
    print(f"Fixed {count} file extensions.")
    return True

if __name__ == "__main__":
    # Use the img directory
    img_dir = "EnemPrepAppExpo/assets/img"
    
    print(f"Checking for uppercase extensions in {img_dir}...")
    if fix_extensions(img_dir):
        print("Extension fixing complete!")
    else:
        print("Failed to fix extensions.")
