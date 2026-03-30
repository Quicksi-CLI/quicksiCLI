$repo = "Quicksi-CLI/quicksiCLI"
$url = "https://github.com/$repo/releases/latest/download/quicksi-windows.zip"

$temp = "$env:TEMP\quicksi.zip"
$output = "$env:USERPROFILE\quicksi.exe"

Write-Host "Downloading Quicksi..."

Invoke-WebRequest -Uri $url -OutFile $temp

Write-Host "Extracting..."

Expand-Archive -Path $temp -DestinationPath $env:TEMP -Force

Move-Item "$env:TEMP\quicksi.exe" $output -Force

Write-Host "Installed at $output"
Write-Host "Add to PATH if needed"
