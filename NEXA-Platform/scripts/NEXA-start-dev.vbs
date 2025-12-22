Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 배치 파일 경로
batPath = scriptDir & "\NEXA-start-dev.bat"

' 콘솔 창 없이 실행 (0 = 숨김, 1 = 일반, 2 = 최소화)
WshShell.Run """" & batPath & """", 0, False

Set WshShell = Nothing
Set fso = Nothing

