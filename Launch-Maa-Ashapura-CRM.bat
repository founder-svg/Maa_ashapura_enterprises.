@echo off
title Maa Ashapura Enterprise - LPG CRM & GST Billing
echo ========================================================
echo Starting Maa Ashapura Enterprise LPG SaaS CRM...
echo ========================================================
echo.
echo Opening browser at http://localhost:5173/
start http://localhost:5173/
echo.
cmd /c npm run dev
pause
