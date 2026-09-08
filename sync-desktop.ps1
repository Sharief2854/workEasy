$src = "C:\Users\gotlu\OneDrive\Desktop\WorkEasy.lnk"

if (Test-Path $src) {
    if (Test-Path "C:\Users\gotlu\Desktop") {
        Copy-Item $src -Destination "C:\Users\gotlu\Desktop\WorkEasy.lnk" -Force
        Write-Output "Copied to C:\Users\gotlu\Desktop\WorkEasy.lnk"
    }
    if (Test-Path "C:\Users\Public\Desktop") {
        Copy-Item $src -Destination "C:\Users\Public\Desktop\WorkEasy.lnk" -Force -ErrorAction SilentlyContinue
        Write-Output "Copied to C:\Users\Public\Desktop\WorkEasy.lnk"
    }
}
