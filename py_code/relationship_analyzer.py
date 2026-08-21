# import customtkinter as ctk
# import hashlib

# # -------------------------------
# # APP SETTINGS
# # -------------------------------
# ctk.set_appearance_mode("dark")
# ctk.set_default_color_theme("blue")

# # -------------------------------
# # SCORE GENERATOR
# # -------------------------------
# def generate_score(name1, name2, category):
#     text = f"{name1.lower()}-{name2.lower()}-{category}"
#     hash_value = hashlib.md5(text.encode()).hexdigest()
#     return (int(hash_value[:8], 16) % 51) + 50


# def get_message(score):
#     if score >= 90:
#         return "🌟 Perfect Match!"
#     elif score >= 80:
#         return "❤️ Strong Connection!"
#     elif score >= 70:
#         return "😊 Good Compatibility!"
#     elif score >= 60:
#         return "👍 Decent Potential!"
#     else:
#         return "🤔 Needs More Understanding!"


# # -------------------------------
# # CALCULATE BUTTON
# # -------------------------------
# def calculate():
#     name1 = name1_entry.get().strip()
#     name2 = name2_entry.get().strip()
#     category = category_menu.get()

#     if not name1 or not name2:
#         result_label.configure(text="⚠ Please enter both names")
#         return

#     score = generate_score(name1, name2, category)

#     score_label.configure(text=f"{score}%")
#     result_label.configure(text=get_message(score))

#     progress.set(score / 100)

#     details_label.configure(
#         text=f"👤 {name1}  ❤️  {name2}\n\n📊 {category}: {score}%"
#     )


# # -------------------------------
# # MAIN WINDOW
# # -------------------------------
# app = ctk.CTk()
# app.title("❤️ Relationship Analyzer")
# app.geometry("700x650")
# app.resizable(False, False)

# # -------------------------------
# # HEADER
# # -------------------------------
# title = ctk.CTkLabel(
#     app,
#     text="❤️ Relationship Analyzer ❤️",
#     font=("Arial", 28, "bold")
# )
# title.pack(pady=20)

# # -------------------------------
# # CARD FRAME
# # -------------------------------
# frame = ctk.CTkFrame(app, corner_radius=20)
# frame.pack(padx=20, pady=10, fill="both", expand=True)

# # -------------------------------
# # NAME INPUTS
# # -------------------------------
# name1_entry = ctk.CTkEntry(
#     frame,
#     placeholder_text="Enter Your Name",
#     width=400,
#     height=45
# )
# name1_entry.pack(pady=(30, 10))

# name2_entry = ctk.CTkEntry(
#     frame,
#     placeholder_text="Enter Partner Name",
#     width=400,
#     height=45
# )
# name2_entry.pack(pady=10)

# # -------------------------------
# # CATEGORY DROPDOWN
# # -------------------------------
# category_menu = ctk.CTkOptionMenu(
#     frame,
#     values=[
#         "Love",
#         "Marriage",
#         "Friendship",
#         "Trust",
#         "Crush",
#         "Compatibility"
#     ],
#     width=250
# )
# category_menu.pack(pady=20)

# # -------------------------------
# # BUTTON
# # -------------------------------
# calculate_btn = ctk.CTkButton(
#     frame,
#     text="❤️ Calculate",
#     width=250,
#     height=45,
#     command=calculate
# )
# calculate_btn.pack(pady=15)

# # -------------------------------
# # SCORE
# # -------------------------------
# score_label = ctk.CTkLabel(
#     frame,
#     text="0%",
#     font=("Arial", 50, "bold")
# )
# score_label.pack(pady=10)

# # -------------------------------
# # PROGRESS BAR
# # -------------------------------
# progress = ctk.CTkProgressBar(frame, width=400)
# progress.pack(pady=10)
# progress.set(0)

# # -------------------------------
# # RESULT TEXT
# # -------------------------------
# result_label = ctk.CTkLabel(
#     frame,
#     text="Enter names and calculate",
#     font=("Arial", 18)
# )
# result_label.pack(pady=10)

# details_label = ctk.CTkLabel(
#     frame,
#     text="",
#     font=("Arial", 16)
# )
# details_label.pack(pady=20)

# # -------------------------------
# # FOOTER
# # -------------------------------
# footer = ctk.CTkLabel(
#     app,
#     text="Made with Python + CustomTkinter",
#     font=("Arial", 12)
# )
# footer.pack(pady=10)

# app.mainloop()


# ==========================================
# RELATIONSHIP ANALYZER
# Version: 1.0
# Author: Sagar
#
# Description:
# Fun relationship analyzer application.
# Generates compatibility scores based on
# user names and selected category.
# ==========================================


# ==========================================
# IMPORT LIBRARIES
# ==========================================
import hashlib
import customtkinter as ctk


# ==========================================
# APPLICATION SETTINGS
# ==========================================
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


# ==========================================
# SCORE ENGINE
# ==========================================
class ScoreEngine:
    """
    Handles score generation and result messages.
    """

    @staticmethod
    def generate_score(name1, name2, category):
        """
        Generate a consistent score.

        Same names and category
        will always return the same result.
        """

        text = f"{name1.lower()}-{name2.lower()}-{category}"

        hash_value = hashlib.md5(
            text.encode()
        ).hexdigest()

        return (int(hash_value[:8], 16) % 51) + 50

    @staticmethod
    def get_message(score):

        if score >= 90:
            return "🌟 Perfect Match!"

        elif score >= 80:
            return "❤️ Strong Connection!"

        elif score >= 70:
            return "😊 Good Compatibility!"

        elif score >= 60:
            return "👍 Decent Potential!"

        return "🤔 Needs More Understanding!"


# ==========================================
# MAIN APPLICATION
# ==========================================
class RelationshipAnalyzerApp:

    def __init__(self):

        # -----------------------------
        # Create Main Window
        # -----------------------------
        self.app = ctk.CTk()

        self.app.title(
            "Relationship Analyzer"
        )

        self.app.geometry(
            "700x650"
        )

        self.app.resizable(
            False,
            False
        )

        # Build UI
        self.create_widgets()

    # ======================================
    # UI CREATION
    # ======================================
    def create_widgets(self):

        # Header
        self.title_label = ctk.CTkLabel(
            self.app,
            text="❤️ Relationship Analyzer ❤️",
            font=("Arial", 28, "bold")
        )

        self.title_label.pack(
            pady=20
        )

        # Main Card
        self.frame = ctk.CTkFrame(
            self.app,
            corner_radius=20
        )

        self.frame.pack(
            padx=20,
            pady=10,
            fill="both",
            expand=True
        )

        # Name Inputs
        self.name1_entry = ctk.CTkEntry(
            self.frame,
            placeholder_text="Enter Your Name",
            width=400,
            height=45
        )

        self.name1_entry.pack(
            pady=(30, 10)
        )

        self.name2_entry = ctk.CTkEntry(
            self.frame,
            placeholder_text="Enter Partner Name",
            width=400,
            height=45
        )

        self.name2_entry.pack(
            pady=10
        )

        # Category Selection
        self.category_menu = ctk.CTkOptionMenu(
            self.frame,
            values=[
                "Love",
                "Marriage",
                "Friendship",
                "Trust",
                "Crush",
                "Compatibility"
            ]
        )

        self.category_menu.pack(
            pady=20
        )

        # Calculate Button
        self.calculate_button = ctk.CTkButton(
            self.frame,
            text="❤️ Calculate",
            command=self.calculate
        )

        self.calculate_button.pack(
            pady=15
        )

        # Score Display
        self.score_label = ctk.CTkLabel(
            self.frame,
            text="0%",
            font=("Arial", 50, "bold")
        )

        self.score_label.pack(
            pady=10
        )

        # Progress Bar
        self.progress = ctk.CTkProgressBar(
            self.frame,
            width=400
        )

        self.progress.pack(
            pady=10
        )

        self.progress.set(0)

        # Result Message
        self.result_label = ctk.CTkLabel(
            self.frame,
            text="Enter names and calculate",
            font=("Arial", 18)
        )

        self.result_label.pack(
            pady=10
        )

        # Details
        self.details_label = ctk.CTkLabel(
            self.frame,
            text=""
        )

        self.details_label.pack(
            pady=20
        )

        # Footer
        self.footer = ctk.CTkLabel(
            self.app,
            text="Made with Python"
        )

        self.footer.pack(
            pady=10
        )

    # ======================================
    # CALCULATE EVENT
    # ======================================
    def calculate(self):

        name1 = self.name1_entry.get().strip()
        name2 = self.name2_entry.get().strip()

        category = self.category_menu.get()

        # Validation
        if not name1 or not name2:

            self.result_label.configure(
                text="⚠ Please enter both names"
            )

            return

        # Generate Score
        score = ScoreEngine.generate_score(
            name1,
            name2,
            category
        )

        # Update UI
        self.score_label.configure(
            text=f"{score}%"
        )

        self.progress.set(
            score / 100
        )

        self.result_label.configure(
            text=ScoreEngine.get_message(
                score
            )
        )

        self.details_label.configure(
            text=(
                f"👤 {name1} ❤️ {name2}\n\n"
                f"📊 {category}: {score}%"
            )
        )

    # ======================================
    # START APPLICATION
    # ======================================
    def run(self):
        self.app.mainloop()


# ==========================================
# APPLICATION ENTRY POINT
# ==========================================
if __name__ == "__main__":

    app = RelationshipAnalyzerApp()
    app.run()