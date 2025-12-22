Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
pythonwPath = "pythonw.exe"
scriptPath = scriptDir & "\ScreenDraw.py"

' pythonw.exe로 직접 실행 (콘솔 창 없이, 0 = 숨김)
WshShell.Run """" & pythonwPath & """ """ & scriptPath & """", 0, False
Set WshShell = Nothing
Set fso = Nothing

