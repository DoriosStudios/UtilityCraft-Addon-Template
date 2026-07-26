param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceId,

  [Parameter(Mandatory = $true)]
  [string]$SourceTextureDirectory,

  [Parameter(Mandatory = $true)]
  [string]$SourcePrefix,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9A-Fa-f]{6}$')]
  [string]$Tint,

  [string]$Namespace = "utilitycraft"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$itemDirectory = Join-Path $projectRoot "BP/items/ui/resource_bars/$ResourceId"
$textureDirectory = Join-Path $projectRoot "RP/textures/ui/${ResourceId}_bar"
$atlasPath = Join-Path $projectRoot "RP/textures/item_texture.json"
$sourceDirectory = (Resolve-Path -LiteralPath $SourceTextureDirectory).Path

New-Item -ItemType Directory -Force -Path $itemDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $textureDirectory | Out-Null

Add-Type -AssemblyName System.Drawing
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$targetR = [Convert]::ToInt32($Tint.Substring(0, 2), 16)
$targetG = [Convert]::ToInt32($Tint.Substring(2, 2), 16)
$targetB = [Convert]::ToInt32($Tint.Substring(4, 2), 16)

$atlas = Get-Content -Raw -LiteralPath $atlasPath | ConvertFrom-Json

for ($index = 0; $index -le 48; $index++) {
  $frame = $index.ToString("00")
  $identifier = "${Namespace}:${ResourceId}_${frame}"
  $textureKey = $identifier
  $texturePath = "textures/ui/${ResourceId}_bar/${ResourceId}_${frame}"
  $sourcePath = Join-Path $sourceDirectory "${SourcePrefix}_${frame}.png"
  $targetPath = Join-Path $textureDirectory "${ResourceId}_${frame}.png"

  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Missing source frame: $sourcePath"
  }

  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $target = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      for ($y = 0; $y -lt $source.Height; $y++) {
        for ($x = 0; $x -lt $source.Width; $x++) {
          $pixel = $source.GetPixel($x, $y)
          if ($pixel.A -eq 0) {
            $target.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            continue
          }

          # Preserve the source frame's shading and bubbles while replacing
          # only its hue. The saline-coolant source centers near luma 205.
          $luma = 0.2126 * $pixel.R + 0.7152 * $pixel.G + 0.0722 * $pixel.B
          $brightness = [Math]::Max(0.7, [Math]::Min(1.25, $luma / 205.0))
          $red = [Math]::Min(255, [Math]::Round($targetR * $brightness))
          $green = [Math]::Min(255, [Math]::Round($targetG * $brightness))
          $blue = [Math]::Min(255, [Math]::Round($targetB * $brightness))
          $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $red, $green, $blue))
        }
      }
      $target.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $target.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }

  $item = [ordered]@{
    format_version = "1.20.80"
    "minecraft:item" = [ordered]@{
      description = [ordered]@{
        identifier = $identifier
        menu_category = [ordered]@{ category = "none" }
      }
      components = [ordered]@{
        "minecraft:icon" = $textureKey
        "minecraft:tags" = [ordered]@{ tags = @("utilitycraft:ui_element") }
      }
    }
  }
  $itemPath = Join-Path $itemDirectory "${Namespace}_${ResourceId}_${frame}.json"
  [IO.File]::WriteAllText($itemPath, ($item | ConvertTo-Json -Depth 10), $utf8WithoutBom)

  if ($atlas.texture_data.PSObject.Properties.Name -contains $textureKey) {
    $atlas.texture_data.PSObject.Properties.Remove($textureKey)
  }
  $atlas.texture_data | Add-Member -NotePropertyName $textureKey -NotePropertyValue ([ordered]@{ textures = $texturePath })
}

[IO.File]::WriteAllText($atlasPath, ($atlas | ConvertTo-Json -Depth 10), $utf8WithoutBom)
Write-Output "Generated 49 display frames for ${Namespace}:${ResourceId}."
