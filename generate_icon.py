import sys
from PIL import Image

def add_white_bg(input_path, output_path):
    # Open the image with an alpha channel
    img = Image.open(input_path).convert("RGBA")
    
    # Create a white background image of the same size
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    
    # Paste the transparent image onto the white background
    bg.paste(img, (0, 0), img)
    
    # Convert to RGB to drop alpha channel (iOS requirement)
    final_img = bg.convert("RGB")
    final_img.save(output_path, "PNG")

if __name__ == "__main__":
    add_white_bg("public/icon.png", "assets/icon.png")
    add_white_bg("public/icon.png", "assets/splash.png")
    print("Icons processed successfully for iOS.")
