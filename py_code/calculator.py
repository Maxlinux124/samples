import tkinter as tk

# ---- Functions ----
def press(num):
    global expression
    expression = expression + str(num)
    equation.set(expression)

def equalpress():
    global expression
    try:
        # Eval use karke calculation solve karna
        total = str(eval(expression))
        # Agar result float hai aur .0 par khatam ho raha hai toh int me badlein
        if total.endswith('.0'):
            total = total[:-2]
        equation.set(total)
        expression = total
    except:
        equation.set("Error")
        expression = ""

def clear():
    global expression
    expression = ""
    equation.set("0")

def backspace():
    global expression
    expression = expression[:-1]
    if expression == "":
        equation.set("0")
    else:
        equation.set(expression)

# ---- UI Setup ----
root = tk.Tk()
root.title("Professional Calculator")
root.geometry("350x500")
root.configure(bg="#17171c") # Premium Dark Background
root.resizable(False, False)   # Window ka size fix rakhne ke liye

expression = ""
equation = tk.StringVar()
equation.set("0")

# ---- Display Screen ----
display_frame = tk.Frame(root, bg="#17171c")
display_frame.pack(expand=True, fill="both", padx=20, pady=(20, 10))

display = tk.Label(
    display_frame, 
    textvariable=equation, 
    font=("Helvetica", 36, "bold"), 
    bg="#17171c", 
    fg="#ffffff", 
    anchor="e", 
    padx=10
)
display.pack(expand=True, fill="both")

# ---- Buttons Frame ----
buttons_frame = tk.Frame(root, bg="#17171c")
buttons_frame.pack(expand=True, fill="both", padx=15, pady=(0, 20))

# Color Palette (Professional Dark Theme)
BG_NUMBER = "#2e2f38"    # Numbers ke liye dark grey
FG_NUMBER = "#ffffff"
BG_OPERATOR = "#4b5efc"  # Operators ke liye vibrant blue
FG_OPERATOR = "#ffffff"
BG_SPECIAL = "#4e505f"   # C aur Backspace ke liye light grey
FG_SPECIAL = "#ffffff"

# Hover Effects (Mouse le jaane par color change hona)
def on_enter(e, color):
    e.widget['background'] = color

def on_leave(e, color):
    e.widget['background'] = color

# Button Layout Matrix
# (Text, Row, Column, BG_Color, FG_Color, Action)
buttons_layout = [
    ('C', 0, 0, BG_SPECIAL, FG_SPECIAL, clear),
    ('⌫', 0, 1, BG_SPECIAL, FG_SPECIAL, backspace),
    ('%', 0, 2, BG_SPECIAL, FG_SPECIAL, lambda: press('%')),
    ('/', 0, 3, BG_OPERATOR, FG_OPERATOR, lambda: press('/')),
    
    ('7', 1, 0, BG_NUMBER, FG_NUMBER, lambda: press('7')),
    ('8', 1, 1, BG_NUMBER, FG_NUMBER, lambda: press('8')),
    ('9', 1, 2, BG_NUMBER, FG_NUMBER, lambda: press('9')),
    ('*', 1, 3, BG_OPERATOR, FG_OPERATOR, lambda: press('*')),
    
    ('4', 2, 0, BG_NUMBER, FG_NUMBER, lambda: press('4')),
    ('5', 2, 1, BG_NUMBER, FG_NUMBER, lambda: press('5')),
    ('6', 2, 2, BG_NUMBER, FG_NUMBER, lambda: press('6')),
    ('-', 2, 3, BG_OPERATOR, FG_OPERATOR, lambda: press('-')),
    
    ('1', 3, 0, BG_NUMBER, FG_NUMBER, lambda: press('1')),
    ('2', 3, 1, BG_NUMBER, FG_NUMBER, lambda: press('2')),
    ('3', 3, 2, BG_NUMBER, FG_NUMBER, lambda: press('3')),
    ('+', 3, 3, BG_OPERATOR, FG_OPERATOR, lambda: press('+')),
    
    ('0', 4, 0, BG_NUMBER, FG_NUMBER, lambda: press('0')),
    ('.', 4, 1, BG_NUMBER, FG_NUMBER, lambda: press('.')),
    ('=', 4, 2, BG_OPERATOR, FG_OPERATOR, equalpress) # Space cover karne ke liye column span badhayenge
]

# Grid configuration taaki buttons barabar failien
for i in range(5):
    buttons_frame.rowconfigure(i, weight=1, pad=5)
for i in range(4):
    buttons_frame.columnconfigure(i, weight=1, pad=5)

# Buttons ko create aur style karna
for (text, row, col, bg, fg, cmd) in buttons_layout:
    # Special case: '=' button ko thoda bada (2 columns wide) dikhane ke liye
    colspan = 2 if text == '=' else 1
    
    btn = tk.Button(
        buttons_frame, 
        text=text, 
        font=("Helvetica", 16, "bold"), 
        bg=bg, 
        fg=fg, 
        borderwidth=0, 
        activebackground=bg,
        activeforeground=fg,
        command=cmd,
        cursor="hand2" # Mouse pointer hand me badal jayega
    )
    btn.grid(row=row, column=col, columnspan=colspan, sticky="nsew", padx=4, pady=4)
    
    # Hover effect lagana
    # Agar normal color #2e2f38 hai toh hover par thoda light #3e404c ho jayega
    if bg == BG_NUMBER:
        hover_color = "#3e404c"
    elif bg == BG_OPERATOR:
        hover_color = "#6374ff"
    else:
        hover_color = "#626475"
        
    btn.bind("<Enter>", lambda e, h=hover_color: on_enter(e, h))
    btn.bind("<Leave>", lambda e, b=bg: on_leave(e, b))

root.mainloop()