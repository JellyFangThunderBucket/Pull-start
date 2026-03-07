Import-Module ActiveDirectory

$devices     = Get-ADComputer -Filter * | Select-Object -ExpandProperty Name
$classes     = Get-CimClass | Select-Object -ExpandProperty CimClassName
$totalClasses = $classes.Count
$currentClassIndex = 0

foreach ($class in $classes) {
    $currentClassIndex++
    Write-Host "Processing WMI class $class ($currentClassIndex of $totalClasses)" -ForegroundColor Cyan

    $csvPath = "C:\Temp\WMI\WMI_Results_$($class).csv"

    # Ensure the output directory exists before writing
    $csvDir = Split-Path -Parent $csvPath
    if (-not (Test-Path $csvDir)) {
        New-Item -ItemType Directory -Path $csvDir -Force | Out-Null
    }

    # Remove any existing file so we start fresh for each run
    if (Test-Path $csvPath) {
        Remove-Item $csvPath -Force
    }

    $totalDevices        = $devices.Count
    $currentDeviceIndex  = 0

    foreach ($device in $devices) {
        $currentDeviceIndex++
        Write-Host "Querying $device ($currentDeviceIndex of $totalDevices) for class $class" -ForegroundColor Yellow

        try {
            $objects = Get-CimInstance -ClassName $class -ComputerName $device -ErrorAction Stop

            foreach ($instance in $objects) {
                # Derive property names from the individual instance
                $properties = $instance | Get-Member -MemberType Properties | Select-Object -ExpandProperty Name

                $result = [PSCustomObject]@{ ComputerName = $device }
                foreach ($property in $properties) {
                    $result | Add-Member -MemberType NoteProperty -Name $property -Value $instance.$property -Force
                }

                $result | Export-Csv -Path $csvPath -NoTypeInformation -Append
            }
        } catch {
            Write-Host "Failed to query WMI class $class on $device : $_" -ForegroundColor Red
        }
    }

    Write-Host "WMI query results for class $class have been exported to $csvPath" -ForegroundColor Green
}
