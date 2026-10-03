@echo off
if not defined JAVA_HOME (
  if exist "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot" set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin\mvn.cmd" (
  "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin\mvn.cmd" %*
) else (
  mvn %*
)
