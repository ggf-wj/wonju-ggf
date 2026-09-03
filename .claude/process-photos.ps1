param(
  [string]$SrcDir,
  [string]$OutDir
)

Add-Type -AssemblyName System.Drawing

$outSize = 480

# ascii source name => (ascii output name, vertical bias 0=top .. 1=bottom of the cropped square)
$jobs = @(
  @{ src = "src-gudongjin.jpg";     out = "board-gudongjin.jpg";     vbias = 0.22 },
  @{ src = "src-gwonhyeokdae.jpg";  out = "board-gwonhyeokdae.jpg";  vbias = 0.15 },
  @{ src = "src-gwonheuiju.jpg";    out = "board-gwonheuiju.jpg";    vbias = 0.15 },
  @{ src = "src-kimyongjae.jpg";    out = "board-kimyongjae.jpg";    vbias = 0.18 },
  @{ src = "src-kimjinju.jpg";      out = "board-kimjinju.jpg";      vbias = 0.12 },
  @{ src = "src-ohjesang.jpg";      out = "board-ohjesang.jpg";      vbias = 0.70 },
  @{ src = "src-wondoyeon.jpg";     out = "board-wondoyeon.jpg";     vbias = 0.85 },
  @{ src = "src-wonyongseon.jpg";   out = "board-wonyongseon.jpg";   vbias = 0.15 },
  @{ src = "src-leejaehyeong.jpg";  out = "board-leejaehyeong.jpg";  vbias = 0.20 }
)

foreach ($job in $jobs) {
  $srcPath = Join-Path $SrcDir $job.src
  $outPath = Join-Path $OutDir $job.out

  $img = [System.Drawing.Image]::FromFile($srcPath)
  $w = $img.Width
  $h = $img.Height
  $side = [Math]::Min($w, $h)

  $maxOffsetX = $w - $side
  $maxOffsetY = $h - $side
  $offsetX = [int]($maxOffsetX * 0.5)
  $offsetY = [int]($maxOffsetY * $job.vbias)

  $srcRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $side, $side)

  $bmp = New-Object System.Drawing.Bitmap($outSize, $outSize)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $destRect = New-Object System.Drawing.Rectangle(0, 0, $outSize, $outSize)
  $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]90)

  $g.Dispose()
  $img.Dispose()
  $bmp.Save($outPath, $jpegCodec, $encParams)
  $bmp.Dispose()

  Write-Output "$($job.out): $w x $h -> crop $side x $side @ ($offsetX,$offsetY) -> $outSize x $outSize"
}
