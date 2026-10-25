Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = WScript.Arguments(2)
cmd = """" & WScript.Arguments(0) & """ """ & WScript.Arguments(1) & """"
WshShell.Run cmd, 0, False
