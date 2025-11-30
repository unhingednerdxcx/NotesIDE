


def sett(main, submain, value):
    match main:
        case "theme":
            setting('s', main, submain, value)
        case _:
            setting('s', main, submain)