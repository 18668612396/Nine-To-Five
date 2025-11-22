<#
.SYNOPSIS
    Generates an .anim file from a sequence of images in a directory.
.DESCRIPTION
    Scans the specified directory for image files (.png, .jpg, .jpeg), sorts them by name,
    retrieves their GUIDs (generating .meta files if missing), and creates an .anim JSON file.
.PARAMETER Directory
    The path to the directory containing the image sequence.
.PARAMETER Name
    (Optional) The name of the animation clip. Defaults to the directory name (Capitalized).
.PARAMETER FrameRate
    (Optional) The frame rate of the animation. Defaults to 10.
.PARAMETER Loop
    (Optional) Whether the animation should loop. Defaults to true.
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Directory,

    [string]$Name,
    [int]$FrameRate = 10,
    [bool]$Loop = $true
)

$validExtensions = @(".png", ".jpg", ".jpeg")

# Resolve absolute path
if (-not (Test-Path $Directory)) {
    Write-Error "Directory not found: $Directory"
    exit 1
}
$targetPath = Resolve-Path $Directory

# Determine Anim Name if not provided
if ([string]::IsNullOrWhiteSpace($Name)) {
    $dirName = Split-Path $targetPath -Leaf
    # Capitalize first letter
    if ($dirName.Length -gt 0) {
        $Name = $dirName.Substring(0,1).ToUpper() + $dirName.Substring(1)
    } else {
        $Name = "Animation"
    }
}

$animFileName = "$Name.anim"
$animFilePath = Join-Path $targetPath $animFileName

Write-Host "Generating Animation '$Name' in '$targetPath'..."

# Get Images
$images = Get-ChildItem -Path $targetPath -File | Where-Object { $validExtensions -contains $_.Extension.ToLower() } | Sort-Object Name

if ($images.Count -eq 0) {
    Write-Warning "No images found in directory '$targetPath'."
    exit
}

$frameGuids = @()

foreach ($img in $images) {
    $metaPath = $img.FullName + ".meta"
    $guid = $null

    # Try read existing meta
    if (Test-Path $metaPath) {
        try {
            $json = Get-Content $metaPath -Raw | ConvertFrom-Json
            $guid = $json.guid
        } catch {
            Write-Warning "Failed to read meta for $($img.Name)"
        }
    }

    # Generate if missing
    if (-not $guid) {
        $guid = [guid]::NewGuid().ToString("N")
        $metaContent = @{
            guid = $guid
            timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
        $metaContent | ConvertTo-Json | Set-Content $metaPath
        Write-Host "Generated meta for $($img.Name)"
    }

    $frameGuids += $guid
}

# Create Anim JSON
$animData = [ordered]@{
    AssetType = "AnimationClip"
    name = $Name
    frameRate = $FrameRate
    loop = $Loop
    frames = $frameGuids
}

$animData | ConvertTo-Json -Depth 5 | Set-Content $animFilePath
Write-Host "Successfully created $animFilePath"
Write-Host "Frames found: $($frameGuids.Count)"

# Reminder
Write-Host "----------------------------------------------------------------"
Write-Host "NOTE: Please run 'GenAssetMap.ps1' to register the new .anim file!" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------"
