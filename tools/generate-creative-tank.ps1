param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceId,

  [Parameter(Mandatory = $true)]
  [ValidateSet("fluid", "gas")]
  [string]$Kind
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$shortName = $ResourceId -replace '^example_', ''

if ($Kind -eq "fluid") {
  $baseResource = "example_coolant"
  $baseShortName = "coolant"
} else {
  $baseResource = "example_hydrogen"
  $baseShortName = "hydrogen"
}

$sourceBlock = Join-Path $projectRoot "BP/blocks/examples/creative_tanks/example_creative_${baseShortName}_tank.json"
$targetBlock = Join-Path $projectRoot "BP/blocks/examples/creative_tanks/example_creative_${shortName}_tank.json"
$block = Get-Content -Raw -LiteralPath $sourceBlock
$block = $block.Replace("example_creative_${baseShortName}_tank", "example_creative_${shortName}_tank")
$block = $block.Replace($baseResource, $ResourceId)
[IO.File]::WriteAllText($targetBlock, $block, $utf8WithoutBom)

$terrainAtlasPath = Join-Path $projectRoot "RP/textures/terrain_texture.json"
$terrainAtlas = Get-Content -Raw -LiteralPath $terrainAtlasPath | ConvertFrom-Json
$textureKey = "utilitycraft_${ResourceId}_${Kind}"
$texturePath = "textures/entity/${ResourceId}_${Kind}"
if ($terrainAtlas.texture_data.PSObject.Properties.Name -contains $textureKey) {
  $terrainAtlas.texture_data.PSObject.Properties.Remove($textureKey)
}
$terrainAtlas.texture_data | Add-Member -NotePropertyName $textureKey -NotePropertyValue ([ordered]@{ textures = $texturePath })
[IO.File]::WriteAllText($terrainAtlasPath, ($terrainAtlas | ConvertTo-Json -Depth 20), $utf8WithoutBom)

# UtilityCraft assigns its Creative Tanks a metal block sound in the RP.
# Register generated tanks there too instead of relying on Bedrock defaults.
$blocksJsonPath = Join-Path $projectRoot "RP/blocks.json"
$blocksJson = Get-Content -Raw -LiteralPath $blocksJsonPath | ConvertFrom-Json
$blockIdentifier = "utilitycraft:example_creative_${shortName}_tank"
if ($blocksJson.PSObject.Properties.Name -contains $blockIdentifier) {
  $blocksJson.PSObject.Properties.Remove($blockIdentifier)
}
$blocksJson | Add-Member -NotePropertyName $blockIdentifier -NotePropertyValue ([ordered]@{ sound = "metal" })
[IO.File]::WriteAllText($blocksJsonPath, ($blocksJson | ConvertTo-Json -Depth 20), $utf8WithoutBom)

Write-Output "Generated creative ${Kind} tank for utilitycraft:${ResourceId}."
