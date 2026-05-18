from PIL import Image, ImageChops
from pathlib import Path

icons_dir = Path("public/icons")
output_dir = Path("public/icons/cropped")
output_dir.mkdir(parents=True, exist_ok=True)

files = ["home.png","collection.png","add.png","social.png","profile.png"]

def crop_image(path, output_path):
    image = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", image.size, (255,255,255,0))
    diff = ImageChops.difference(image, bg)
    bbox = diff.getbbox()
    cropped = image.crop(bbox) if bbox else image
    padding = 24
    final = Image.new("RGBA",(cropped.width + padding * 2,cropped.height + padding * 2),(255,255,255,0))
    final.paste(cropped,(padding,padding),cropped)
    final.save(output_path)

for file in files:
    input_path = icons_dir / file
    output_path = output_dir / file
    if input_path.exists():
        crop_image(input_path, output_path)
        print(f"OK : {file}")
    else:
        print(f"Manquant : {file}")
