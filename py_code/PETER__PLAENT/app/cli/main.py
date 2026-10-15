def show_header():
    """Show the application name, version, and tagline."""
    print("Peter Planet CLI v0.1.0")
    print("One Vision. One AI Team. One Planet.")
    print()


def show_status():
    """Show the honest system status."""
    print("System Status")
    print("  Application: Ready")
    print("  Python CLI: Active")
    print("  AI Engine: Not connected")
    print("  Google: Not connected")
    print("  YouTube: Not connected")
    print("  Database: Not connected")
    print()


def show_menu():
    """Show the main menu."""
    print("Main Menu")
    print("  1. System Status")
    print("  2. About Peter Planet")
    print("  0. Exit")
    print()


def show_about():
    """Show a short explanation of Peter Planet."""
    print("About Peter Planet")
    print("Peter Planet is a local-first personal assistant project.")
    print("It starts with a command-line interface and a SQLite database.")
    print("AI integrations are optional and disabled by default.")
    print()


def choose_choice(choice):
    """Handle menu choices in a small, readable function."""
    if choice == "1":
        show_status()
    elif choice == "2":
        show_about()
    elif choice == "0":
        print("Goodbye.")
    else:
        print("Invalid choice. Please enter 0, 1, or 2.")


def main():
    """Run the first Peter Planet CLI menu."""
    show_header()

    while True:
        try:
            show_menu()

            choice = input("Select an option: ").strip()

            if not choice:
                print("Invalid choice. Please enter 0, 1, or 2.")
                continue

            choose_choice(choice)

            if choice == "0":
                break

        except (KeyboardInterrupt, EOFError):
            print()
            print("Goodbye.")
            break


if __name__ == "__main__":
    main()

