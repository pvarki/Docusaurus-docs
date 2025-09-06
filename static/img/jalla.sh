for f in *.{PNG,JPG,JPEG}; do
  [ -e "$f" ] || continue          # skip if no match
  mv -v "$f" "${f,,}"              # ${var,,} → lowercase
done