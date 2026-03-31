$repo = "Quicksi-CLI/quicksiCLI"
$url = "https://github.com/$repo/releases/latest/download/quicksi-win.exe"

$output = "$env:USERPROFILE\quicksi.exe"

Write-Host "Downloading Quicksi..."

Invoke-RestMethod -Uri $url -OutFile $output

Write-Host "Installed at $output"
Write-Host ""

# Optional: Add to PATH (user-level)
$path = [Environment]::GetEnvironmentVariable("Path", "User")

if ($path -notlike "*$env:USERPROFILE*") {
    Write-Host "Adding Quicksi to PATH..."
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$path;$env:USERPROFILE",
        "User"
    )
    Write-Host "PATH updated. Restart your terminal to use 'quicksi'."
} else {
    Write-Host "Quicksi is already in PATH."
}

Write-Host ""
Write-Host "You can now run: quicksi"
