"""Peter Planet CLI — first interactive menu.

Only Python standard library.
No internet. No AI. No database.
"""

APP_NAME = "Peter Planet CLI"
APP_VERSION = "v0.1.0"
TAGLINE = "One Vision. One AI Team. One Planet of Possibilities."

LINE = "=" * 56
THIN = "-" * 56


def show_header():
    """Show the application name, version, and tagline."""
    print(LINE)
    print(f"  {APP_NAME}  {APP_VERSION}")
    print(f"  {TAGLINE}")
    print(LINE)
    print()


def show_status():
    """Show the honest system status."""
    rows = [
        ("Application", "Ready"),
        ("Python CLI", "Active"),
        ("AI Engine", "Not connected"),
        ("Google", "Not connected"),
        ("YouTube", "Not connected"),
        ("Database", "Not connected"),
    ]

    print("System Status")
    print(THIN)
    for label, value in rows:
        print(f"  {label:<12} : {value}")
    print()


def show_menu():
    """Show the main menu."""
    print("Main Menu")
    print(THIN)
    print("  1. System Status")
    print("  2. About Peter Planet")
    print("  0. Exit")
    print()


def show_about():
    """Show a short explanation of Peter Planet."""
    print("About Peter Planet")
    print(THIN)
    print("  Peter Planet is a local-first personal assistant project.")
    print("  It starts with a command-line interface and a SQLite database.")
    print("  AI integrations are optional and disabled by default.")
    print()


def choose_choice(choice):
    """Handle menu choices in a small, readable function."""
    if choice == "1":
        show_status()
    elif choice == "2":
        show_about()
    elif choice == "0":
        print("Goodbye, friend. Peter is always here.")
        print()
    else:
        print("Invalid choice. Please enter 0, 1, or 2.")
        print()


def main():
    """Run the first Peter Planet CLI menu."""
    show_header()

    while True:
        try:
            show_menu()
            choice = input("Select an option: ").strip()

            if not choice:
                print("Invalid choice. Please enter 0, 1, or 2.")
                print()
                continue

            choose_choice(choice)

            if choice == "0":
                break

        except (KeyboardInterrupt, EOFError):
            print()
            print("Goodbye, friend. Peter is always here.")
            break


if __name__ == "__main__":
    main()
