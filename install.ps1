# install.ps1
$repo = "Quicksi-CLI/quicksi"
$url = "https://github.com/$repo/releases/latest/download/quicksi-win.exe"

$output = "$env:USERPROFILE\quicksi.exe"

Write-Host "Downloading Quicksi..."

Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "Installed at $output"
Write-Host "Add to PATH manually if needed"
