$assetsPath = "e:\GitHub\Nine-To-Five\Project\NineToFive\Assets"
$mapPath = "e:\GitHub\Nine-To-Five\Project\NineToFive\ProjectSettings\AssetMap.json"
$libraryMapPath = "e:\GitHub\Nine-To-Five\Project\NineToFive\Library\AssetMap.json"

$map = @{}

# Get all files excluding .meta
$files = Get-ChildItem -Path $assetsPath -Recurse -File | Where-Object { $_.Extension -ne ".meta" }

foreach ($file in $files) {
    $metaPath = $file.FullName + ".meta"
    $guid = $null

    if (Test-Path $metaPath) {
        try {
            $json = Get-Content $metaPath -Raw | ConvertFrom-Json
            $guid = $json.guid
        } catch {
            Write-Host "Error reading meta for $($file.Name)"
        }
    }

    if (-not $guid) {
        $guid = [guid]::NewGuid().ToString("N")
        $metaContent = @{
            guid = $guid
            timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
        $metaContent | ConvertTo-Json | Set-Content $metaPath
        Write-Host "Generated meta for $($file.Name): $guid"
    }

    # Calculate relative path
    # FullName: e:\GitHub\Nine-To-Five\Project\NineToFive\Assets\Folder\File.ext
    # AssetsPath: e:\GitHub\Nine-To-Five\Project\NineToFive\Assets
    # Relative: Folder\File.ext
    
    $relPath = $file.FullName.Substring($assetsPath.Length + 1)
    $relPath = "Assets/" + ($relPath -replace '\\', '/')
    
    $map[$guid] = $relPath
}

# Add Engine mappings manually if needed (preserving old ones if possible, but we don't have them easily)
# For now, we only update Assets. 
# If we want to keep existing keys that are not in Assets, we should read the old map first.

if (Test-Path $mapPath) {
    $oldMap = Get-Content $mapPath -Raw | ConvertFrom-Json
    # Convert PSCustomObject to Hashtable to merge
    # But PowerShell JSON object is a PSCustomObject.
    # We can just iterate properties.
    
    $oldMap.PSObject.Properties | ForEach-Object {
        if (-not $map.ContainsKey($_.Name)) {
            # Keep old entry if it's not in Assets (e.g. Packages)
            if ($_.Value -notmatch "^Assets/") {
                $map[$_.Name] = $_.Value
            }
        }
    }
}

$map | ConvertTo-Json -Depth 10 | Set-Content $mapPath
Copy-Item $mapPath $libraryMapPath -Force

Write-Host "AssetMap updated with $($map.Count) entries."
