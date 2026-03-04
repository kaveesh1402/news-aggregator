@echo off
REM Maven wrapper script for Windows - automatically downloads Maven if not present

setlocal enabledelayedexpansion

set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper"
set "MAVEN_VERSION=3.9.6"
set "MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"

REM Create .m2\wrapper directory if it doesn't exist
if not exist "%MAVEN_HOME%" (
    mkdir "%MAVEN_HOME%"
)

REM Check if Maven is already downloaded
if not exist "%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%" (
    echo Downloading Maven %MAVEN_VERSION%...
    
    REM Download Maven using PowerShell
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%MAVEN_URL%', '%MAVEN_HOME%\maven.zip')"
    
    if errorlevel 1 (
        echo Failed to download Maven. Please install it manually from https://maven.apache.org/download.cgi
        exit /b 1
    )
    
    echo Extracting Maven...
    cd /d "%MAVEN_HOME%"
    powershell -NoProfile -Command "Expand-Archive -Path maven.zip -DestinationPath . ; Remove-Item maven.zip"
    echo Maven installed successfully!
)

REM Set up Maven home and run
set "MAVEN_HOME=%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%"
set "PATH=%MAVEN_HOME%\bin;%PATH%"

REM Run Maven with passed arguments
"%MAVEN_HOME%\bin\mvn.cmd" %*
endlocal
