# Packs scripts/tmp/fav-{16,32,48}.png into app/favicon.ico. Usage: python3 scripts/make-ico.py
from PIL import Image
imgs = [Image.open(f"scripts/tmp/fav-{n}.png").convert("RGBA") for n in (16, 32, 48)]
imgs[2].save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=imgs[:2])
print("app/favicon.ico")
