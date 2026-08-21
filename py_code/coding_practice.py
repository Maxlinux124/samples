import time
import random
from colorama import init, Fore

init(autoreset=True)

snippets = [

"""for i in range(5):
    print(i)""",

"""def add(a, b):
    return a + b""",

"""name = input("Enter name: ")
print("Hello", name)""",

"""numbers = [1,2,3,4,5]

for n in numbers:
    print(n)""",

"""class User:

    def __init__(self,name):
        self.name = name

    def show(self):
        print(self.name)"""
]

code = random.choice(snippets)

print("\n" + "="*60)
print("        CODE TYPE PRO")
print("="*60)

print("\nType the following code exactly:\n")

print(Fore.CYAN + code)

input("\nPress ENTER to start...")

start = time.time()

print("\nNow type the code line by line:\n")

typed_lines = []

for line in code.split("\n"):
    user_line = input("> ")
    typed_lines.append(user_line)

end = time.time()

typed_code = "\n".join(typed_lines)

# Accuracy
correct = 0

for a, b in zip(code, typed_code):
    if a == b:
        correct += 1

accuracy = (correct / len(code)) * 100

# Mistakes
mistakes = 0

for a, b in zip(code, typed_code):
    if a != b:
        mistakes += 1

mistakes += abs(len(code) - len(typed_code))

# WPM
minutes = (end - start) / 60

words = len(typed_code.split())

wpm = words / minutes if minutes > 0 else 0

print("\n" + "="*60)
print("RESULT")
print("="*60)

print(Fore.GREEN + f"Time      : {end-start:.2f} sec")
print(Fore.GREEN + f"WPM       : {wpm:.2f}")
print(Fore.GREEN + f"Accuracy  : {accuracy:.2f}%")
print(Fore.YELLOW + f"Mistakes  : {mistakes}")

if accuracy >= 95:
    print(Fore.GREEN + "\n🏆 Excellent")
elif accuracy >= 80:
    print(Fore.CYAN + "\n✅ Good")
else:
    print(Fore.RED + "\n⚠ Need More Practice")

print("="*60)