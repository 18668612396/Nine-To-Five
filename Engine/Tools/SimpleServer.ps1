$port = 8000
$root = Get-Location
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server started at http://localhost:$port/"
Write-Host "Root: $root"
Write-Host "Press Ctrl+C to stop."

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath.TrimStart('/')
    if ($path -eq "") { $path = "index.html" }
    
    $localPath = Join-Path $root $path
    
    if (Test-Path $localPath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($localPath)
        $response.ContentLength64 = $content.Length
        
        $extension = [System.IO.Path]::GetExtension($localPath)
        switch ($extension) {
            ".html" { $response.ContentType = "text/html" }
            ".js"   { $response.ContentType = "application/javascript" }
            ".css"  { $response.ContentType = "text/css" }
            ".json" { $response.ContentType = "application/json" }
            ".png"  { $response.ContentType = "image/png" }
            ".jpg"  { $response.ContentType = "image/jpeg" }
            ".wav"  { $response.ContentType = "audio/wav" }
            ".mp3"  { $response.ContentType = "audio/mpeg" }
            ".mat"  { $response.ContentType = "application/json" }
            ".anim" { $response.ContentType = "application/json" }
            ".prefab" { $response.ContentType = "application/json" }
            ".scene" { $response.ContentType = "application/json" }
            ".controller" { $response.ContentType = "application/json" }
        }
        
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}