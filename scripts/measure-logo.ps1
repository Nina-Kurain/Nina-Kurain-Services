Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::new('public/logo.png')

$minX = $src.Width; $maxX = 0; $minY = 730; $maxY = 0
for ($y = 80; $y -le 730; $y += 2) {
    for ($x = 0; $x -lt $src.Width; $x += 2) {
        if ($src.GetPixel($x, $y).A -gt 25) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Monogram bounds: X: $minX..$maxX (W=$($maxX - $minX)), Y: $minY..$maxY (H=$($maxY - $minY))"
