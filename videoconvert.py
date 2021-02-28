import moviepy.editor as moviepy
from pathlib import Path


def video_converter(filepath, extension):
    clip = moviepy.VideoFileClip(filepath)
    basename = Path(filepath).stem  # Gintama.mkv -> Gintama
    output = basename + '.' + extension

    clip.write_videofile(output)
